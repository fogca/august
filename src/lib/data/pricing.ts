// Pricing data for August Type Foundry
// Architecture: typeface → package → tier (one bundled licence per tier).
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
	// (uncapped/Contact). Used by resolveTierForHeadcount to derive a tier
	// from a declared usage headcount, instead of letting a buyer freely
	// browse and pick any tier regardless of their actual size.
	maxHeadcount: number | null;
	multiplier: number | null; // null = Contact
}

// 7-step multiplier curve (Tier 1 = ×1.0 base). Headcount breakpoints step
// ×5 / ×2 / ×5 / ×2 / ×5 (1 → 5 → 10 → 50 → 100 → 500); the multiplier
// mirrors that rhythm — roughly ×2.0 per ×5 headcount jump, ×1.5 per ×2
// jump — so a bigger jump in who's covered gets a proportionally bigger
// jump in price, not the flatter curve a straight reuse of the old
// breakpoints' multipliers would give once Studio's ceiling dropped to 10.
// Convex overall: individuals and small teams stay close to base, large
// organisations carry the revenue. One axis — company size — one price per
// tier: no separate Desktop / Web / App / Books purchase to choose between.
// Starting point, not a precise derivation — no real sales-mix data exists
// yet to calibrate against; revisit once purchases accumulate.
export const TIER_DEFS: TierDef[] = [
	{ index: 1, name: 'Individual', label: '1 person', maxHeadcount: 1, multiplier: 1.0 },
	{ index: 2, name: 'Team', label: 'up to 5', maxHeadcount: 5, multiplier: 2.0 },
	{ index: 3, name: 'Studio', label: 'up to 10', maxHeadcount: 10, multiplier: 3.0 },
	{ index: 4, name: 'Agency', label: 'up to 50', maxHeadcount: 50, multiplier: 6.0 },
	{ index: 5, name: 'Brand', label: 'up to 100', maxHeadcount: 100, multiplier: 9.0 },
	{ index: 6, name: 'Firm', label: 'up to 500', maxHeadcount: 500, multiplier: 18.0 },
	{ index: 7, name: 'Global', label: '500+', maxHeadcount: null, multiplier: null }
];

// Individual is the one tier scoped to desktop-only use (print, PDF, locally
// installed applications) — same narrow scope as before. Team and above
// bundle full commercial use — web embedding, app/game embedding, and
// broadcast/streaming — into that same single price; there is no separate
// Web / App / Books purchase any more.
export type TierScope = 'desktop' | 'full';

export function getTierScope(tierIndex: number): TierScope {
	return tierIndex === 1 ? 'desktop' : 'full';
}

export const SCOPE_BLURB: Record<TierScope, string> = {
	desktop: 'Desktop use only — print, PDF, and locally installed applications.',
	full: 'Full commercial use — desktop, web, app/game, and broadcast/streaming.'
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

// ── Package definitions ──────────────────────────────────────────────────────

export type TypefaceSlug = 'steiner' | 'gq' | 'atom';

export interface PackageDef {
	id: string;
	label: string;
	// Styles / weights included (display only)
	detail: string;
	// Pre-made style list — the weights bundled in (Roman + Italic each).
	// Steiner bundles are pre-made: the foundry fixes the included weights; the buyer does
	// not choose. Absent for gQ (individual sale — Single is buyer-chosen, Full = all weights).
	styles?: string[];
	// Whether each weight also ships an Italic. When true, the style list renders as a
	// 2-column layout (upright left, italic right). gQ has no italics.
	italic?: boolean;
	// Buyer selects individual styles (gQ). Price scales with the selected count
	// via gqBaseEur(); the StyleList renders as toggleable rows.
	selectable?: boolean;
	// Per-style EUR for selectable packages.
	perStyleEur?: number;
	// Base EUR price at Tier 1 (Individual, ×1 multiplier). Same numbers as quoted.
	baseEur: number;
	// Gross EUR before package discount (for anchoring display)
	grossEur: number;
	// Package discount rate (0 = no discount)
	discountRate: number;
}

export interface TypefacePricing {
	slug: TypefaceSlug;
	packages: PackageDef[];
}

// Steiner ships 20 numeric weights (name × 10 = wght; 40 = Book, 95 = Ultra),
// upright only — a single weight axis from Hairline to Ultra. Sold as one family.
// (No italic masters yet; do not advertise italics until they actually ship.)
export const STEINER_WEIGHTS: string[] = [
	'1', '5', '10', '15', '20', '25', '30', '35', '40', '45',
	'50', '55', '60', '65', '70', '75', '80', '85', '90', '95'
];

export const TYPEFACE_PRICING: TypefacePricing[] = [
	{
		slug: 'steiner',
		packages: [
			{
				id: 'steiner-complete',
				label: 'Asger',
				detail: '20 weights — Hairline to Ultra',
				styles: STEINER_WEIGHTS,
				italic: false,
				// Individual-tier price: EUR12.50 per weight across the 20.
				// Softened from the original €420 launch price to lower the
				// entry-price barrier (2026-08 pricing pass) — still above the
				// Future Fonts band, which is the work-in-progress channel and
				// prices below the finished release by design.
				baseEur: 250,
				// No standing discount: an anchor that never expires reads as a
				// fake list price.
				grossEur: 250,
				discountRate: 0
			}
		]
	}
	// gq, atom: in development — not for sale yet
];

export function getTypefacePricing(slug: TypefaceSlug): TypefacePricing | undefined {
	return TYPEFACE_PRICING.find((tp) => tp.slug === slug);
}

export function getPackage(slug: TypefaceSlug, packageId: string): PackageDef | undefined {
	return getTypefacePricing(slug)?.packages.find((p) => p.id === packageId);
}

// ── Price calculation ────────────────────────────────────────────────────────

// Compute EUR price for a given package × tier combination.
// Returns null for the enterprise (Contact) tier.
export function computeEur(pkg: PackageDef, tierIndex: number): Price {
	const tier = getTierDef(tierIndex);
	if (!tier || tier.multiplier === null) return null;
	return Math.round(pkg.baseEur * tier.multiplier);
}

// Compute gross EUR (before package discount) for anchoring display
export function computeGrossEur(pkg: PackageDef, tierIndex: number): Price {
	const tier = getTierDef(tierIndex);
	if (!tier || tier.multiplier === null) return null;
	return Math.round(pkg.grossEur * tier.multiplier);
}

export function getPrice(pkg: PackageDef, tierIndex: number): Price {
	return computeEur(pkg, tierIndex);
}

export function getGrossPrice(pkg: PackageDef, tierIndex: number): Price {
	return computeGrossEur(pkg, tierIndex);
}

// ── Project / Client License ─────────────────────────────────────────────────
// Flat-priced, single-brand-scoped licence for a design studio or agency
// buying on behalf of one client. Full scope (desktop/web/app/broadcast) like
// Team-and-above, but restricted to one named brand identity — not
// transferable to the buyer's other projects or clients. Priced independent
// of both the agency's own tier and the client's company size: a narrower
// product, not a discount off either. Sits between Individual and Team.
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
