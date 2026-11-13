// Pricing data for Apres Guerre
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

/** What a licence covers, in one line, for the licence model of its typeface:
 *  with toppings, the licence is ordinary design work and brands' uses are
 *  added per brand (see TOPPINGS). */
export function scopeBlurb(tierIndex: number, licensing: PackageDef['licensing']): string {
	if (licensing === 'toppings') return TOPPING_SCOPE_BLURB;
	return SCOPE_BLURB[getTierScope(tierIndex)];
}

export const TOPPING_SCOPE_BLURB =
	'Ordinary design work — print, packaging, signage, presentations. Your logo, website, social media and add-ons are added to it.';

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

export type TypefaceSlug = 'norma' | 'context-quad-sans' | 'context-humorist';

export interface PackageDef {
	id: string;
	label: string;
	// Styles / weights included (display only)
	detail: string;
	// The full style list — what "Complete Collection" selects, and the set
	// a buyer picks a custom subset from.
	styles?: string[];
	// Whether each weight also ships an Italic. When true, the style list renders as a
	// 2-column layout (upright left, italic right). Quad Sans has no italics.
	italic?: boolean;
	// Buyer selects individual styles. The StyleList renders as toggleable chips.
	selectable?: boolean;
	// Reference-only "from" price for marketing teasers (fonts list / detail
	// pages) — the cheapest real entry point: Individual tier's own
	// per-style rate, for a single style (no collection discount applied).
	// Not used in the actual checkout computation (see computeEur), which
	// always derives from tier × selected style count.
	baseEur: number;
	// Early access (2026-11-06): where the family stands, and so what its price
	// is multiplied by (STAGE_FACTORS). Absent = 'release', full price. The
	// stage is moved by hand, in this table.
	stage?: ReleaseStage;
	// The version shown beside the stage ("0.3").
	version?: string;
	// The styles already drawn. The rest of `styles` is promised: Complete
	// Collection includes it (delivered as it is drawn), a single style of it
	// can't be bought yet. Absent = all of them.
	availableStyles?: string[];
	// The family's Regular — the one style a brand starts with (see TOPPINGS).
	defaultStyle?: string;
	// 'bundled' (the default, Norma): one licence covers desktop, web, app and
	// book. 'toppings': the licence is for ordinary design work (desktop,
	// print); a brand's logo, web, social … are bought per brand and style.
	licensing?: 'bundled' | 'toppings';
	// Shown for review before the sale opens (the domain isn't public yet): the
	// pages and the purchase screens work, but checkout only goes through with a
	// Stripe TEST key. Take this off to open the sale.
	preview?: boolean;
}

export interface TypefacePricing {
	slug: TypefaceSlug;
	packages: PackageDef[];
}

/** An italic style's name is its upright's plus this ("40" → "40i"). */
export const ITALIC_SUFFIX = 'i';

// Norma ships 20 numeric weights (name × 10 = wght; 40 = Book, 95 = Ultra),
// upright only — a single weight axis from Hairline to Ultra.
// (No italic masters yet; do not advertise italics until they actually ship.)
export const STEINER_WEIGHTS: string[] = [
	'1',
	'5',
	'10',
	'15',
	'20',
	'25',
	'30',
	'35',
	'40',
	'45',
	'50',
	'55',
	'60',
	'65',
	'70',
	'75',
	'80',
	'85',
	'90',
	'95'
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
	},
	{
		// Humorist, for review (2026-11-06): early access, sold with toppings. The
		// nine weights drawn so far, each upright and italic; the italics are
		// promised, not drawn. The final family is ten weights (20 styles) —
		// styles gets its tenth when its name is settled.
		slug: 'context-humorist',
		packages: [
			{
				id: 'context-humorist-complete',
				label: 'CONTEXT Humorist',
				detail: '9 weights, upright and italic',
				styles: ['15', '25', '35', '45', '55', '65', '75', '85', '95'].flatMap((w) => [
					w,
					`${w}${ITALIC_SUFFIX}`
				]),
				availableStyles: ['15', '25', '35', '45', '55', '65', '75', '85', '95'],
				defaultStyle: '45', // Regular
				italic: true,
				selectable: true,
				stage: 'early',
				licensing: 'toppings',
				preview: true,
				baseEur: 30
			}
		]
	}
	// context-quad-sans: in development — not for sale yet (its five weights' names
	// and which are drawn are not settled)
];

export function getTypefacePricing(slug: TypefaceSlug): TypefacePricing | undefined {
	return TYPEFACE_PRICING.find((tp) => tp.slug === slug);
}

export function getPackage(slug: TypefaceSlug, packageId: string): PackageDef | undefined {
	return getTypefacePricing(slug)?.packages.find((p) => p.id === packageId);
}

