// Turns the /buy checkout form into a validated, server-priced order.
//
// The form only declares WHAT is being bought; every price is recomputed here
// from $lib/data/pricing, so a tampered form cannot change the charge. An order
// holds one licence (one organisation, one tier) over one or more typefaces,
// each with its own selected styles (2026-11-05), and — for a typeface sold
// with toppings (2026-11-06) — the brands that use it beyond ordinary design
// work (a logo, a website …), each with its own size and styles, plus the
// subcontractors the fonts are shared with.
// Pure function of the form data so it unit-tests without any network.
import {
	getFlatPackages,
	getGrossPrice,
	getPrice,
	getTierDef,
	getTierLabel,
	getTierName,
	getToppingOption,
	decodeStyleField,
	MAX_SUBCONTRACTORS,
	priceBrand,
	SUB_LICENSE_EUR,
	unavailableStyles,
	type BrandInput,
	type BrandUse,
	type PackageDef
} from '$lib/data/pricing';
import { computeTotal } from '$lib/data/discounts';
import type { CartItem } from '$lib/data/discounts';

const MAX_NAME_LENGTH = 200;
/** Tier 1 (Individual) names no organisation; every tier above it must. */
const FIRST_ORGANISATION_TIER = 2;
const MAX_BRANDS = 20;
/** The brands field is JSON typed by the page; anything bigger is not from it. */
const MAX_BRANDS_JSON_LENGTH = 40_000;

export interface OrderLine {
	pkg: PackageDef;
	/** Selected styles, unique, in the form's order. */
	styles: string[];
}

export interface OrderBrand extends BrandInput {
	/** What its uses cost, before any early-access factor. */
	price: number;
}

