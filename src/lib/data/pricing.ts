// Pricing data for August Type Foundry
// Architecture: typeface → package → license type → tier
// Prices are computed from EUR base prices via conversion functions.
// All EUR base prices are the minimum-tier (tier 1) values.

export type LicenseType = 'desktop' | 'web' | 'app' | 'books';
export type Currency = 'EUR' | 'JPY' | 'USD';

// null = "Contact us" (Tier 12 — enterprise)
export type Price = number | null;

// ── Currency ──────────────────────────────────────────────────────────────────

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
	EUR: '€',
	JPY: '¥',
	USD: '$'
};

export const CURRENCY_LOCALE: Record<Currency, string> = {
	EUR: 'de-DE',
	JPY: 'ja-JP',
	USD: 'en-US'
};

// EUR is the base currency. Same numbers as quoted (€40/style, €480 Full, etc.).
// JPY / USD are derived from EUR.

// EUR → JPY: round to nearest ¥100
function eurToJpy(eur: number): number {
	return Math.round((eur * 160) / 100) * 100;
}

// EUR → USD: round to nearest integer
function eurToUsd(eur: number): number {
	return Math.round(eur * 1.08);
}

export function formatPrice(price: Price, currency: Currency): string {
	if (price === null) return 'Contact';
	const sym = CURRENCY_SYMBOLS[currency];
	if (currency === 'JPY') {
		return `${sym}${price.toLocaleString('ja-JP')}`;
	}
	return `${sym}${price.toLocaleString('en-US')}`;
}

// ── Tier curve ────────────────────────────────────────────────────────────────

export interface TierDef {
	index: number; // 1–12
	// Desktop / Web labels
	desktopLabel: string;
	webLabel: string;
	// App / Books labels
	appLabel: string;
	booksLabel: string;
	multiplier: number | null; // null = Contact
}

// 12-step multiplier curve (Tier 1 = ×1.0 base)
export const TIER_DEFS: TierDef[] = [
	{ index: 1,  desktopLabel: '1–2 users',         webLabel: 'up to 10,000 PV / mo',  appLabel: 'up to 10,000 downloads',   booksLabel: 'up to 5,000 copies',    multiplier: 1.0  },
	{ index: 2,  desktopLabel: 'up to 10 users',    webLabel: 'up to 25,000 PV / mo',  appLabel: 'up to 50,000 downloads',   booksLabel: 'up to 50,000 copies',   multiplier: 1.4  },
	{ index: 3,  desktopLabel: 'up to 25 users',    webLabel: 'up to 50,000 PV / mo',  appLabel: 'up to 100,000 downloads',  booksLabel: 'up to 100,000 copies',  multiplier: 1.8  },
	{ index: 4,  desktopLabel: 'up to 50 users',    webLabel: 'up to 100,000 PV / mo',    appLabel: 'up to 500,000 downloads',  booksLabel: 'up to 500,000 copies',  multiplier: 2.2  },
	{ index: 5,  desktopLabel: 'up to 100 users',   webLabel: 'up to 250,000 PV / mo',  appLabel: 'up to 1,000,000 downloads',    booksLabel: 'up to 1,000,000 copies',    multiplier: 2.6  },
	{ index: 6,  desktopLabel: 'up to 250 users',   webLabel: 'up to 500,000 PV / mo',    appLabel: 'up to 5,000,000 downloads',    booksLabel: 'up to 5,000,000 copies',    multiplier: 3.2  },
	{ index: 7,  desktopLabel: 'up to 500 users',   webLabel: 'up to 1,000,000 PV / mo',   appLabel: 'up to 10,000,000 downloads',   booksLabel: 'up to 10,000,000 copies',   multiplier: 3.8  },
	{ index: 8,  desktopLabel: 'up to 1,000 users', webLabel: 'up to 2,500,000 PV / mo',   appLabel: 'up to 25,000,000 downloads',   booksLabel: 'up to 25,000,000 copies',   multiplier: 4.6  },
	{ index: 9,  desktopLabel: 'up to 2,500 users', webLabel: 'up to 5,000,000 PV / mo',   appLabel: 'up to 50,000,000 downloads',   booksLabel: 'up to 50,000,000 copies',   multiplier: 5.6  },
	{ index: 10, desktopLabel: 'up to 5,000 users', webLabel: 'up to 10,000,000 PV / mo',  appLabel: 'up to 100,000,000 downloads',  booksLabel: 'up to 100,000,000 copies',  multiplier: 6.8  },
	{ index: 11, desktopLabel: 'up to 10,000 users',webLabel: 'up to 25,000,000 PV / mo',  appLabel: 'up to 250,000,000 downloads',  booksLabel: 'up to 250,000,000 copies',  multiplier: 8.0  },
	{ index: 12, desktopLabel: '10,000+ users',     webLabel: '25,000,000+ PV / mo',       appLabel: '250,000,000+ downloads',       booksLabel: '250,000,000+ copies',       multiplier: null }
];