// ── Release stages (early access) ────────────────────────────────────────────
// A family on sale before it is finished costs less the less finished it is:
// the price is multiplied by its stage's factor, and the buyer keeps every
// update to the family for good (the download side comes with the signed
// links). Stages are moved by hand — no timers, no stock counters.

export type ReleaseStage = 'early' | 'beta' | 'rc' | 'release';

export const STAGE_FACTORS: Record<ReleaseStage, number> = {
	early: 0.4,
	beta: 0.6,
	rc: 0.8,
	release: 1
};

export const STAGE_LABELS: Record<ReleaseStage, string> = {
	early: 'Early Access',
	beta: 'Beta',
	rc: 'Release Candidate',
	release: 'Release'
};

export function packageStage(pkg: PackageDef): ReleaseStage {
	return pkg.stage ?? 'release';
}

export function stageFactor(pkg: PackageDef): number {
	return STAGE_FACTORS[packageStage(pkg)];
}

/** `price` after the stage's factor — the same rounding computeTotal's
 *  early-access line uses, so a price shown here adds up with the total. */
export function stagedPrice(pkg: PackageDef, price: number): number {
	return price - Math.round(price * (1 - stageFactor(pkg)));
}

/** The styles promised but not drawn yet. */
export function unavailableStyles(pkg: PackageDef): string[] {
	if (!pkg.availableStyles) return [];
	const drawn = new Set(pkg.availableStyles);
	return (pkg.styles ?? []).filter((style) => !drawn.has(style));
}

export function isItalicStyle(style: string): boolean {
	return style.endsWith(ITALIC_SUFFIX);
}

// ── Toppings ─────────────────────────────────────────────────────────────────
// For a typeface sold with toppings (2026-11-06, the user's design after
// Rellence and Kontrapunkt): ordinary design work — print, packaging, signage,
// presentations — is the licence itself. The licensee's logo, website, social
// media and the add-ons are toppings on that licence: each adds its ratio of the
// per-style rate to every style's price, so a style costs
//     rate at the licensee's size × (1 + the toppings' ratios)
// and the package discounts (Complete, half the set) apply to that whole. The
// purchase page opens on a preset (LICENCE_PRESET) — what most licensees need —
// and every topping can be taken off: the price only goes down from there.

export type ToppingId = 'logo' | 'web' | 'social' | 'app' | 'broadcast';

export interface ToppingOption {
	id: string;
	label: string;
	/** × the per-style rate, added to every style's price. */
	ratio: number;
}

export interface ToppingDef {
	id: ToppingId;
	label: string;
	/** The question its row asks. */
	question: string;
	/** What it covers — the row's Info. */
	blurb: string;
	/** A row of its own, or one of the add-ons listed together. */
	group: 'main' | 'addon';
	options: ToppingOption[];
}

export const TOPPINGS: ToppingDef[] = [
	{
		id: 'logo',
		label: 'Logo',
		question: 'Use the fonts in your logo',
		blurb: 'Your logo or wordmark, set in the font or drawn from it.',
		group: 'main',
		options: [
			{ id: 'logo-1', label: '1 logo', ratio: 2 },
			{ id: 'logo-3', label: 'Up to 3 logos', ratio: 4 }
		]
	},
	{
		id: 'web',
		label: 'Web',
		question: 'Embed the fonts on your website',
		blurb: 'Your own website(s), by web font, registered by domain.',
		group: 'main',
		options: [{ id: 'web-100k', label: 'Up to 100K views / month', ratio: 0.3 }]
	},
	{
		id: 'social',
		label: 'Social',
		question: 'Use the fonts on social media',
		blurb: 'Your social media posts and profiles.',
		group: 'main',
		options: [{ id: 'social', label: 'Your social media accounts', ratio: 0.2 }]
	},
	{
		id: 'app',
		label: 'App',
		question: 'App, game, e-book or server',
		blurb: 'Embedded in an app, a game, an e-book, or software that sets text on a server.',
		group: 'addon',
		options: [{ id: 'app', label: 'App / embedding', ratio: 1 }]
	},
	{
		id: 'broadcast',
		label: 'Broadcast',
		question: 'Film, TV, streaming and advertising',
		blurb: 'Film, television, streaming and paid advertising.',
		group: 'addon',
		options: [{ id: 'broadcast', label: 'Film, TV and advertising', ratio: 1.5 }]
	}
];

export interface Use {
	topping: ToppingId;
	option: string;
}

export function getTopping(id: string): ToppingDef | undefined {
	return TOPPINGS.find((t) => t.id === id);
}

