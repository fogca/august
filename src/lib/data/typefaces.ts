// Typeface data definitions for August Type Foundry
// Used by /fonts listing and /fonts/[slug] detail pages.

import type { WeightDef } from '$lib/components/TypeTester/presets.js';
import { WEIGHTS, ELIO_WEIGHTS } from '$lib/components/TypeTester/presets.js';

export type { WeightDef as TypefaceWeight };

export type TypefaceStatus = 'available' | 'in-development';

export interface Typeface {
	slug: string;
	name: string;
	/** Display order (ascending): 1 = Norma, 2 = gQ (Mokuseki Sans), 3 = Elio, 4 = Alfred */
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
		/** Small disclaimer shown under the spec grid — e.g. for a typeface
		 *  still in development, where glyphs/languages aren't final yet. */
		note?: string;
	};
	weights: WeightDef[];
	/** Per-weight default words for the Type Tester — row i uses defaultTexts[i % length] */
	defaultTexts: string[];
	/** Body text set under each word, paired by the same index. */
	defaultNotes?: string[];
	/** Catalogue specimen: a museum-exhibition label set in the face itself,
	 *  rather than the typeface's own name (referenced from increments.cc's
	 *  Vorkurs card: "1964–1969 / JOSEF ALBERS / New Works"). Usually three
	 *  lines — [0] a small date or edition tag, [1] a dedicatee or museum, [2]
	 *  a short descriptor — but any line count works (Norma runs four: A–Z /
	 *  a–z split in half). Rendered at one uniform size and weight across all
	 *  lines (see .FontCard__spec-line in /fonts/+page.svelte). */
	specimen?: string[];
	/** Renders the specimen at this wght instead of the family's own default —
	 *  for typefaces with no drawings of their own yet (Alfred), so their
	 *  placeholder card at least reads as a different cut of the borrowed font
	 *  rather than an identical copy of Norma's own card. Elio doesn't need
	 *  this any more — its own font renders the specimen directly. */
	specimenWeight?: number;
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
	/** Catalogue card background on /fonts. Always paired with black text (per
	 *  card design, not this token) — so keep these light. Deliberately its own
	 *  field rather than reusing `theme`: the hero tone is tuned for a
	 *  full-bleed dark section and several of them (#000, #15181C) would not
	 *  hold black text. */
	/** Optional — omit for no hover swatch (plain type on the page background). */
	catalogBg?: string;
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
		slug: 'norma',
		name: 'Norma',
		order: 1,
		status: 'available',
		fontFamily: 'Norma',
		tagline: 'The formative forces of the word, made visible.',
		// TODO: the naming rationale below used to explain the old name
		// ("Asger", built on Rudolf Steiner's Goethean/anthroposophy reading of
		// nature) — that sentence has been removed rather than rewritten, since
		// it no longer applies and a new one shouldn't be invented unilaterally.
		// Draft the "why Norma" story together before shipping this copy.
		description:
			"Norma is a 20-weight neo-humanist sans-serif variable font. " +
			"Humanist-geometric — the mechanical and the organic coexist in every glyph, held together by formative force. " +
			"Its humanist lineage runs quietly beneath — Johnston's 1916 Underground alphabet, Gill Sans, Neuzeit, Otl Aicher's Rotis — never the surface, only the soil.",
		descriptionDa:
			'Norma er en neo-humanistisk grotesk i 20 vægte, tegnet som variabel skrift. '
			+ 'Humanistisk-geometrisk — det mekaniske og det organiske findes side om side i hvert tegn, holdt sammen af formende kraft. '
			+ 'Den humanistiske slægt løber stille nedenunder — Johnstons Underground-alfabet fra 1916, Gill Sans, Neuzeit, Otl Aichers Rotis — aldrig overfladen, kun jorden.',
		classification: 'Neo Humanist Sans · 20 weights',
		// Measured, not estimated: glyph count is the encoded cmap of the shipped
		// Norma-VF75.woff2. The language count is Hyperglot 0.7.3, base support
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
		// Full alphanumeric proof string, same on every row — 2026-08-31,
		// replacing both the earlier single statement and the astronomy
		// word-per-row idea. One entry, so defaultTexts[i % length] applies
		// it to all twenty weights.
		defaultTexts: ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'],
		// Body copy under each word: what that weight is actually for. Long
		// enough to show the face setting real paragraphs, not just a caption.
		defaultNotes: [
			'The lightest master, drawn at the very end of the axis where a stroke is barely more than a scratch. It exists for display sizes and for nothing else: set it below thirty points and it disappears into the paper. Every other weight in the family is interpolated away from this extreme.',
			'Still a hairline, but with enough substance to survive a large heading in print. Use it where the word should read as a drawn line rather than as text — full-bleed titles, exhibition graphics, anything where the letter is looked at before it is read.',
			'The first weight with a stroke you could call a stroke. Thin holds together in large headlines on screen, where the lighter cuts start to break up against a bright background. It keeps the skeleton legible while giving the page almost nothing in the way of colour.',
			'A half step, drawn for the moment Thin is a fraction too fragile and ExtraLight a fraction too present. Intermediate weights like this one are the argument for a twenty-step family: the designer picks the exact value the layout needs instead of the nearest one available.',
			'Light enough to stay elegant, solid enough to hold at moderate sizes. ExtraLight is where a display setting stops being a stunt and becomes usable — a subheading, a pull quote, a caption set larger than its neighbours and still comfortably read.',
			'Between ExtraLight and Light, this is the weight for long headings set in a wide measure, where a true Light would look heavy and an ExtraLight would look weak. It is the sort of adjustment that used to require redrawing the type; here it is one stop on the axis.',
			'The lightest weight that reads comfortably in running text at generous sizes. Light gives a page air without draining its colour, which is why it appears so often in editorial layouts, gallery print and anywhere the text is meant to feel unhurried.',
			'Named for the setting it was made for. Book is a touch lighter than Regular, the difference a page of continuous text needs when it is printed on white paper at a small size — the ink spread that used to happen on press, now compensated for by drawing.',
			'The default: the weight every other one is measured against. Regular is drawn first and the family is built outward from it, so its proportions, spacing and rhythm are the ones the whole axis inherits. If it is wrong, nothing above or below it can be right.',
			'A Regular with a little more presence, for small sizes and low-contrast screens where the default thins out. Text is the weight to reach for in interface copy set at fourteen points, or in print on absorbent stock, where Regular alone loses its footing.',
			'The first weight that reads as deliberate emphasis rather than as body text. Medium carries a subheading without shouting, and holds up in interfaces where Bold would be too strong for the hierarchy but Regular would not register as a level at all.',
			'Historically the same word as Semibold, kept here as the step below it. Demibold sits where a heading needs weight but the page cannot take the density of a true Semibold — a distinction only visible in a family with steps this fine.',
			'The workhorse of emphasis. Semibold is heavy enough to separate itself from the text around it and light enough to keep its counters open at small sizes, which is why interfaces reach for it far more often than they reach for Bold.',
			'Between Semibold and Bold, for the heading that has to dominate a page without turning into a slab. Its counters are still open, its stems still distinct — the last weight on the way up where the letterforms remain more air than ink.',
			'The standard emphasis weight, and the one every browser means by font-weight: bold. Drawn so that its counters survive at text sizes: the strokes thicken, but the white inside each letter is protected, which is what keeps a bold word readable rather than merely dark.',
			'Past Bold, where added weight starts to cost legibility. UltraBold is a display weight — a word, a number, a headline. Set a sentence in it and the counters begin to close, and the reader stops reading letters and starts reading shapes.',
			'A poster weight. ExtraBold is drawn for size and impact, where the counters are large enough in absolute terms to stay open however heavy the stroke around them. In small sizes it becomes a black rectangle with hints of letters inside.',
			'Heavier still, and by this point the design is about the white, not the black. Every counter has been redrawn by hand: interpolation alone produces blots where strokes meet, so the junctions in this weight are cut back individually.',
			'The heaviest of the CSS keywords, and the weight most people mean when they say a face is fat. Black holds the maximum ink a letter can carry while remaining unmistakably itself — the point past which the skeleton would have to change shape.',
			'The upper master, drawn at wght 950. Ultra is the limit of the axis: the counters are as small as the design permits and the stems as wide. Everything between here and Hair is interpolated from these two extremes, which is why both had to be drawn by hand.'
		],
		// Typeface-page hero: the same wght 1->950 sweep across a row of "a"s
		// used on the home page (see Home__custom's video-specimen commit).
		// Catalogue specimen — full alphabet proof, A–Z then a–z, each split
		// in half across two lines (four total). Replaced the earlier
		// museum-label text (2026-08-31, at the user's request) — no hover
		// swatch either (see catalogBg below), so the card reads as plain type.
		specimen: ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'abcdefghijklm', 'nopqrstuvwxyz'],
		// Filename predates the 2026-08-30 rename (was "Asger") — left as-is,
		// asset paths are internal and not user-facing. Same for the other
		// image/video paths below.
		heroVideo: '/videos/asger_vf_aa.mp4',
		theme: { bg: '#000000', fg: '#ffffff' },
		// No catalogBg — the A–Z/a–z card has no hover swatch (2026-08-31).
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
		// Re-shown 2026-08-29 at the user's request (temporary — "一旦"),
		// even though weight count / spec are not yet final. Re-hidden
		// 2026-08-31 at the user's request.
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
		// Provisional weights — same 12-stop axis as Norma until spec is finalised
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
		// No dedicatee of its own — gQ is an in-house evolution, not a
		// namesake piece — so the label cites a real institution instead:
		// the Japan Folk Crafts Museum (Nihon Mingeikan), whose collection
		// of wood- and stoneware is the closest real-world echo of
		// "Mokuseki" (木石 — wood, stone). Swap for a different venue if
		// this particular pairing doesn't hold up.
		specimen: ['TOKYO, 2026', 'JAPAN FOLK CRAFTS MUSEUM', 'Wood and Stone'],
		thumbnail: '/images/fonts/gq.png',
		theme: { bg: '#EDEAE3', fg: '#1a1a1a' },
		catalogBg: '#EDEAE3',
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
		// Sibling face to Norma. Renamed from "Asta" 2026-08-31. Its own real
		// font exists now — Hair (150), exported and shipped 2026-08-31 — but
		// only that one of the planned 8 weights is drawn; Ultra (850) exists
		// as a Glyphs master but wasn't exported, and the remaining 6 are
		// unstarted instance slots (see presets.ts's ELIO_WEIGHTS). Re-shown
		// 2026-08-29 at the user's request (temporary).
		slug: 'elio',
		name: 'Elio',
		order: 3,
		status: 'in-development',
		hidden: false,
		fontFamily: 'Elio',
		tagline: 'Sibling to Norma.',
		description:
			'Elio is a sibling to Norma, in development at August Type Foundry. ' +
			'Details on its design direction, weights and release schedule will follow.',
		descriptionDa:
			'Elio er en søsterskrift til Norma, under udvikling hos August Type Foundry. '
			+ 'Nærmere om retning, vægte og udgivelsestidspunkt følger.',
		classification: 'In development · 8 weights',
		// Planned spec, not measured — unlike Norma's info (which counts the
		// actual shipped file), only Hair exists yet. Glyphs/languages aren't
		// final until more weights are drawn, hence the note.
		info: {
			design: 'Takumi Isobe',
			release: 'TBD',
			collection: '8 weights',
			formats: 'OTF, TTF, WOFF2',
			glyphs: 'TBD',
			languages: 'TBD',
			note: 'Glyph set and language support still in development — ask us for the current status.'
		},
		// Type Tester shows only the one weight that's actually drawn — the
		// full ELIO_WEIGHTS (8 stops) is reserved for once more are real;
		// showing all 8 now would just repeat Hair's own shapes under 7
		// different wght labels, since this is a static font with nothing to
		// interpolate.
		weights: [ELIO_WEIGHTS[0]],
		defaultTexts: ['Lorem Ipsum is simply dummy text of the printing and typesetting industry.'],
		// Catalogue specimen. Elio's own font (Hair) now renders this directly —
		// no borrowed fontFamily or specimenWeight override needed, unlike
		// Alfred below (still no drawings at all).
		specimen: ['VOL. III', 'ELIO', 'Sibling to Norma'],
		theme: { bg: '#d59514', fg: '#000000' },
		catalogBg: '#F3E2C0',
		hero: {
			label: 'In development',
			vol: 'vol.03',
			subtitle: '(Coming Soon)',
			debut: 'Coming Soon',
			comingSoon: true,
			intro: 'A sibling to Norma.',
			statement: 'Coming soon.'
		}
	},
	{
		// Announced on the home page (ochre section, own logotype) and in the
		// mobile menu's UPCOMING list. Registered here with a catalogue
		// specimen; everything below is still fully provisional (unlike Elio,
		// no drawings at all yet). Re-shown 2026-08-29, re-hidden 2026-08-31,
		// both at the user's request.
		slug: 'alfred',
		name: 'Alfred',
		order: 4,
		status: 'in-development',
		hidden: true,
		// No font files yet — render as Norma for preview purposes
		fontFamily: 'Norma',
		tagline: 'A Neo Classic in development.',
		description:
			'Alfred is a Neo Classic typeface in development at August Type Foundry. ' +
			'Details on its design direction, weights and release schedule will follow.',
		descriptionDa:
			'Alfred er en Neo Classic-skrift under udvikling hos August Type Foundry. '
			+ 'Nærmere om retning, vægte og udgivelsestidspunkt følger.',
		classification: 'In development',
		// Provisional weights — same axis as Norma until the spec is finalised
		weights: WEIGHTS,
		defaultTexts: ['Alfred'],
		// Placeholder catalogue specimen — set at a lighter cut (wght 250)
		// than Norma's own card, so the two don't read as the same font
		// twice (Elio no longer needs this distinction — its own font
		// renders its card now). Replace once Alfred has its own metal.
		specimen: ['VOL. II', 'ALFRED', 'Neo Classic'],
		specimenWeight: 250,
		// Matches the home page's ochre Alfred section exactly (#d59514 / black).
		theme: { bg: '#d59514', fg: '#000000' },
		// A paler tint of the same ochre — distinct from Elio's catalogBg
		// (#F3E2C0), which currently also derives from this colour; see the
		// note where Elio is defined above.
		catalogBg: '#F6E9C9',
		hero: {
			label: 'In development',
			vol: 'vol.04',
			subtitle: '(Coming Soon)',
			debut: 'Coming Soon',
			comingSoon: true,
			intro: 'A Neo Classic in development.',
			statement: 'Coming soon.'
		}
	}
];

export function getTypeface(slug: string): Typeface | undefined {
	return TYPEFACES.find((tf) => tf.slug === slug);
}
