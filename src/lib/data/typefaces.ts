// Typeface data definitions for August Type Foundry
// Used by /fonts listing and /fonts/[slug] detail pages.

import type { WeightDef } from '$lib/components/TypeTester/presets.js';
import { WEIGHTS } from '$lib/components/TypeTester/presets.js';

export type { WeightDef as TypefaceWeight };

export type TypefaceStatus = 'available' | 'in-development';

export interface Typeface {
	slug: string;
	name: string;
	/** Display order (ascending): 1 = Steiner, 2 = MK Sans, 3 = Atom */
	order: number;
	status: TypefaceStatus;
	/** Temporarily hide from all listings (top page, /fonts, header menu) */
	hidden?: boolean;
	/** CSS font-family value to use in the Type Tester */
	fontFamily: string;
	tagline: string;
	description: string;
	/** Japanese running translation of the description (shown under the English). */
	descriptionDa?: string;
	/** e.g. 'Humanist Sans · 12 weights' */
	classification: string;
	weights: WeightDef[];
	/** Per-weight default words for the Type Tester — row i uses defaultTexts[i % length] */
	defaultTexts: string[];
	/** Optional hero thumbnail (image path under /). When absent, the slide
	 *  falls back to a large typographic placeholder. */
	thumbnail?: string;
	/** Optional hero video (used in preference to thumbnail when present). */
	heroVideo?: string;
	/** Optional credit line for the hero image (photographer / source / licence). */
	imageCredit?: string;
	/** When true the typeface page hero flips through the alphabet (white on
	 *  black) instead of showing heroVideo/thumbnail. */
	heroGlyphCycle?: boolean;
	/** Specimen galleries for the typeface page (each renders an ImageGallery). */
	specimens?: {
		title: string;
		columns?: number;
		ratio?: string;
		items: { src?: string; caption?: string; alt?: string }[];
	}[];
	/** Hero slide colour theme — gives each typeface a distinct light/dark tone. */
	theme: { bg: string; fg: string };
	/** Hero metadata (per Figma SP design 280:104 / 274:18) */
	hero: {
		label: string; // e.g. 'Neo Humanist Sans'
		vol: string; // e.g. 'vol.01'
		subtitle: string; // e.g. '(Geometry breathing)'
		debut: string; // e.g. '26.06.06 Debut'
		/** Render the hero wordmark larger (e.g. gQ) */
		large?: boolean;
		/** Coming-soon hero variant: shows intro + name + statement, no meta/Discover */
		comingSoon?: boolean;
		/** Small intro line shown above the name in the coming-soon variant */
		intro?: string;
		/** Centered statement line (e.g. 'Geometry, breathing.') */
		statement?: string;
	};
}