// ── Package definitions ───────────────────────────────────────────────────────

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
	// Base EUR price at Tier 1 (Desktop/Web/Books, ×1 multiplier). Same numbers as quoted.
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
				label: 'Steiner Complete',
				detail: '20 weights — Hairline to Ultra',
				styles: STEINER_WEIGHTS,
				italic: false,
				baseEur: 560,
				grossEur: 1120,
				discountRate: 0.5
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

// ── License type definitions ──────────────────────────────────────────────────

export interface LicenseDef {
	id: LicenseType;
	label: string;
	axisLabel: string;
	blurb: string;
	// App license applies ×2 multiplier on top of the base
	baseMultiplier: number;
}

export const LICENSES: LicenseDef[] = [
	{
		id: 'desktop',
		label: 'Desktop',
		axisLabel: 'users',
		blurb: 'For use in print, PDF, and locally installed applications.',
		baseMultiplier: 1
	},
	{
		id: 'web',
		label: 'Web',
		axisLabel: 'monthly pageviews',
		blurb: 'Perpetual license for web use. Covers the stated monthly pageview volume.',
		baseMultiplier: 1
	},
	{
		id: 'app',
		label: 'App',
		axisLabel: 'downloads',
		blurb: 'For mobile and desktop applications (iOS, Android, etc.).',
		baseMultiplier: 2
	},
	{
		id: 'books',
		label: 'Books',
		axisLabel: 'copies',
		blurb: 'For books, magazines, and printed editorial publications.',
		baseMultiplier: 1
	}
];

// ── Price calculation ─────────────────────────────────────────────────────────

// Compute EUR price for a given package × license × tier combination.
// Returns null for the enterprise (Contact) tier.
export function computeEur(pkg: PackageDef, license: LicenseDef, tierIndex: number): Price {
	const tier = TIER_DEFS.find((t) => t.index === tierIndex);
	if (!tier || tier.multiplier === null) return null;
	return Math.round(pkg.baseEur * license.baseMultiplier * tier.multiplier);
}

// Compute gross EUR (before package discount) for anchoring display
export function computeGrossEur(pkg: PackageDef, license: LicenseDef, tierIndex: number): Price {
	const tier = TIER_DEFS.find((t) => t.index === tierIndex);
	if (!tier || tier.multiplier === null) return null;
	return Math.round(pkg.grossEur * license.baseMultiplier * tier.multiplier);
}

// Convert a base-EUR price to the requested currency
export function convertPrice(eur: Price, currency: Currency): Price {
	if (eur === null) return null;
	if (currency === 'EUR') return eur;
	if (currency === 'JPY') return eurToJpy(eur);
	return eurToUsd(eur);
}

// Full price lookup: package × license × tier → Price in requested currency
export function getPrice(
	pkg: PackageDef,
	license: LicenseDef,
	tierIndex: number,
	currency: Currency
): Price {
	const eur = computeEur(pkg, license, tierIndex);
	return convertPrice(eur, currency);
}

// Gross price in requested currency (for anchoring)
export function getGrossPrice(
	pkg: PackageDef,
	license: LicenseDef,
	tierIndex: number,
	currency: Currency
): Price {
	const eur = computeGrossEur(pkg, license, tierIndex);
	return convertPrice(eur, currency);
}

// Tier label for a given license type
export function getTierLabel(license: LicenseDef, tierIndex: number): string {
	const tier = TIER_DEFS.find((t) => t.index === tierIndex);
	if (!tier) return '';
	switch (license.id) {
		case 'desktop': return tier.desktopLabel;
		case 'web':     return tier.webLabel;
		case 'app':     return tier.appLabel;
		case 'books':   return tier.booksLabel;
	}
}

// ── Legacy helpers (kept for getLicense compatibility) ────────────────────────

export function getLicense(id: LicenseType): LicenseDef {
	const found = LICENSES.find((l) => l.id === id);
	if (!found) throw new Error(`Unknown license: ${id}`);
	return found;
}

// ── Flat package list for the Select Fonts section ────────────────────────────

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
