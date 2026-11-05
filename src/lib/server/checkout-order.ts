// Turns the /buy checkout form into a validated, server-priced order.
//
// The form only declares WHAT is being bought; every price is recomputed here
// from $lib/data/pricing, so a tampered form cannot change the charge. An order
// holds one licence (one organisation, one tier) over one or more typefaces,
// each with its own selected styles (2026-11-05, "buy other typefaces too").
// Pure function of the form data so it unit-tests without any network.
import {
	getFlatPackages,
	getGrossPrice,
	getPrice,
	getTierLabel,
	getTierName,
	decodeStyleField,
	PROJECT_LICENSE_EUR,
	PROJECT_LICENSE_LABEL,
	type PackageDef
} from '$lib/data/pricing';
import { computeTotal } from '$lib/data/discounts';
import type { CartItem, CartItemKind } from '$lib/data/discounts';

const MAX_NAME_LENGTH = 200;
/** Tier 1 (Individual) names no organisation; every tier above it must. */
const FIRST_ORGANISATION_TIER = 2;

export interface OrderLine {
	pkg: PackageDef;
	/** Selected styles, unique, in the form's order. Empty for a Project License. */
	styles: string[];
}

export interface Order {
	items: CartItem[];
	lines: OrderLine[];
	/** One human-readable line per item, for Stripe's description and metadata. */
	descriptions: string[];
	isStudent: boolean;
	licenseeName: string;
	clientName: string;
	/** The one tier of the order (null when it holds only a Project License). */
	tierIndex: number | null;
	total: number;
}

export type OrderResult =
	| { ok: true; order: Order }
	| { ok: false; status: number; message: string };

const refuse = (message: string, status = 400): OrderResult => ({ ok: false, status, message });

function clean(value: FormDataEntryValue | null): string {
	return String(value ?? '')
		.trim()
		.slice(0, MAX_NAME_LENGTH);
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

export function buildOrder(
	data: FormData,
	catalogue: PackageDef[] = getFlatPackages()
): OrderResult {
	const isStudent = data.get('educational') === '1';
	const licenseeName = clean(data.get('licensee_name'));
	// Project License isn't reachable from the current /buy intake form (see
	// LicenseIntake) — kept so the server still handles it correctly if that
	// path is reintroduced.
	const clientName = clean(data.get('client_name'));

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
		const kind = kinds[i] as CartItemKind;
		if (kind !== 'tier' && kind !== 'project') return refuse('Invalid license selection.');

		const pkg = catalogue.find((p) => p.id === (packageIds[i] ?? fallbackId));
		if (!pkg || seen.has(pkg.id)) return refuse('Invalid license selection.');
		seen.add(pkg.id);

		// Selected styles must be real styles of this package: a tampered form
		// can't invent styles or inflate/deflate the count.
		const styles = stylesOf.get(pkg.id) ?? [];
		const valid = new Set(pkg.styles ?? []);
		if (styles.some((s) => !valid.has(s))) return refuse('Invalid style selection.');

		if (kind === 'project') {
			// Project License needs both the purchasing studio/agency and the
			// named client Brand on record — the Sales Receipt's Purchaser/Brand.
			if (!licenseeName || !clientName) {
				return refuse('A Project License needs your studio name and a client name.');
			}
			items.push({
				kind: 'project',
				tierIndex: null,
				basePrice: PROJECT_LICENSE_EUR,
				grossPrice: PROJECT_LICENSE_EUR,
				packageId: pkg.id
			});
			lines.push({ pkg, styles: [] });
			descriptions.push(`${PROJECT_LICENSE_LABEL} — ${licenseeName} for ${clientName}`);
			continue;
		}

		const tier = Number(tiersRaw[i]);
		if (!Number.isInteger(tier)) return refuse('Invalid license selection.');
		// One licence per order: every typeface in it is priced at the same tier.
		if (tierIndex !== null && tier !== tierIndex) return refuse('Invalid license selection.');
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
			return refuse('This scale requires a custom quote — please contact us.');
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
		if (!seen.has(id)) return refuse('Invalid style selection.');
	}

	const pkgs = lines.map((l) => l.pkg);
	const { total } = computeTotal({ items, isStudent, packageDef: pkgs[0], packageDefs: pkgs });
	if (total <= 0) return refuse('Invalid order total.');

	return {
		ok: true,
		order: { items, lines, descriptions, isStudent, licenseeName, clientName, tierIndex, total }
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