export function getToppingOption(
	toppingId: string,
	optionId: string
): { topping: ToppingDef; option: ToppingOption } | undefined {
	const topping = getTopping(toppingId);
	const option = topping?.options.find((o) => o.id === optionId);
	return topping && option ? { topping, option } : undefined;
}

/** The toppings' ratios, summed (unknown ones count for nothing — the order
 *  check refuses them before a price is taken). */
export function usesRatio(uses: Use[]): number {
	return uses.reduce(
		(sum, use) => sum + (getToppingOption(use.topping, use.option)?.option.ratio ?? 0),
		0
	);
}

/** Sharing the fonts with a subcontractor (a freelancer, a printer): flat, per
 *  subcontractor, whatever the styles — the early-access factor leaves it alone. */
export const SUB_LICENSE_EUR = 50;
export const MAX_SUBCONTRACTORS = 5;
export const SUB_OPTIONS = [1, 2, 3, 4, 5];

/** How many website domains one Web topping can register. */
export const MAX_WEB_DOMAINS = 10;

/** A website domain as typed ("https://www.Example.com/shop") → its host
 *  ("www.example.com"), or null if it isn't one. */
export function normalizeDomain(input: string): string | null {
	const host = input
		.trim()
		.toLowerCase()
		.replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
		.split(/[/?#:]/)[0];
	return /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)
		? host
		: null;
}

/** Where the purchase page starts (2026-11-06, the user's preset): the Complete
 *  Collection, 5 people, one subcontractor, one logo, one website, social media. */
export const LICENCE_PRESET: { tierIndex: number; uses: Use[]; subcontractors: number } = {
	tierIndex: 2,
	uses: [
		{ topping: 'logo', option: 'logo-1' },
		{ topping: 'web', option: 'web-100k' },
		{ topping: 'social', option: 'social' }
	],
	subcontractors: 1
};

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

// Gross EUR for a given package × tier × selected style count (× the toppings,
// for a package sold with them), before any volume discount — the "was" price
// shown struck through when a discount applies. Returns null for the Global
// tier (no self-serve rate).
export function computeGrossEur(
	pkg: PackageDef,
	tierIndex: number,
	styleCount: number,
	uses: Use[] = []
): Price {
	const tier = getTierDef(tierIndex);
	if (!tier || tier.perStyleEur === null || styleCount <= 0) return null;
	const perStyle = pkg.licensing === 'toppings' ? 1 + usesRatio(uses) : 1;
	return Math.round(tier.perStyleEur * perStyle * styleCount);
}

// Final EUR — the gross price, reduced by whichever volume discount the
// selected style count qualifies for (see discountRateFor).
export function computeEur(
	pkg: PackageDef,
	tierIndex: number,
	styleCount: number,
	uses: Use[] = []
): Price {
	const gross = computeGrossEur(pkg, tierIndex, styleCount, uses);
	if (gross === null) return null;
	const rate = discountRateFor(pkg, styleCount);
	return rate > 0 ? Math.round(gross * (1 - rate)) : gross;
}

export function getPrice(
	pkg: PackageDef,
	tierIndex: number,
	styleCount: number,
	uses: Use[] = []
): Price {
	return computeEur(pkg, tierIndex, styleCount, uses);
}

export function getGrossPrice(
	pkg: PackageDef,
	tierIndex: number,
	styleCount: number,
	uses: Use[] = []
): Price {
	return computeGrossEur(pkg, tierIndex, styleCount, uses);
}

// The per-style rate alone (no count, no discount) — what Step 1's intake
// preview shows, since it resolves a tier before Step 3 has picked any
// styles yet.
export function getPerStylePrice(tierIndex: number): Price {
	return getTierDef(tierIndex)?.perStyleEur ?? null;
}

// ── Project / Client License ─────────────────────────────────────────────────
// Retired from checkout 2026-11-06: a client's logo, web … are now toppings
// (see TOPPINGS). These stay only for /licensing, until that page's copy is
// rewritten for the new licences.
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

// ── Checkout form encoding ───────────────────────────────────────────────────
// An order can hold several typefaces (2026-11-05), each with its own styles,
// so a selected style travels as "<packageId>:<style>" — the page writes it,
// the checkout action reads it back (see $lib/server/checkout-order).

export const STYLE_FIELD_SEPARATOR = ':';

export function encodeStyleField(packageId: string, style: string): string {
	return `${packageId}${STYLE_FIELD_SEPARATOR}${style}`;
}

/** A value without a separator is the pre-multi-typeface form: no package. */
export function decodeStyleField(value: string): { packageId: string | null; style: string } {
	const at = value.indexOf(STYLE_FIELD_SEPARATOR);
	if (at < 0) return { packageId: null, style: value };
	return { packageId: value.slice(0, at), style: value.slice(at + 1) };
}
