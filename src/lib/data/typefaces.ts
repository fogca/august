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
	/** Danish running translation of the description (shown under the English). */
	descriptionDa?: string;
	/** e.g. 'Humanist Sans · 12 weights' */
	classification: string;
	/** Spec table shown beside the description on the typeface page. */
	info?: {
		design: string;
		release: string;
		collection: string;
		formats: string;
		/** Encoded glyph count */
		glyphs: string;
		/** Number of supported languages */
		languages: string;
	};
	weights: WeightDef[];
	/** Per-weight default words for the Type Tester — row i uses defaultTexts[i % length] */
	defaultTexts: string[];
	/** Body text set under each word, paired by the same index. */
	defaultNotes?: string[];
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
		// Measured, not estimated: glyph count is the encoded cmap of the shipped
		// Steiner-VF70.woff2. The language count is Hyperglot 0.7.3, base support
		// restricted to --validity verified — i.e. only languages whose charset
		// data Hyperglot has checked. Its default (draft data included) reports
		// 246, which counts a long tail of unverified minority orthographies and
		// overstates the case. Formats follow docs/FULFILLMENT.md (still a draft).
		info: {
			design: 'Takumi Isobe',
			release: 'July 2026',
			collection: '20 weights, variable',
			formats: 'TTF, WOFF2',
			glyphs: '341',
			languages: '93'
		},
		weights: WEIGHTS,
		// One term per weight row (20, alphabetical A→T) — typography's own
		// vocabulary. Single words only: the tester sets them large, so a
		// sentence would wrap into a paragraph instead of showing the letters.
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
		// Body copy under each word — long enough to show the face setting real
		// paragraphs, not just a caption. Each still explains its own term, so
		// the row reads as a title with its article rather than filler.
		defaultNotes: [
			'The partial opening in letters like c, e and s, measured between the terminals. A wide aperture keeps a face open and legible at small sizes and on screen; a closed one turns the same skeleton mechanical. It is one of the first decisions that separates a humanist sans from a geometric one.',
			'The invisible line every letter without a descender sits on. It is the strongest alignment in typography — the eye reads along it, and any letter that strays from it looks broken. Round letters must actually cross it slightly to appear level, which is why overshoot exists.',
			'The enclosed or partially enclosed space inside a letter, as in o, e or a. Counters carry more of a typeface\u2019s character than the strokes around them: their size sets the colour of a page, and their shape decides whether the family stays legible once the weight is pushed to the extremes.',
			'The part of a letter that drops below the baseline, as in p, y or g. Descender length is a compromise between elegance and economy — long ones give a page rhythm and grace, short ones let lines be set tight. The choice is made once and constrains every line spacing afterwards.',
			'The small stroke projecting from the top right of a lowercase g. It is a detail almost nobody notices and every type designer argues about, because it is one of the few places where a sans-serif is allowed a gesture that serves no structural purpose at all.',
			'A tapered or curved stroke end, without a serif, as in f, r or c. Finials are where the drawing hand shows itself: cut them straight and the face turns rational, let them swell or taper and the same skeleton starts to feel written rather than constructed.',
			'The drawn shape a font uses to represent a character. A character is an idea — the letter A — while a glyph is one particular drawing of it. One character can have many glyphs, which is what stylistic sets, small capitals and old-style figures actually are.',
			'The thinnest stroke a typeface draws, most visible in its heaviest weights. In a variable family the hairline is also a whole instrument of its own: at the light end of the axis every stroke becomes a hairline, and the design has to hold together with almost no mass left.',
			'A distinct, slanted design drawn stroke by stroke — not a slanted copy of the roman. A true italic changes the skeleton: a becomes single-storey, the rhythm narrows, and the letters begin to join in spirit if not in fact. Sloping a roman produces something quite different, and worse.',
			'The point where two strokes meet or cross, as in the arms of a k or the shoulder of an n. Junctions are where weight collects, so they have to be cut back by hand at every weight; left alone they turn into dark blots that break the even colour of a line.',
			'The adjustment of space between two specific letters, like A and V, where the default fit leaves a hole. Kerning is corrective work, not a substitute for spacing: a well-spaced face needs only a few hundred pairs, a badly spaced one cannot be rescued by thousands.',
			'Two or more letters joined into a single glyph, as in fi or fl. Ligatures exist because a letter can collide with its neighbour — the dot of an i under the hood of an f. What began as a fix for metal type is now an automatic substitution the font performs while you type.',
			'The widths and side-bearings that decide how letters space themselves. Metrics are set before kerning and matter far more: they establish the rhythm the whole family inherits, and a face with good metrics reads evenly in any language, including ones the designer never tested.',
			'A figure, drawn either lining, at cap height and uniform width, or old-style, with ascenders and descenders that let numbers sit inside running text without shouting. Tabular widths keep columns aligned; proportional ones space each figure to its own shape.',
			'The slight excess round letters need past the baseline and cap line to look aligned. A circle drawn to the same height as a square reads smaller — the eye measures area, not extremes. Overshoot is a correction for perception, and it is why optical alignment always beats mathematical alignment.',
			'The relationship between a letter\u2019s height, width and stroke weight. Proportion is where a typeface declares its intentions: a tall x-height and open counters for the screen, classical proportions for a book. Change it and every other decision in the family has to be made again.',
			'The curved marks that frame speech, distinct from the straight prime used for feet and inches. Typing the wrong one is the most common typographic error there is, which is why a serious font draws all four and the software substitutes them for you as you type.',
			'The visual cadence a typeface holds across its counters and spacing. Rhythm is what you actually read: not individual letters but the alternation of stroke and space repeating along a line. When it is even the page goes quiet; when it stumbles the reader feels it without knowing why.',
			'The small stroke finishing a main stroke — absent here, by design. A sans-serif does not simply delete them: without serifs to close a stroke, every terminal, every junction and every width has to be redrawn to carry the weight the serifs used to hold.',
			'The end of any stroke that isn\u2019t a serif. Terminals are cut horizontally, vertically, at an angle or on a curve, and that single decision runs through the whole alphabet. Change the cut and you change the temperament of the face more than any other detail.'
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
