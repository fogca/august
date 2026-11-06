// Turns the /buy checkout form into a validated, server-priced order.
//
// The form only declares WHAT is being bought; every price is recomputed here
// from $lib/data/pricing, so a tampered form cannot change the charge. An order
// is one licence — one licensee, one size — over one or more typefaces, each
// with its own selected styles (2026-11-05). For a typeface sold with toppings
// (2026-11-06) the licence also carries the licensee's uses beyond ordinary
// design work (logo, web, social, add-ons), priced into every style, the
// website domains the Web topping is registered for, and the subcontractors the
// fonts are shared with.
// Pure function of the form data so it unit-tests without any network.
import {
	getFlatPackages,
	getGrossPrice,
	getPrice,
	getTierLabel,
	getTierName,
	getToppingOption,
	decodeStyleField,
	MAX_SUBCONTRACTORS,
	MAX_WEB_DOMAINS,
	normalizeDomain,
	SUB_LICENSE_EUR,
	unavailableStyles,
	type PackageDef,
	type Use
} from '$lib/data/pricing';
import { computeTotal } from '$lib/data/discounts';
import type { CartItem } from '$lib/data/discounts';

const MAX_NAME_LENGTH = 200;
/** The uses field is JSON typed by the page; anything bigger is not from it. */
const MAX_USES_JSON_LENGTH = 2_000;

export interface OrderLine {
	pkg: PackageDef;
	/** Selected styles, unique, in the form's order. */
	styles: string[];
}

export interface Order {
	items: CartItem[];
	lines: OrderLine[];
	/** The licence's toppings (empty for a typeface sold bundled). */
	uses: Use[];
	/** The domains the Web topping is registered for. */
	webDomains: string[];
	subcontractors: number;
	/** One human-readable line per item, for Stripe's description and metadata. */
	descriptions: string[];
	isStudent: boolean;
	licenseeName: string;
	/** The one tier of the order (the licensee's size). */
	tierIndex: number | null;
	total: number;
}

export type OrderResult =
	| { ok: true; order: Order }
	| { ok: false; status: number; message: string };

const refuse = (message: string, status = 400): OrderResult => ({ ok: false, status, message });
const INVALID_LICENSE = 'Invalid license selection.';
const INVALID_STYLES = 'Invalid style selection.';
const CUSTOM_QUOTE = 'This scale requires a custom quote — please contact us.';

