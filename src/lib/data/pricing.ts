// Pricing data for Ôgast
// Architecture: typeface → package → tier × selected style count.
// EUR only — the foundry's single sale currency. No JPY/USD conversion.

// null = "Contact us" (Global tier — no self-serve price)
export type Price = number | null;

// ── Formatting ───────────────────────────────────────────────────────────────

export function formatPrice(price: Price): string {
	if (price === null) return 'Contact';
	return `€${price.toLocaleString('de-DE')}`;
}

// ── Tier curve ───────────────────────────────────────────────────────────────

export interface TierDef {
	index: number; // 1–7
	name: string; // Individual / Team / Studio / Agency / Brand / Firm / Global
	label: string; // company-size range shown to buyers
	// Machine-readable headcount ceiling for this tier — null only for
	// Individual (not headcount-derived, see getTierScope) and Global
	// (uncapped/Contact).
	maxHeadcount: number | null;
	// EUR per style, at this tier. The actual charge is this × however many
	// styles are selected (see computeEur) — buying the full set earns a 50%
	// discount off that per-style rate; anything less than the full set pays
	// the rate straight. null = Global — no self-serve rate, Contact only.
	perStyleEur: number | null;
}

// Per-style rate curve: 30, 50, 80, 130, 210, 340 — each step is the sum of
// the previous two (Fibonacci-style), given as three anchor points (30/50/80
// for Individual/Team/Studio) and continued in that same rhythm for
// Agency/Brand/Firm. Convex like the old multiplier curve was: small buyers
// stay close to the Individual rate, large organisations carry the revenue.
// Not a precise derivation — no real sales-mix data exists yet to calibrate
// against; revisit once purchases accumulate.
export const TIER_DEFS: TierDef[] = [
	{ index: 1, name: 'Individual', label: '1 person', maxHeadcount: 1, perStyleEur: 30 },
	{ index: 2, name: 'Team', label: 'Up to 5', maxHeadcount: 5, perStyleEur: 50 },
	{ index: 3, name: 'Studio', label: 'Up to 10', maxHeadcount: 10, perStyleEur: 80 },
	{ index: 4, name: 'Agency', label: 'Up to 50', maxHeadcount: 50, perStyleEur: 130 },
	{ index: 5, name: 'Brand', label: 'Up to 100', maxHeadcount: 100, perStyleEur: 210 },
	{ index: 6, name: 'Firm', label: 'Up to 500', maxHeadcount: 500, perStyleEur: 340 },
	{ index: 7, name: 'Global', label: '500+', maxHeadcount: null, perStyleEur: null }
];

// Individual is the one tier scoped to desktop-only use (print, PDF, locally
// installed applications) — same narrow scope as before. Team and above
// bundle full commercial use — web embedding, app/game embedding, and
// broadcast/streaming — into that same per-style rate; there is no separate
// Web / App / Books purchase any more.
export type TierScope = 'desktop' | 'full';

export function getTierScope(tierIndex: number): TierScope {
	return tierIndex === 1 ? 'desktop' : 'full';
}

export const SCOPE_BLURB: Record<TierScope, string> = {
	desktop: 'Desktop use only — print, PDF, and locally installed applications.',
	full: 'Includes Desktop, Web, App, and Book License.'
};

export function getTierDef(tierIndex: number): TierDef | undefined {
	return TIER_DEFS.find((t) => t.index === tierIndex);
}

export function getTierLabel(tierIndex: number): string {
	return getTierDef(tierIndex)?.label ?? '';
}

export function getTierName(tierIndex: number): string {
	return getTierDef(tierIndex)?.name ?? '';
}

/** Global (no self-serve rate) — not something to silently price as free. */
export function isEnterpriseTier(tierIndex: number): boolean {
	return getTierDef(tierIndex)?.perStyleEur === null;
}

// ── Package definitions ──────────────────────────────────────────────────────

export type TypefaceSlug = 'norma' | 'gq';

export interface PackageDef {
	id: string;
	label: string;
	// Styles / weights included (display only)
	detail: string;
	// The full style list — what "Complete Collection" selects, and the set
	// a buyer picks a custom subset from.
	styles?: string[];
	// Whether each weight also ships an Italic. When true, the style list renders as a
	// 2-column layout (upright left, italic right). gQ has no italics.
	italic?: boolean;
	// Buyer selects individual styles. The StyleList renders as toggleable chips.
	selectable?: boolean;
	// Reference-only "from" price for marketing teasers (fonts list / detail
	// pages) — the cheapest real entry point: Individual tier's own
	// per-style rate, for a single style (no collection discount applied).
	// Not used in the actual checkout computation (see computeEur), which
	// always derives from tier × selected style count.
	baseEur: number;
}

export interface TypefacePricing {
	slug: TypefaceSlug;
	packages: PackageDef[];
}

// Norma ships 20 numeric weights (name × 10 = wght; 40 = Book, 95 = Ultra),
// upright only — a single weight axis from Hairline to Ultra.
// (No italic masters yet; do not advertise italics until they actually ship.)
export const STEINER_WEIGHTS: string[] = [
	'1', '5', '10', '15', '20', '25', '30', '35', '40', '45',
	'50', '55', '60', '65', '70', '75', '80', '85', '90', '95'
];