export const TYPEFACES: Typeface[] = [
	{
		slug: 'steiner',
		name: 'Asger',
		order: 1,
		status: 'available',
		fontFamily: 'Steiner',
		tagline: 'The formative forces of the word, made visible.',
		description:
			"Asger is a 20-weight neo-humanist sans-serif variable font. " +
			"It takes its name — and its temperament — from Rudolf Steiner: a Goethean reading of nature, where form is never fixed but always in metamorphosis, and an anthroposophy that holds the human being as the measure of things. " +
			"Humanist-geometric — the mechanical and the organic coexist in every glyph, held together by formative force. " +
			"Its humanist lineage runs quietly beneath — Johnston's 1916 Underground alphabet, Gill Sans, Neuzeit, Otl Aicher's Rotis — never the surface, only the soil.",
		descriptionDa:
			'Asger er en neo-humanistisk grotesk i 20 vægte, tegnet som variabel skrift. '
			+ 'Den har sit navn — og sit temperament — fra Rudolf Steiner: en goethesk læsning af naturen, hvor formen aldrig ligger fast, men altid er under forvandling, og en antroposofi, der holder mennesket som målestok. '
			+ 'Humanistisk-geometrisk — det mekaniske og det organiske findes side om side i hvert tegn, holdt sammen af formende kraft. '
			+ 'Den humanistiske slægt løber stille nedenunder — Johnstons Underground-alfabet fra 1916, Gill Sans, Neuzeit, Otl Aichers Rotis — aldrig overfladen, kun jorden.',
		classification: 'Neo Humanist Sans · 20 weights',
		weights: WEIGHTS,
		// One word per weight row (20), in alphabetical order A→T — typography's
		// own vocabulary, general rather than Steiner/anthroposophy-specific.
		defaultTexts: [
			'Aperture',
			'Baseline',
			'Counter',
			'Descender',
			'Ear',
			'Finial',
			'Glyph',
			'Hairline',
			'Italic',
			'Junction',
			'Kerning',
			'Ligature',
			'Metrics',
			'Numeral',
			'Overshoot',
			'Proportion',
			'Quotation',
			'Rhythm',
			'Serif',
			'Terminal'
		],
		// Typeface-page hero: the same wght 1->950 sweep across a row of "a"s
		// used on the home page (see Home__custom's video-specimen commit).
		heroVideo: '/videos/asger_vf_aa.mp4',
		theme: { bg: '#000000', fg: '#ffffff' },
		hero: {
			label: 'Neo Humanist Sans',
			vol: 'vol.01',
			subtitle: '(Formative forces)',
			debut: '26.07.01 Debut'
		}
	},
	{
		slug: 'gq',
		name: 'gQ',
		order: 2,
		status: 'in-development',
		// Withdrawn from the public site for the Steiner-only launch (2026-07).
		// Weight count / spec are not final — do not re-list until they are.
		hidden: true,
		// Latest Mokuseki Sans (v08) webfont
		fontFamily: 'Mokuseki Sans',
		tagline: 'The latest cut of Mokuseki Sans.',
		description:
			'gQ is the latest evolution of Mokuseki Sans — a neo-humanist sans drawn at August Type Foundry. ' +
			'Details on weights and axis range will be published as the design reaches maturity. ' +
			'Debuting 2026.',
		descriptionDa:
			'gQ er den nyeste udvikling af Mokuseki Sans — en neo-humanistisk grotesk tegnet hos August Type Foundry. '
			+ 'Detaljer om vægte og akser offentliggøres, efterhånden som designet modnes. Debut i 2026.',
		classification: 'Neo Humanist Sans · 12 weights',
		// Provisional weights — same 12-stop axis as Steiner until spec is finalised
		weights: WEIGHTS,
		// One long German word per weight row (20) — aesthetic / philosophical vocabulary
		defaultTexts: [
			'Gesamtkunstwerk',
			'Zeitgeist',
			'Sprachgefühl',
			'Augenblick',
			'Fernweh',
			'Weltschmerz',
			'Stimmung',
			'Sehnsucht',
			'Einfühlung',
			'Erscheinung',
			'Verfremdung',
			'Lichtung',
			'Dasein',
			'Zwischenraum',
			'Formwille',
			'Kunstwollen',
			'Querschnitt',
			'Wanderlust',
			'Bildung',
			'Gestalt'
		],
		thumbnail: '/images/fonts/gq.png',
		theme: { bg: '#EDEAE3', fg: '#1a1a1a' },
		hero: {
			label: 'Neo Humanist Sans',
			vol: 'vol.02',
			subtitle: '(Mokuseki Sans)',
			debut: 'Coming Soon',
			large: true,
			comingSoon: true,
			intro: 'The next cut from our foundry.',
			statement: 'Mokuseki Sans, maturing.'
		}
	},
	{
		slug: 'atom',
		name: 'Atom',
		order: 3,
		status: 'in-development',
		hidden: true,
		// No font files yet — render as Steiner for preview purposes
		fontFamily: 'Steiner',
		tagline: 'A display typeface in development.',
		description:
			'Atom is a display typeface currently in development at August Type Foundry. ' +
			'Further details on its design direction and release schedule will follow. ' +
			'Coming 2026.',
		descriptionDa:
			'Atom er en display-skrift under udvikling hos August Type Foundry. '
			+ 'Nærmere om retning og udgivelsestidspunkt følger. Planlagt til 2026.',
		classification: 'Neo Grotesque · in development',
		// Provisional weights — same 12-stop axis as Steiner until spec is finalised
		weights: WEIGHTS,
		// One long German word per weight row (20) — physics / natural-philosophy vocabulary
		defaultTexts: [
			'Weltanschauung',
			'Quintessenz',
			'Elementarteilchen',
			'Wirklichkeit',
			'Naturphilosophie',
			'Kontinuum',
			'Raumzeit',
			'Unendlichkeit',
			'Materie',
			'Antimaterie',
			'Quantensprung',
			'Gleichgewicht',
			'Schwerkraft',
			'Lichtgeschwindigkeit',
			'Urknall',
			'Kristallgitter',
			'Wellenfunktion',
			'Singularität',
			'Übergang',
			'Urstoff'
		],
		thumbnail: '/images/fonts/atom.png',
		theme: { bg: '#15181C', fg: '#ffffff' },
		hero: {
			label: 'Neo Grotesque',
			vol: 'vol.03',
			subtitle: '(Coming Soon)',
			debut: 'Coming Soon',
			comingSoon: true,
			intro: 'The very first Neo Grotesque from our foundry.',
			statement: 'Geometry, breathing.'
		}
	},
	{
		// Sibling face to Asger — registered so the slug and data shape exist.
		// Everything below the name is provisional: no drawings, no font files,
		// no agreed classification. Hidden until the design has something to show.
		slug: 'asta',
		name: 'Asta',
		order: 4,
		status: 'in-development',
		hidden: true,
		// No font files yet — render as Steiner for preview purposes
		fontFamily: 'Steiner',
		tagline: 'Sibling to Asger.',
		description:
			'Asta is a sibling to Asger, in development at August Type Foundry. ' +
			'Details on its design direction, weights and release schedule will follow.',
		descriptionDa:
			'Asta er en søsterskrift til Asger, under udvikling hos August Type Foundry. '
			+ 'Nærmere om retning, vægte og udgivelsestidspunkt følger.',
		classification: 'In development',
		// Provisional weights — same axis as Asger until the spec is finalised
		weights: WEIGHTS,
		defaultTexts: ['Asta'],
		theme: { bg: '#d59514', fg: '#000000' },
		hero: {
			label: 'In development',
			vol: 'vol.04',
			subtitle: '(Coming Soon)',
			debut: 'Coming Soon',
			comingSoon: true,
			intro: 'A sibling to Asger.',
			statement: 'Coming soon.'
		}
	}
];

export function getTypeface(slug: string): Typeface | undefined {
	return TYPEFACES.find((tf) => tf.slug === slug);
}