function clean(value: unknown): string {
	return String(value ?? '')
		.trim()
		.slice(0, MAX_NAME_LENGTH);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The selected styles of each package. A value with no package (the form as it
 *  was before orders could hold several typefaces) belongs to `fallbackId`. */
function groupStyles(values: string[], fallbackId: string): Map<string, string[]> {
	const byPackage = new Map<string, string[]>();
	for (const value of values) {
		const { packageId, style } = decodeStyleField(value);
		const id = packageId ?? fallbackId;
		const list = byPackage.get(id) ?? [];
		if (!list.includes(style)) list.push(style);
		byPackage.set(id, list);
	}
	return byPackage;
}

/** The licence's toppings from the form: unique and known, or null if not. */
function parseUses(raw: string): Use[] | null {
	if (!raw) return [];
	if (raw.length > MAX_USES_JSON_LENGTH) return null;
	let list: unknown;
	try {
		list = JSON.parse(raw);
	} catch {
		return null;
	}
	if (!Array.isArray(list)) return null;
	const uses: Use[] = [];
	for (const entry of list) {
		if (!isRecord(entry)) return null;
		const found = getToppingOption(String(entry.topping), String(entry.option));
		if (!found || uses.some((u) => u.topping === found.topping.id)) return null;
		uses.push({ topping: found.topping.id, option: found.option.id });
	}
	return uses;
}

/** The registered domains: real hosts, unique, no more than the topping allows. */
function parseDomains(values: string[]): string[] | null {
	const domains: string[] = [];
	for (const value of values) {
		if (!value.trim()) continue;
		const host = normalizeDomain(value);
		if (!host) return null;
		if (!domains.includes(host)) domains.push(host);
	}
	return domains.length > MAX_WEB_DOMAINS ? null : domains;
}

function describeLine(line: OrderLine, tierIndex: number, licensee: string, several: boolean) {
	const count = line.styles.length;
	const base = `${getTierName(tierIndex)} (${getTierLabel(tierIndex)}) — ${count} style${count === 1 ? '' : 's'}`;
	return `${several ? `${line.pkg.label} — ` : ''}${base} — ${licensee}`;
}

/** The licence's toppings, for Stripe and the fulfilment record. */
export function describeUses(uses: Use[]): string {
	return uses
		.map((use) => getToppingOption(use.topping, use.option))
		.map((found) => (found ? `${found.topping.label} (${found.option.label})` : ''))
		.filter(Boolean)
		.join(', ');
}

export function buildOrder(
	data: FormData,
	catalogue: PackageDef[] = getFlatPackages()
): OrderResult {
	const isStudent = data.get('educational') === '1';
	const licenseeName = clean(data.get('licensee_name'));
	if (!licenseeName)
		return refuse('Please enter the licensee — the company or person the licence is for.');
	if (data.get('eula') !== '1') return refuse('Please accept the EULA to complete your purchase.');

	const kinds = data.getAll('item_kind').map(String);
	const tiersRaw = data.getAll('item_tier').map(String);
	const packageIds = data.getAll('item_package').map(String);
	if (kinds.length === 0) return refuse('No license selected.');

	const uses = parseUses(String(data.get('uses') ?? '').trim());
	if (!uses) return refuse(INVALID_LICENSE);

	// The package each item prices — the form says so per item.
	const fallbackId = packageIds[0] ?? catalogue[0]?.id ?? '';
	const stylesOf = groupStyles(data.getAll('selected_style').map(String), fallbackId);

	const several = kinds.length > 1;
	const items: CartItem[] = [];
	const lines: OrderLine[] = [];
	const descriptions: string[] = [];
	const seen = new Set<string>();
	let tierIndex: number | null = null;

	for (let i = 0; i < kinds.length; i++) {
		if (kinds[i] !== 'tier') return refuse(INVALID_LICENSE);

		const pkg = catalogue.find((p) => p.id === (packageIds[i] ?? fallbackId));
		if (!pkg || seen.has(pkg.id)) return refuse(INVALID_LICENSE);
		seen.add(pkg.id);

		// Selected styles must be real styles of this package: a tampered form
		// can't invent styles or inflate/deflate the count.
		const styles = stylesOf.get(pkg.id) ?? [];
		const valid = new Set(pkg.styles ?? []);
		if (styles.some((s) => !valid.has(s))) return refuse(INVALID_STYLES);
		// A style not drawn yet is only had with the whole Complete Collection.
		const notYetDrawn = new Set(unavailableStyles(pkg));
		if (styles.some((s) => notYetDrawn.has(s)) && styles.length !== (pkg.styles?.length ?? 0)) {
			return refuse('A style that is not drawn yet comes with the Complete Collection.');
		}
		if (styles.length < 1) {
			return refuse(
				several
					? 'Please select at least one style for each typeface.'
					: 'Please select at least one style.'
			);
		}

		const tier = Number(tiersRaw[i]);
		if (!Number.isInteger(tier)) return refuse(INVALID_LICENSE);
		// One licence per order: every typeface in it is priced at the same tier.
		if (tierIndex !== null && tier !== tierIndex) return refuse(INVALID_LICENSE);
		tierIndex = tier;

		// The toppings ride on a typeface sold with them; one sold bundled
		// already covers web and app, so they don't touch its price.
		const lineUses = pkg.licensing === 'toppings' ? uses : [];
		const price = getPrice(pkg, tier, styles.length, lineUses);
		const gross = getGrossPrice(pkg, tier, styles.length, lineUses);
		if (price === null || gross === null) {
			// Global tier — handled via /contact, not self-serve checkout
			return refuse(CUSTOM_QUOTE);
		}
		const line = { pkg, styles };
		items.push({
			kind: 'tier',
			tierIndex: tier,
			basePrice: price,
			grossPrice: gross,
			packageId: pkg.id
		});
		lines.push(line);
		descriptions.push(describeLine(line, tier, licenseeName, several));
	}

	// Styles sent for a package the order doesn't contain are a tampered form.
	for (const id of stylesOf.keys()) {
		if (!seen.has(id)) return refuse(INVALID_STYLES);
	}

	// Toppings with nothing sold with toppings to ride on are a tampered form.
	if (uses.length > 0 && !lines.some((l) => l.pkg.licensing === 'toppings')) {
		return refuse(INVALID_LICENSE);
	}
	if (uses.length > 0) descriptions.push(`Uses — ${describeUses(uses)}`);

	// The Web topping's domains (ignored without it).
	const domains = parseDomains(data.getAll('web_domain').map(String));
	if (!domains) return refuse('Please check the website domains.');
	const webDomains = uses.some((u) => u.topping === 'web') ? domains : [];
	if (webDomains.length > 0) descriptions.push(`Web domains — ${webDomains.join(', ')}`);

	// ── Subcontractors ──
	const subRaw = String(data.get('subcontractors') ?? '0').trim() || '0';
	const subcontractors = Number(subRaw);
	if (
		!Number.isInteger(subcontractors) ||
		subcontractors < 0 ||
		subcontractors > MAX_SUBCONTRACTORS
	) {
		return refuse(INVALID_LICENSE);
	}
	if (subcontractors > 0) {
		const flat = subcontractors * SUB_LICENSE_EUR;
		items.push({ kind: 'sub', tierIndex: null, basePrice: flat, grossPrice: flat, packageId: '' });
		descriptions.push(`Subcontractors — ${subcontractors} × €${SUB_LICENSE_EUR}`);
	}

	const pkgs = lines.map((l) => l.pkg);
	const { total } = computeTotal({ items, isStudent, packageDef: pkgs[0], packageDefs: pkgs });
	if (total <= 0) return refuse('Invalid order total.');

	return {
		ok: true,
		order: {
			items,
			lines,
			uses,
			webDomains,
			subcontractors,
			descriptions,
			isStudent,
			licenseeName,
			tierIndex,
			total
		}
	};
}

/** Stripe's product name: the one typeface's full name, or all of them joined. */
export function orderProductName(order: Order): string {
	const [only] = order.lines;
	if (order.lines.length === 1) return `${only.pkg.label} — ${only.pkg.detail}`;
	return order.lines.map((l) => l.pkg.label).join(' + ');
}

/** What to deliver, for the Sales Receipt's fulfilment record: the bare style
 *  list for one typeface, "Name: styles" per typeface for several. */
export function orderStylesSummary(order: Order): string {
	if (order.lines.length === 1) return order.lines[0].styles.join(',');
	return order.lines
		.filter((l) => l.styles.length > 0)
		.map((l) => `${l.pkg.label}: ${l.styles.join(',')}`)
		.join(' / ');
}