export interface Order {
	items: CartItem[];
	lines: OrderLine[];
	brands: OrderBrand[];
	subcontractors: number;
	/** One human-readable line per item, for Stripe's description and metadata. */
	descriptions: string[];
	isStudent: boolean;
	licenseeName: string;
	/** The one tier of the order (the buyer's size). */
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

function describeTier(
	pkg: PackageDef,
	tierIndex: number,
	styleCount: number,
	licensee: string,
	several: boolean
) {
	const plural = styleCount === 1 ? '' : 's';
	const base = `${getTierName(tierIndex)} (${getTierLabel(tierIndex)}) — ${styleCount} style${plural}`;
	return `${several ? `${pkg.label} — ` : ''}${base}${licensee ? ` — ${licensee}` : ''}`;
}

/** The unique, known uses of one brand, or null if any is not. */
function parseUses(raw: unknown): BrandUse[] | null {
	if (!Array.isArray(raw) || raw.length === 0) return null;
	const uses: BrandUse[] = [];
	for (const entry of raw) {
		if (!isRecord(entry)) return null;
		const found = getToppingOption(String(entry.topping), String(entry.option));
		if (!found || uses.some((u) => u.topping === found.topping.id)) return null;
		uses.push({ topping: found.topping.id, option: found.option.id });
	}
	return uses;
}

/** One brand from the form: its size, uses and styles, checked against what
 *  the order itself holds (a brand can only use styles the licence has). */
function parseBrand(raw: unknown, lines: OrderLine[]): OrderBrand | OrderResult {
	if (!isRecord(raw)) return refuse(INVALID_LICENSE);
	const name = clean(raw.name);
	if (!name) return refuse('Please name each brand.');

	const tierIndex = Number(raw.tier);
	const rate = Number.isInteger(tierIndex) ? getTierDef(tierIndex)?.perStyleEur : undefined;
	if (rate === undefined) return refuse(INVALID_LICENSE);
	if (rate === null) return refuse(CUSTOM_QUOTE);

	const uses = parseUses(raw.uses);
	if (!uses || !isRecord(raw.styles)) return refuse(INVALID_LICENSE);

	const styles: Record<string, string[]> = {};
	for (const [packageId, picked] of Object.entries(raw.styles)) {
		const line = lines.find((l) => l.pkg.id === packageId);
		if (!line || line.pkg.licensing !== 'toppings' || !Array.isArray(picked)) {
			return refuse(INVALID_STYLES);
		}
		const unique = [...new Set(picked.map(String))];
		// Only styles the licence holds, and only ones already drawn.
		const notYetDrawn = new Set(unavailableStyles(line.pkg));
		if (unique.some((s) => !line.styles.includes(s) || notYetDrawn.has(s))) {
			return refuse(INVALID_STYLES);
		}
		if (unique.length > 0) styles[packageId] = unique;
	}
	if (Object.keys(styles).length === 0) return refuse(INVALID_STYLES);

	const brand: BrandInput = { name, tierIndex, uses, styles };
	const price = priceBrand(brand).reduce((sum, line) => sum + line.price, 0);
	return { ...brand, price };
}

function describeBrand(brand: OrderBrand, lines: OrderLine[]): string {
	const uses = brand.uses
		.map((use) => getToppingOption(use.topping, use.option))
		.map((f) => (f ? `${f.topping.label} (${f.option.label})` : ''))
		.join(', ');
	const styles = Object.entries(brand.styles)
		.map(
			([id, list]) => `${lines.find((l) => l.pkg.id === id)?.pkg.label ?? id}: ${list.join(',')}`
		)
		.join('; ');
	return `Brand ${brand.name} (${getTierName(brand.tierIndex)}, ${getTierLabel(brand.tierIndex)}) — ${uses} — ${styles}`;
}

function parseBrands(data: FormData, lines: OrderLine[]): OrderBrand[] | OrderResult {
	const raw = String(data.get('brands') ?? '').trim();
	if (!raw) return [];
	if (raw.length > MAX_BRANDS_JSON_LENGTH) return refuse(INVALID_LICENSE);
	let list: unknown;
	try {
		list = JSON.parse(raw);
	} catch {
		return refuse(INVALID_LICENSE);
	}
	if (!Array.isArray(list) || list.length > MAX_BRANDS) return refuse(INVALID_LICENSE);

	const brands: OrderBrand[] = [];
	for (const entry of list) {
		const brand = parseBrand(entry, lines);
		if ('ok' in brand) return brand;
		brands.push(brand);
	}
	return brands;
}

export function buildOrder(
	data: FormData,
	catalogue: PackageDef[] = getFlatPackages()
): OrderResult {
	const isStudent = data.get('educational') === '1';
	const licenseeName = clean(data.get('licensee_name'));

	const kinds = data.getAll('item_kind').map(String);
	const tiersRaw = data.getAll('item_tier').map(String);
	const packageIds = data.getAll('item_package').map(String);
	if (kinds.length === 0) return refuse('No license selected.');

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

		const tier = Number(tiersRaw[i]);
		if (!Number.isInteger(tier)) return refuse(INVALID_LICENSE);
		// One licence per order: every typeface in it is priced at the same tier.
		if (tierIndex !== null && tier !== tierIndex) return refuse(INVALID_LICENSE);
		tierIndex = tier;

		if (styles.length < 1) {
			return refuse(
				several
					? 'Please select at least one style for each typeface.'
					: 'Please select at least one style in Step 2.'
			);
		}

		// Tier 1 (Individual, not currently offered by the intake form — see
		// LicenseIntake) needs no organisation name. Every other tier came from a
		// fixed-range select, not a freely typed number, so there's no separate
		// headcount to cross-check — just require the organisation is named.
		if (tier >= FIRST_ORGANISATION_TIER && !licenseeName) {
			return refuse('Please fill in your organisation name in Step 1.');
		}

		const price = getPrice(pkg, tier, styles.length);
		const gross = getGrossPrice(pkg, tier, styles.length);
		if (price === null || gross === null) {
			// Global tier — handled via /contact, not self-serve checkout
			return refuse(CUSTOM_QUOTE);
		}
		items.push({
			kind: 'tier',
			tierIndex: tier,
			basePrice: price,
			grossPrice: gross,
			packageId: pkg.id
		});
		lines.push({ pkg, styles });
		descriptions.push(describeTier(pkg, tier, styles.length, licenseeName, several));
	}

	// Styles sent for a package the order doesn't contain are a tampered form.
	for (const id of stylesOf.keys()) {
		if (!seen.has(id)) return refuse(INVALID_STYLES);
	}

	// ── Brands: what each does with the typefaces beyond ordinary design work ──
	const brands = parseBrands(data, lines);
	if ('ok' in brands) return brands;
	for (const brand of brands) {
		for (const line of priceBrand(brand)) {
			items.push({
				kind: 'topping',
				tierIndex: brand.tierIndex,
				basePrice: line.price,
				grossPrice: line.price,
				packageId: line.packageId
			});
		}
		descriptions.push(describeBrand(brand, lines));
	}

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
			brands,
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

/** The brands' licences, for the fulfilment record (empty when there are none). */
export function orderBrandsSummary(order: Order): string {
	return order.brands.map((brand) => describeBrand(brand, order.lines)).join(' / ');
}