export const TYPEFACE_PRICING: TypefacePricing[] = [
	{
		slug: 'norma',
		packages: [
			{
				id: 'norma-complete',
				label: 'Norma',
				detail: '20 weights — Hairline to Ultra',
				styles: STEINER_WEIGHTS,
				italic: false,
				selectable: true,
				// Individual tier's own per-style rate — the cheapest single entry
				// point, before any collection discount.
				baseEur: 30
			}
		]
	}
	// gq: in development — not for sale yet
];

export function getTypefacePricing(slug: TypefaceSlug): TypefacePricing | undefined {
	return TYPEFACE_PRICING.find((tp) => tp.slug === slug);
}

export function getPackage(slug: TypefaceSlug, packageId: string): PackageDef | undefined {
	return getTypefacePricing(slug)?.packages.find((p) => p.id === packageId);
}

// ── Price calculation ────────────────────────────────────────────────────────
//
// Two-step volume discount off the tier's per-style rate: buying every
// style (Complete Collection) earns 50% off; buying at least half the set
// (a hand-picked subset of 10+) earns 25% off; anything less pays the rate
// straight. 25% is deliberately the midpoint of 0% and 50%, not a separate
// number pulled from nowhere — a plain, common discount step buyers already
// read as "a real bulk discount" without a new number to explain. Same
// total price either way buys you either all 20 styles or 10 of them at
// the full-set tier — a deliberate nudge toward Complete, not a coincidence.

const FULL_SET_DISCOUNT = 0.5;
const HALF_SET_DISCOUNT = 0.25;

// The discount rate for a given package × selected style count — 0 below
// half the set, HALF_SET_DISCOUNT from half up to (not including) the full
// set, FULL_SET_DISCOUNT at the full set.
function discountRateFor(pkg: PackageDef, styleCount: number): number {
	const total = pkg.styles?.length ?? 0;
	if (total === 0 || styleCount <= 0) return 0;
	if (styleCount >= total) return FULL_SET_DISCOUNT;
	if (styleCount >= total / 2) return HALF_SET_DISCOUNT;
	return 0;
}

// Gross EUR for a given package × tier × selected style count, before any
// volume discount — the "was" price shown struck through when a discount
// applies. Returns null for the Global tier (no self-serve rate).
export function computeGrossEur(pkg: PackageDef, tierIndex: number, styleCount: number): Price {
	const tier = getTierDef(tierIndex);
	if (!tier || tier.perStyleEur === null || styleCount <= 0) return null;
	return Math.round(tier.perStyleEur * styleCount);
}

// Final EUR — the gross price, reduced by whichever volume discount the
// selected style count qualifies for (see discountRateFor).
export function computeEur(pkg: PackageDef, tierIndex: number, styleCount: number): Price {
	const gross = computeGrossEur(pkg, tierIndex, styleCount);
	if (gross === null) return null;
	const rate = discountRateFor(pkg, styleCount);
	return rate > 0 ? Math.round(gross * (1 - rate)) : gross;
}

export function getPrice(pkg: PackageDef, tierIndex: number, styleCount: number): Price {
	return computeEur(pkg, tierIndex, styleCount);
}

export function getGrossPrice(pkg: PackageDef, tierIndex: number, styleCount: number): Price {
	return computeGrossEur(pkg, tierIndex, styleCount);
}

// The per-style rate alone (no count, no discount) — what Step 1's intake
// preview shows, since it resolves a tier before Step 3 has picked any
// styles yet.
export function getPerStylePrice(tierIndex: number): Price {
	return getTierDef(tierIndex)?.perStyleEur ?? null;
}

// ── Project / Client License ─────────────────────────────────────────────────
// Flat-priced, single-brand-scoped licence for a design studio or agency
// buying on behalf of one client. Full scope (desktop/web/app/broadcast) like
// Team-and-above, but restricted to one named brand identity — not
// transferable to the buyer's other projects or clients. Priced independent
// of both the agency's own tier and the client's company size: a narrower
// product, not a discount off either. Unaffected by the per-style pricing
// above — always this one flat number, whatever the client wants delivered.
export const PROJECT_LICENSE_EUR = 600;
export const PROJECT_LICENSE_LABEL = 'Project License';
export const PROJECT_LICENSE_BLURB =
	'For a studio or agency buying on behalf of one client. Full commercial use, scoped to a single brand identity — not a company-wide licence.';

// ── Flat package list for the Select Fonts section ───────────────────────────

// IDs excluded from the "Select Fonts" flat listing
const EXCLUDED_FROM_FLAT: string[] = [];

export interface FlatPackage extends PackageDef {
	typefaceSlug: TypefaceSlug;
}

/** Returns all purchasable packages across typefaces in display order, excluding single-weight. */
export function getFlatPackages(): FlatPackage[] {
	const result: FlatPackage[] = [];
	for (const tf of TYPEFACE_PRICING) {
		for (const pkg of tf.packages) {
			if (!EXCLUDED_FROM_FLAT.includes(pkg.id)) {
				result.push({ ...pkg, typefaceSlug: tf.slug });
			}
		}
	}
	return result;
}
