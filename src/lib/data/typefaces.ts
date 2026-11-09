// Typeface data definitions for Apres Guerre
// Used by /fonts listing and /fonts/[slug] detail pages.

import type { WeightDef, TesterLine } from '$lib/components/TypeTester/presets.js';
import { WEIGHTS, ANGO_WEIGHTS } from '$lib/components/TypeTester/presets.js';
import type { GlyphGroup, MetricLine } from './humoristOverview.js';
import {
	HUMORIST_GLYPH_GROUPS,
	HUMORIST_METRICS,
	HUMORIST_FEATURES,
	HUMORIST_LANGUAGES
} from './humoristOverview.js';

export type { WeightDef as TypefaceWeight };

export type TypefaceStatus = 'available' | 'in-development';

/** One item of a typeface page's gallery. Every item is as tall as the
 *  others; the typographic tiles keep their own proportions and a picture's
 *  width follows its own — never cropped. What does not fit scrolls sideways.
 *  - `glyphs`: the tile cycling through A-Z, a-z, 0-9.
 *  - `specimen`: the typographic proof (`specimen` lines, else the name).
 *  - `video`: the weight-axis video (`heroVideo`).
 *  - `tagline`: the tagline, set at the lightest weight.
 *  - `image`: a picture; `width`/`height` are the file's pixel size. */
export type GalleryItem =
	| { kind: 'glyphs' }
	| { kind: 'specimen' }
	| { kind: 'video' }
	| { kind: 'tagline' }
	| { kind: 'image'; src: string; alt: string; width: number; height: number };

/** The foundry's initials, the prefix of every public typeface name
 *  (2026-10-30, at the user's request — "APGRは全てつけるようにして"), the way
 *  Kontrapunkt Type's are "KP Duo Sans". Slugs follow: lowercase, hyphenated
 *  (`ttt-humorist`). The big display of a name drops it — see displayName().
 *  "TTT" (Time Type Tokyo) since 2026-11-06, at the user's request ("書体名は
 *  APGR {XXX}からTTT {XXX}に変更"), and the slugs with them the same day
 *  ("リンク含めて全て変えて"): `apgr-…` → `ttt-…`, the old ones 301 (LEGACY_SLUGS
 *  below and the repo-root _redirects). */
export const NAME_PREFIX = 'TTT';

export interface Typeface {
	/** `ttt-` + the name, lowercase and hyphenated (Norma keeps `norma`: the
	 *  pricing and checkout tables are keyed by it, and the face is hidden). */
	slug: string;
	/** Public name, prefix included (e.g. 'TTT Humorist'). The CSS family
	 *  (`fontFamily`) and the font/image files keep their old internal names. */
	name: string;
	/** Display order (ascending): 1 = Norma, 2 = Humorist, 3 = Maxica, 4 = Quad Sans, 5 = Alfred */
	order: number;
	status: TypefaceStatus;
	/** Temporarily hide from all listings (top page, /fonts, header menu) */
	hidden?: boolean;
	/** A name on the shelf before the face is finished (Maxica, Quad Sans). Its
	 *  page is the hero name, the spec lines, the description, a one-row Type
	 *  Tester and "Coming soon" — no weights or glyphs to show, and none are
	 *  invented. */
	placeholder?: boolean;
	/** What kind of typeface it is, for the spec lines ("Classification:").
	 *  Only what the foundry has said about it. */
	category?: string;
	/** CSS font-family value to use in the Type Tester */
	fontFamily: string;
	tagline: string;
	description: string;
	/** French running translation of the description (shown under the English). */
	descriptionFr?: string;
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
	/** The Type Tester's own lines (text, weight, size, spacing — a single word
	 *  the width of the screen down to running text), shown above the
	 *  weight-by-weight rows. Left out, the tester is the weight rows alone. */
	testerLines?: TesterLine[];
	/** The weights a visitor can switch every tester row to (2026-11-08, at the
	 *  user's request — "weight選択できるようにして欲しい"): the face's own named
	 *  stops, for a real variable font. Left out, the rows keep their weights. */
	weightMenu?: WeightDef[];
	/** The notice under the Type Tester, for a face where the default ("… is in
	 *  development. Preview shown in Norma.") isn't true — a placeholder that
	 *  borrows a face, or a face still missing characters. */
	testerNotice?: string;
	/** Catalogue specimen: a museum-exhibition label set in the face itself,
	 *  rather than the typeface's own name (referenced from increments.cc's
	 *  Vorkurs card: "1964–1969 / JOSEF ALBERS / New Works"). Usually three
	 *  lines — [0] a small date or edition tag, [1] a dedicatee or museum, [2]
	 *  a short descriptor — but any line count works (Norma runs four: A–Z /
	 *  a–z split in half). Rendered at one uniform size and weight across all
	 *  lines (see .FontCard__spec-line in /fonts/+page.svelte). */
	specimen?: string[];
	/** The wght the big name is set at on /fonts and at the top of the typeface
	 *  page. Also what lets a typeface with no drawings of its own yet (Alfred,
	 *  which borrows Norma) read as a different cut of the borrowed font
	 *  rather than an identical copy of Norma's own. */
	specimenWeight?: number;
	/** What the big name at the top of the typeface page says, and the wght it
	 *  is set at, when they differ from displayName() and specimenWeight. The
	 *  /fonts list keeps using the latter two. */
	pageTitle?: string;
	pageTitleWeight?: number;
	/** Optional hero thumbnail (image path under /). When absent, the slide
	 *  falls back to a large typographic placeholder. */
	thumbnail?: string;
	/** Optional hero video (used in preference to thumbnail when present). */
	heroVideo?: string;
	/** The typeface page's gallery, in order, left to right (2026-10-11, at the
	 *  user's request — the whole gallery is one sideways-scrolling strip, to
	 *  which more pictures will be added). Omit for the default three: the
	 *  cycling glyph, then the weight-axis video (or, with none, the tagline),
	 *  then the specimen. See GalleryItem. */
	gallery?: GalleryItem[];
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
	/** "In Use" row on the typeface page — 4-5 real-world application photos
	 *  shown side by side. Optional: when absent, the section still renders
	 *  (same convention as the rest of this in-development-friendly page —
	 *  see Alfred/Ango's placeholder hero etc.) as four empty labelled
	 *  slots, so the page's structure doesn't change once photos exist. */
	inUseImages?: { src: string; alt: string }[];
	/** Inspiration section — reference imagery plus a short passage on a
	 *  specific design influence, distinct from (and more specific than)
	 *  `description`'s general lineage statement. Genuinely optional: unlike
	 *  inUseImages, an empty/placeholder version of this section is not
	 *  rendered — a placeholder image is honest, a placeholder paragraph
	 *  about "inspiration" would just be invented copy, so the whole
	 *  section is skipped for typefaces that don't have one yet. */
	inspiration?: {
		paragraph: string;
		paragraphFr?: string;
		/** Reference images; entries without `src` render as a placeholder
		 *  slot (same treatment as inUseImages). */
		images: { src?: string; alt: string }[];
	};
	/** Glyph Overview section (after Kontrapunkt Type's): the encoded
	 *  characters by group, and the vertical metrics ruled over the big glyph —
	 *  both read off the shipped font (humoristOverview.ts, generated). Omit
	 *  for no such section. */
	overview?: { groups: GlyphGroup[]; metrics: MetricLine[] };
	/** Information section: the font's OpenType feature tags and the languages
	 *  Hyperglot verifies it for. Omit for no such section. */
	information?: { features: string[]; languages: string[] };
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
	/** Home page "typeface section" (100vh full-bleed intro, one per typeface —
	 *  Figma nodes 3:699/3:733 PC, 7:887/7:906 SP). Distinct from `theme`
	 *  (used by this typeface's own /fonts/[slug] hero) since this redesign
	 *  introduces its own per-section brand colours. Omit to skip a typeface
	 *  in this section entirely (same convention as `hidden`). */
	homeSection?: {
		/** The accent panel behind the giant self-referential headline. */
		panelBg: string;
		panelFg: string;
		/** The two blocks that stand in for real specimen photography — none
		 *  exists yet for any typeface (see `heroVideo` below for the one
		 *  exception), so these render as solid colour + real typographic
		 *  content instead of a placeholder photo. */
		blockBg: string;
		blockFg: string;
		/** Colours of the two typographic tiles (the cycling glyph and the
		 *  specimen), where they should differ from the panel's. Any CSS
		 *  colour, `var(--token)` included. Default: the panel's. */
		galleryBg?: string;
		galleryFg?: string;
		/** Large single diagnostic glyph shown in the first block when there's
		 *  no `heroVideo` to show there instead. */
		glyph: string;
		/** Giant self-referential classification headline, set in the
		 *  typeface's own font inside the accent panel. */
		headline: string;
		/** wght axis value for the headline (a real instance of this
		 *  typeface's own axis, not a generic CSS keyword — e.g. Ango's own
		 *  Hair master at 150, per Figma, deliberately delicate despite the
		 *  headline's large size). */
		headlineWeight: number;
		/** Home page hero (2026-10 redesign, Figma 175:178 / 7:874): the name
		 *  as set bottom-left on the panel, when it differs from `name`. */
		heroName?: string;
		/** wght the hero name is set at — a real instance of the face's axis. */
		heroWeight: number;
		/** A picture for the home page hero in place of the plain dark panel
		 *  (2026-10-11): fills the hero, cropped to it (object-fit: cover).
		 *  `srcSm` is the portrait version for phones. `bg` is the colour
		 *  behind it while it loads, `fg` the colour of the type over it, and
		 *  `tone` whether the picture is light or dark — what the Header reads
		 *  to pick its own colour. */
		heroImage?: {
			src: string;
			srcSm?: string;
			bg: string;
			fg: string;
			tone: 'light' | 'dark';
		};
	};
}

/** Ango's Type Tester default text sets, kept by name so any of them can be
 *  the default (see Ango's `defaultTexts` below).
 *
 *  - `wine`: the original defaults — wine/terroir vocabulary, A-H, one word
 *    or short phrase per weight row, from the user's own list. Kept exactly
 *    as it was ("今のAngoのデフォテキストはワインとして記憶しておいて").
 *    There are eight, for nine weights, so the Ultra row used to wrap back
 *    round to 'Appellation'.
 *  - `cheese`: the default from 2026-10 until 2026-10-11 (at the user's
 *    request — "チーズの名前で少し長めの…Aから順に"). One row per weight, A through I, three
 *    cheeses a row in alphabetical order, each line chosen to fit on one line
 *    at the 100px desktop default (about 80-90% of a 1440px screen at its own
 *    weight — checked against the font's advance widths). Only glyphs the
 *    shipped VF has (the typographic apostrophe, for one, is not among them,
 *    so none is used).
 *  - `mozzarellaBrie`: the current default — see its own note. */
const ANGO_TESTER_TEXTS: Record<
	'wine' | 'cheese' | 'mozzarellaBrie' | 'pinotChardonnay' | 'alphabet',
	string[]
> = {
	wine: [
		'Appellation',
		'Blanc de Blancs',
		'Cuvée Cépage',
		'Dégustation',
		'Effeuillage',
		'Franc de pied',
		'Goût de terroir',
		'Héritage'
	],
	/** The default since 2026-10-11 (at the user's request — "全てのweightで
	 *  Mozzarella & Brie de Meauxにして"): one line, repeated on every row
	 *  (a single-entry set — rows read defaultTexts[i % length]). About 90% of
	 *  a 1440px screen at 100px at any weight. The ampersand isn't in
	 *  Ango-VF26; VF27 (2026-10-11) added it, so Ango draws it itself now. */
	mozzarellaBrie: ['Mozzarella & Brie de Meaux'],
	/** The default since 2026-11-05 (at the user's request — "文言はチーズから
	 *  ワイン系にして"): the same single line on every row, in place of
	 *  `mozzarellaBrie`. Narrower than it at every weight (measured at 150 and
	 *  950), so it fits wherever that one did. */
	pinotChardonnay: ['Pinot Noir & Chardonnay'],
	/** The default since 2026-11-08, in place of Pinot Noir & Chardonnay on
	 *  every row (at the user's request — "Pinot Noir & Chardonayは全て、
	 *  AaBbCcDdEeFfGgに置換"). */
	alphabet: ['AaBbCcDdEeFfGg'],
	cheese: [
		'Abondance Asiago Azeitão',
		'Bleu de Gex Brie Burrata',
		'Camembert Cheddar Comté',
		'Danablu Dolcelatte Dubliner',
		'Edam Emmental Époisses',
		'Feta Fiore Sardo Fontina',
		'Gorgonzola Gouda Gruyère',
		'Halloumi Harzer Havarti',
		'Ibores Idiazabal Isle of Mull'
	]
};

/** Running text for Humorist's Type Tester (2026-11-09, at the user's request
 *  — "ワイン系ではなくて、世界的古典とかの文章に"; it was six paragraphs on wine):
 *  the opening of Lewis Carroll's Alice's Adventures in Wonderland (1865,
 *  public domain; Project Gutenberg #11, italics markers dropped). The lines
 *  draw on it by length — the first paragraph at 48px, the first four at
 *  19px, all six at 14px. Every character is in Ango-VF43's cmap. Quotes
 *  and apostrophes are set straight (" '): Ango-VF43's curly ones (“ ” ‘ ’)
 *  are still drafts that read as primes and backticks. */
const ALICE_PARAGRAPHS = [
	"Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, \"and what is the use of a book,\" thought Alice \"without pictures or conversations?\"",
	"So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.",
	"There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, \"Oh dear! Oh dear! I shall be late!\" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.",
	"In another moment down went Alice after it, never once considering how in the world she was to get out again.",
	"The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.",
	"Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next. First, she tried to look down and make out what she was coming to, but it was too dark to see anything; then she looked at the sides of the well, and noticed that they were filled with cupboards and book-shelves; here and there she saw maps and pictures hung upon pegs. She took down a jar from one of the shelves as she passed; it was labelled \"ORANGE MARMALADE\", but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody underneath, so managed to put it into one of the cupboards as she fell past it."
];
const aliceText = (n: number) => ALICE_PARAGRAPHS.slice(0, n).join('\n\n');

/** Humorist's Type Tester lines (2026-11-04, at the user's request — after
 *  type.kontrapunkt.com/en/fonts/kp-duo-sans: "もっと全体的にコントラストつけて",
 *  "本文などはもっと長文に"; 2026-11-05, "文言はチーズからワイン系にして"). It
 *  opens with Vin and Dégustation!, then runs through the cellar's own French
 *  terms (assemblage, dégorgement, remuage…), one to a row, before the capitals
 *  line, the sentence and running text in columns. Each has its own weight,
 *  sized so a single word nearly fills the width of a 1440px screen (measured
 *  at that weight and spacing, 97% of 1360px), tighter in the spacing the
 *  bigger it is. Remuage is the Hair row (wght 150 until VF33, 50 from VF34,
 *  where 150 became Thin). Every character is in
 *  Ango-VF33 (checked against its cmap; VF34 adds `%` `^` `~` and Þ Œ as drafts), which rules out `%` `@` `^` `~` and
 *  Þ ß Ł Œ ź. Three drawn glyphs are not used either, because they show at this
 *  size: the middle dot is a copy of the period (baseline, y -9…31), and `€`
 *  `$` `¢` keep their Hair-thin bars and ticks at every heavier weight (the
 *  euro's bars run out to the left). A phone's sizes are the same words fitted
 *  to 360px. */
const HUMORIST_TESTER_LINES: TesterLine[] = [
	// The opening word is the name, sized to one line (2026-11-08, at the
	// user's request — "最初VInが大きく表示されてるけど、HUMORISTにして、1行で
	// 収まる程度のサイズをデフォにして"): HUMORIST measures 5.04em at this
	// spacing, nearly the same at every weight (5.03-5.07em, Regular to Black),
	// so 97% of 1360px / 360px holds on one line whichever weight is chosen.
	// The single cellar words that followed (Dégustation! to Soutirage) were
	// removed the same day ("ブロックはまるまる消して"). Set in Regular ("最初の
	// HUMORISTは流石にRegularかな").
	{ text: 'HUMORIST', wght: 450, sizeDesktop: 261, sizeMobile: 74, lineHeight: 1.1, letterSpacing: -0.03 },
	{
		// Two lines (2026-11-08, at the user's request — "NEW<br>DEBUTに変えて");
		// it was "PICKED. AGED. POURED.". DEBUT, the longer, is ≤3.03em at
		// every weight, so each line holds at this size.
		text: 'NEW\nDEBUT',
		wght: 850,
		sizeDesktop: 333,
		// Phone sizes from 2026-11-08 (the user's screenshot: 74 / 130 / 41 /
		// 60px), fitted to 380px (390 less 5px a side) at the widest weight
		// each line would show: HUMORIST 5.07em, DEBUT 3.03em, Geometrical
		// Humanist 9.03em in Hair, (0123456789) 6.07em in Regular — the
		// AaBbCc line wraps into its three groups.
		sizeMobile: 124,
		lineHeight: 0.95,
		letterSpacing: -0.04
	},
	// The sentence that followed ("Old vines, a cold cellar…") was removed
	// 2026-11-08, at the user's request ("このセクション削除").
	// Added 2026-11-08 at the same size as the line below, in Hair (at the
	// user's request — "同じサイズのテスター増やして、Hairで、Geometrical
	// Humanistをデフォに").
	{
		text: 'Geometrical Humanist',
		wght: 50,
		sizeDesktop: 108,
		sizeMobile: 41,
		lineHeight: 1.1,
		letterSpacing: -0.02
	},
	{
		text: 'AaBbCc (0123456789) ?!&#',
		wght: 450,
		sizeDesktop: 108,
		sizeMobile: 60,
		lineHeight: 1.1,
		letterSpacing: -0.02
	},
	{ text: aliceText(1), wght: 350, sizeDesktop: 48, sizeMobile: 24, lineHeight: 1.15, letterSpacing: -0.01 },
	{ text: aliceText(4), wght: 450, sizeDesktop: 19, sizeMobile: 16, lineHeight: 1.4, columns: 3 },
	{ text: aliceText(6), wght: 450, sizeDesktop: 14, sizeMobile: 13, lineHeight: 1.4, columns: 3 }
];

/** Running text for Maxa's Type Tester (2026-11-09, at the user's request —
 *  "ワイン系ではなくて、世界的古典とかの文章に"; it was ten stanzas about a
 *  vineyard): the opening of Jane Austen's Pride and Prejudice (1813, public
 *  domain; Project Gutenberg #1342, illustration captions and italics markers
 *  dropped, `--` set as an em dash). The lines draw on it by length — 2, 14
 *  and 24 paragraphs at 48 / 19 / 14px, about as much text as Humorist's.
 *  Every character is in Maxica-VF25's cmap. */
const PRIDE_PARAGRAPHS = [
	"It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.",
	"However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
	"“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”",
	"Mr. Bennet replied that he had not.",
	"“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”",
	"Mr. Bennet made no answer.",
	"“Do not you want to know who has taken it?” cried his wife, impatiently.",
	"“You want to tell me, and I have no objection to hearing it.”",
	"This was invitation enough.",
	"“Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.”",
	"“What is his name?”",
	"“Bingley.”",
	"“Is he married or single?”",
	"“Oh, single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!”",
	"“How so? how can it affect them?”",
	"“My dear Mr. Bennet,” replied his wife, “how can you be so tiresome? You must know that I am thinking of his marrying one of them.”",
	"“Is that his design in settling here?”",
	"“Design? Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes.”",
	"“I see no occasion for that. You and the girls may go—or you may send them by themselves, which perhaps will be still better; for as you are as handsome as any of them, Mr. Bingley might like you the best of the party.”",
	"“My dear, you flatter me. I certainly have had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty.”",
	"“In such cases, a woman has not often much beauty to think of.”",
	"“But, my dear, you must indeed go and see Mr. Bingley when he comes into the neighbourhood.”",
	"“It is more than I engage for, I assure you.”",
	"“But consider your daughters. Only think what an establishment it would be for one of them. Sir William and Lady Lucas are determined to go, merely on that account; for in general, you know, they visit no new comers. Indeed you must go, for it will be impossible for us to visit him, if you do not.”"
];
const prideText = (n: number) => PRIDE_PARAGRAPHS.slice(0, n).join('\n\n');

/** Maxica's Type Tester lines (2026-11-04, "Maxicaも同様に対応して"; wine
 *  copy 2026-11-05): the same shape as Humorist's — Vin, Degustation, the
 *  cellar's own terms one to a row, a loud capitals line, one sentence, the
 *  lowercase alphabet, then running text at 48/19/14px — in the weights
 *  100-900 of the site's scale (Thin to Black). No letter-spacing anywhere
 *  (2026-11-05, at the user's request — Maxica's own spacing is drawn to read
 *  well at 0): each word is sized to ~96% of a 1440px screen as measured at
 *  its weight with tracking 0. Maxica has no accents or `!` yet, so the terms
 *  are the ones French spells without any (assemblage, vendange, remuage…)
 *  and "Degustation" stands without its é and bang. The two masters sit at 50
 *  and 950, so the extremes are left to the interpolation. */
const MAXICA_TESTER_LINES: TesterLine[] = [
	// Opens on the name in Regular at one line, its single cellar words gone
	// (2026-11-08, at the user's request — "Maxaの書体ページも同様にアップデート",
	// after Humorist's). MAXA is 3.08em in Regular and 3.25em in Black
	// (VF20), so 97% of 1360px / 360px at the widest weight keeps it on one
	// line whichever weight is chosen. VF24 (cap height 720 → 700) took the
	// capitals to 2.99em / 3.15em, so both sizes grew by the same 2.9%
	// (406 → 417, 113 → 116) to keep the line exactly as full.
	// "Mid-Century" / "Classical Modern" replaced MAXA and HARVEST OF / THE
	// VINEYARD (2026-11-09, at the user's request). Each fits one line at
	// its widest weight (VF25: 6.09em / 8.00em in Black) in 97% of 1360px /
	// 380px, so it stays on one line whichever weight is chosen.
	{ text: 'Mid-Century', wght: 450, sizeDesktop: 216, sizeMobile: 60, lineHeight: 1.1 },
	{ text: 'Classical Modern', wght: 850, sizeDesktop: 164, sizeMobile: 46, lineHeight: 1.1 },
	{
		text: 'the cellar opens at first light and the first glasses of pinot and merlot are poured from the oldest barrels',
		wght: 450,
		sizeDesktop: 80,
		sizeMobile: 28,
		lineHeight: 1.1
	},
	{
		text: 'abcdefghijklmnopqrstuvwx',
		wght: 450,
		sizeDesktop: 108,
		sizeMobile: 28,
		lineHeight: 1.1
	},
	{ text: prideText(2), wght: 450, sizeDesktop: 48, sizeMobile: 24, lineHeight: 1.15 },
	{ text: prideText(14), wght: 450, sizeDesktop: 19, sizeMobile: 16, lineHeight: 1.4, columns: 3 },
	{ text: prideText(24), wght: 450, sizeDesktop: 14, sizeMobile: 13, lineHeight: 1.4, columns: 3 }
];

export const TYPEFACES: Typeface[] = [
	{
		slug: 'norma',
		// Prefixed with the rest (2026-10-30). Its final name is still open —
		// Linotype already sells a "Norma" — and the prose below still says
		// "Norma": settle the name, then rewrite it (see the TODO below).
		name: 'TTT Norma',
		category: 'Neo humanist sans-serif',
		order: 1,
		status: 'available',
		// Hidden for now (2026-10-11, at the user's request — "一旦Norma非表示
		// にして、Angoをメインに"): out of the home page, /fonts, the menu, and
		// its own URL (404). Take this line out to bring it all back. The
		// About page's Norma block, /opentype's back link and the catalogue's
		// subtitle follow it automatically.
		hidden: true,
		fontFamily: 'Norma',
		tagline: 'The formative forces of the word, made visible.',
		// TODO: the naming rationale below used to explain the old name
		// ("Asger", built on Rudolf Steiner's Goethean/anthroposophy reading of
		// nature) — that sentence has been removed rather than rewritten, since
		// it no longer applies and a new one shouldn't be invented unilaterally.
		// Draft the "why Norma" story together before shipping this copy.
		description:
			'Norma is a 20-weight neo-humanist sans-serif variable font. ' +
			'Humanist-geometric — the mechanical and the organic coexist in every glyph, held together by formative force. ' +
			"Its humanist lineage runs quietly beneath — Johnston's 1916 Underground alphabet, Gill Sans, Neuzeit, Otl Aicher's Rotis — never the surface, only the soil.",
		descriptionFr:
			'Norma est une police variable sans-serif néo-humaniste en 20 graisses. ' +
			"Humaniste-géométrique — le mécanique et l'organique coexistent dans chaque glyphe, tenus ensemble par une force formatrice. " +
			"Sa filiation humaniste affleure discrètement — l'alphabet du métro londonien de Johnston (1916), le Gill Sans, le Neuzeit, le Rotis d'Otl Aicher — jamais en surface, seulement dans le terreau.",
		classification: 'Neo Humanist Sans · 20 weights',
		// Measured, not estimated: glyph count is the encoded cmap of the shipped
		// Norma-VF02.woff2. The language count is Hyperglot 0.7.3, base support
		// restricted to --validity verified — i.e. only languages whose charset
		// data Hyperglot has checked. Its default (draft data included) reports
		// 246, which counts a long tail of unverified minority orthographies and
		// overstates the case. Formats follow docs/FULFILLMENT.md (still a draft).
		info: {
			design: 'Takumi Isobe',
			release: 'July 2026',
			collection: '20 weights, variable',
			formats: 'TTF, WOFF2',
			glyphs: '340',
			languages: '93'
		},
		weights: WEIGHTS,
		// Continues Ango's A-H wine/terroir word list (2026-09, at the user's
		// request) — Ango's own 8 rows are single words per letter; Norma's 20
		// rows push further, one full French definition-style sentence per
		// row, roughly alphabetical from I onward. 18 letters remain (I-Z);
		// U/W/X/Y have no natural single-word French wine term, so those are
		// skipped and M/R/S/T/V (each genuinely rich in real vocabulary)
		// carry two entries instead, still reaching 20 without inventing a
		// term that doesn't actually exist. Every sentence is a real,
		// accurate definition, not invented trivia.
		defaultTexts: [
			"L'irrigation est l'apport artificiel d'eau à la vigne, une pratique strictement encadrée ou interdite dans de nombreuses appellations européennes.",
			'Le jéroboam est un format de bouteille équivalant à quatre bouteilles standards, soit environ trois litres, utilisé notamment en Champagne.',
			'Le kir est un apéritif composé de crème de cassis et de vin blanc, traditionnellement un bourgogne aligoté.',
			'La lie désigne les dépôts de levures mortes qui se forment au fond de la cuve après la fermentation, parfois conservés au contact du vin pour enrichir sa texture.',
			"Le millésime correspond à l'année de récolte du raisin ayant servi à l'élaboration du vin.",
			'La fermentation malolactique transforme l’acide malique, plus âpre, en acide lactique, plus rond, adoucissant ainsi le vin.',
			'Le négociant achète du raisin, du moût ou du vin à des vignerons pour l’élever et le commercialiser sous sa propre marque.',
			"L'œnologie est la science qui étudie l'ensemble des techniques de vinification et d'élevage du vin.",
			'Le phylloxéra est un insecte ravageur qui a détruit la majeure partie du vignoble européen à la fin du dix-neuvième siècle.',
			'Une quinta est une propriété viticole portugaise, terme le plus souvent associé aux domaines de la vallée du Douro produisant du porto.',
			"La robe désigne la couleur et l'aspect visuel d'un vin, premier élément observé lors d'une dégustation.",
			'Le rendement mesure la quantité de raisin ou de vin produite par hectare, un critère souvent plafonné par les cahiers des charges des appellations.',
			'Le sommelier est le professionnel chargé de la sélection, de la conservation et du service du vin, notamment dans la restauration.',
			'Un vin sec ne contient qu’une quantité minime de sucre résiduel, par opposition aux vins moelleux ou liquoreux.',
			'Le terroir désigne l’ensemble des facteurs naturels — sol, climat, exposition — qui confèrent au vin son caractère propre à un lieu donné.',
			'Le tanin est un composé présent dans la peau, les pépins et parfois le bois, responsable de la sensation d’astringence en bouche.',
			'La taille est l’opération qui consiste à couper une partie des sarments en hiver afin de limiter et d’orienter la production de la vigne.',
			'La vendange désigne la récolte du raisin, réalisée à la main ou à la machine selon les domaines.',
			'Le vigneron est celui qui cultive la vigne et élabore lui-même son vin, du travail de la terre jusqu’à la mise en bouteille.',
			'Le zeste évoque, en dégustation, des arômes d’agrumes perçus au nez ou en bouche, fréquents dans les vins blancs vifs.'
		],
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
			'The upper master. Ultra is the limit of the axis: the counters are as small as the design permits and the stems as wide. Everything between here and Hair is interpolated from these two extremes, which is why both had to be drawn by hand.'
		],
		// Typeface-page hero: the same wght 1->950 sweep across a row of "a"s
		// used on the home page (see Home__custom's video-specimen commit).
		// Catalogue specimen — full alphabet proof, A–Z joined straight into
		// a–z (one continuous 52-character run) and wrapped evenly across
		// three lines. Replaced the earlier museum-label text (2026-08-31, at
		// the user's request) — no hover swatch either (see catalogBg below),
		// so the card reads as plain type.
		specimen: ['ABCDEFGHIJKLMNOP', 'QRSTUVWXYZabcdefg', 'hijklmnopqrstuvwxyz'],
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
		},
		// Home page typeface section (Figma 3:699/7:887, 2026-09). Reuses the
		// site's own established red (--color-signal) rather than Figma's raw
		// #D40000 swatch — close enough to be the same brand red, so introducing
		// a second near-identical one would just be inconsistency. First block
		// is the existing wght-sweep video (real asset, no CSS-block needed);
		// second is the A-Z/a-z specimen proof, set in the panel's own red.
		homeSection: {
			panelBg: 'var(--color-signal)',
			panelFg: '#F1F0EF',
			blockBg: '#000000',
			blockFg: '#F1F0EF',
			glyph: 'a',
			headline: 'Natural Humanist Sans',
			headlineWeight: 500,
			// Home hero: "NORMA" in Norma Regular, as drawn (Figma 175:178).
			heroName: 'NORMA',
			heroWeight: 400
		}
	},
	{
		// A placeholder (2026-10-30, at the user's request — "プレースホルダーでいい
		// ので、入れておいて"): the sans half of a Sans + Serif sibling family.
		// "GQ Sans" until 2026-10-31 (GQ is Condé Nast's), then Quad Sans, at the
		// user's request — "GQは、Quad Sansとして" — with the face itself: the
		// drawings formerly shown as "Mokuseki Sans" (a client's name, kept off
		// the public site), exported from Quad.glyphs as one Regular. Its CSS
		// family is 'Quad Sans' (app.html @font-face; QuadSans-Regular.woff2).
		slug: 'ttt-quad-sans',
		name: 'TTT Quad Sans',
		category: 'Sans-serif',
		order: 4,
		status: 'in-development',
		placeholder: true,
		fontFamily: 'Quad Sans',
		tagline: 'In development.',
		description:
			'TTT Quad Sans is a sans-serif in development at Apres Guerre, one half of a family that will pair it with a serif. ' +
			'Details on its design direction, weights and release schedule will follow.',
		descriptionFr:
			'TTT Quad Sans est un sans-serif en cours de développement chez Apres Guerre, une moitié d’une famille qui l’associera à un serif. ' +
			'Les détails sur son orientation, ses graisses et son calendrier de sortie suivront.',
		classification: 'Sans-serif · In development',
		// The one cut there is: a Regular (the file is static, so wght 400 is
		// only its name in the Type Tester's row).
		weights: [{ id: 40, name: '40', label: 'Regular', axisValue: 400 }],
		defaultTexts: ['TTT Quad Sans'],
		// About a quarter of the basic set is still undrawn (? @ % $ ( ) [ ] …);
		// the build leaves those out, so the page sets them in another face.
		testerNotice:
			'TTT Quad Sans is in development. Characters not drawn yet are set in another face.',
		specimen: ['ABCDEFGHIJKLMNOP', 'QRSTUVWXYZabcdefg', 'hijklmnopqrstuvwxyz'],
		thumbnail: '/images/fonts/gq.png',
		theme: { bg: '#EDEAE3', fg: '#1a1a1a' },
		hero: {
			label: 'In development',
			vol: 'vol.04',
			subtitle: '(Coming Soon)',
			debut: 'Coming Soon',
			comingSoon: true,
			intro: 'A sans-serif in development.',
			statement: 'Coming soon.'
		}
	},
	{
		// A placeholder (2026-10-30): the grotesque in progress. "Maxica" =
		// Maxima + Helvetica, after the way Unica is Univers + Helvetica. It
		// borrowed Norma at wght 500 until 2026-11-01, when its own variable
		// font went on (Maxica-VF19.woff2, wght 50–950; VF20, VF21 on 2026-11-08). Drawn in both masters so
		// far: A–Z a–y (z is not in yet), so the default
		// tester text is the name (all of its letters are in the file);
		// anything else a visitor types falls back to Norma, then the
		// browser's sans-serif.
		// Shown as "Maxa" since 2026-11-05 (at the user's request — "書体名、
		// 一回Maxaにしてみて", a trial), confirmed 2026-11-06 ("Maxaで確定、
		// ttt-maxaにして"): the slug followed (`ttt-maxica` and `apgr-maxica`
		// 301 here). The CSS family ('Maxica') and the font file keep the
		// working name, as Humorist's keep 'Ango'.
		slug: 'ttt-maxa',
		name: 'TTT Maxa',
		category: 'Neo-grotesque sans-serif',
		order: 3,
		status: 'in-development',
		placeholder: true,
		fontFamily: 'Maxica',
		tagline: 'In development.',
		// Concept text agreed 2026-11-09 (built like Unica's story, without
		// naming it: two forebears, build from one and measure from the other,
		// what the mix makes possible, where it is used). Facts checked: Maxima
		// = Gert Wunderlich for Typoart, Dresden, begun 1963, capitals in
		// classical-roman proportions + a narrow lowercase for reading; Maxa's
		// ascenders rise above the capitals since VF24 (cap 700, asc 720).
		description:
			'TTT Maxa is a neo-grotesque drawn from two answers to the same mid-century question. ' +
			'In Switzerland, Helvetica made the grotesque firm, dense and even. ' +
			"In the 1960s, the book designer Gert Wunderlich drew Maxima for Typoart in Dresden as East Germany's own answer: a sans whose capitals keep the proportions of the classical roman, and whose narrow lowercase was cut for reading. " +
			"Maxa takes Helvetica's build — level terminals, firm curves, close spacing — and Maxima's measure: capitals that are wide or narrow as their roman ancestors were, and ascenders that rise above them, so capitals sit quietly in a line of text. " +
			'At a glance it is as plain as any grotesque; its capitals keep a rhythm that grotesques usually give up. ' +
			'That makes it useful where a neo-grotesque turns stiff: names, titles and wayfinding set in capitals; text full of capitals, such as German or lists of proper names; identities that run from a wordmark into body text in one typeface. ' +
			'One weight axis runs from Hair for large display to Black for posters.',
		descriptionFr:
			'TTT Maxa est une néo-grotesque née de deux réponses à une même question du milieu du XXe siècle. ' +
			"En Suisse, l'Helvetica a rendu la grotesque ferme, dense et régulière. " +
			"Dans les années 1960, le graphiste du livre Gert Wunderlich a dessiné la Maxima pour Typoart à Dresde, réponse propre de l'Allemagne de l'Est : une linéale dont les capitales gardent les proportions de la romaine classique, et dont les bas-de-casse étroits ont été taillés pour la lecture. " +
			"Maxa emprunte à l'Helvetica sa construction — terminaisons horizontales, courbes tendues, approche serrée — et à la Maxima sa mesure : des capitales larges ou étroites comme l'étaient leurs ancêtres romaines, et des ascendantes qui les dépassent, si bien que les capitales restent discrètes dans une ligne de texte. " +
			'Au premier regard, elle est aussi simple que n’importe quelle grotesque ; ses capitales gardent pourtant un rythme que les grotesques abandonnent d’ordinaire. ' +
			'Elle sert ainsi là où une néo-grotesque se fige : noms, titres et signalétique composés en capitales ; textes riches en majuscules, comme l’allemand ou les listes de noms propres ; identités qui passent du logotype au texte courant dans un seul caractère. ' +
			'Un seul axe de graisse va du Hair, pour les grands titres, au Black, pour les affiches.',
		classification: 'Neo-grotesque · In development',
		weights: WEIGHTS,
		defaultTexts: ['Maxa'],
		testerLines: MAXICA_TESTER_LINES,
		// Its ten named stops are Humorist's (Hair 50 … Regular 450 … Black 950).
		weightMenu: ANGO_WEIGHTS,
		testerNotice:
			'TTT Maxa is in development. Characters not drawn yet are set in another face.',
		specimen: ['ABCDEFGHIJKLMNOP', 'QRSTUVWXYZabcdefg', 'hijklmnopqrstuvwxyz'],
		specimenWeight: 500,
		theme: { bg: '#EDEAE3', fg: '#1a1a1a' },
		hero: {
			label: 'In development',
			vol: 'vol.03',
			subtitle: '(Coming Soon)',
			debut: 'Coming Soon',
			comingSoon: true,
			intro: 'A neo-grotesque in development.',
			statement: 'Coming soon.'
		}
	},
	{
		// Sibling face to Norma. Renamed from "Asta" 2026-08-31. Now a real
		// variable font (2026-09-02) — both masters (Hair 150 / Ultra 950)
		// are drawn and exported; the other 7 of the 9 named stops are
		// interpolated between them, same as Norma. Ultra's own axis
		// position moved from wght 850 to 950 on 2026-09-22, at the user's
		// request, so its scale now reaches Norma's own top stop.
		// Re-shown 2026-08-29 at the user's request (temporary).
		// "Ango" until 2026-10-30, then "TTT Humorist" (a pun on the category
		// Humanist). Only the public name and slug moved: the CSS family stays
		// 'Ango' (other projects set type in it) and so do the Ango-VF*.woff2
		// and ango-* image files below.
		slug: 'ttt-humorist',
		name: 'TTT Humorist',
		category: 'Geometric humanist sans-serif',
		order: 2,
		status: 'in-development',
		hidden: false,
		fontFamily: 'Ango',
		tagline: 'Reticent and Ravenous.',
		description:
			'TTT Humorist is a sibling to Norma, in development at Apres Guerre. ' +
			'Where Norma runs wide and even across twenty weights, TTT Humorist narrows its focus to ten — an axis built from two hand-drawn extremes, Hair and Black, with the eight named stops between them genuinely interpolated rather than invented. ' +
			"Both masters are drawn in full; what's still catching up is the shared glyph set, since a variable font can only ship a character once its lightest and heaviest drawings agree closely enough to interpolate cleanly between them. " +
			'A little over half the design is there already, and the rest is following weight by weight. ' +
			'Even mid-development, the two extremes already read as a distinct temperament — reserved and almost weightless at Hair, blunt and unwavering at Black — the same letterforms pulled toward opposite instincts. ' +
			'Its default words in the Type Tester borrow the language of wine and terroir, the same register Norma continues at greater length: Appellation, Cuvée, Héritage — words that, like the type itself, describe something inherited and still being shaped.',
		descriptionFr:
			'TTT Humorist est une police sœur de Norma, en cours de développement chez Apres Guerre. ' +
			'Les détails sur son orientation, ses graisses et son calendrier de sortie suivront.',
		classification: 'In development · 10 weights',
		// Glyph/language counts here deliberately use the SOURCE repertoire
		// (Asta.glyphs' own glyph box), not the shipped VF's cmap — unlike
		// Norma's info, where those two numbers are nearly the same since
		// Norma is finished across all masters. For Ango, mid-development,
		// they diverge a lot: a variable font can only ship a glyph once
		// BOTH masters are shape-compatible, so ~28 of the 177 encoded
		// characters that already have real ink in Hair are still hard-
		// excluded from Elio-VF13.woff2 (now Ango) while Ultra catches up (147 ship
		// today — a big jump from VF10's 107, since all 4 remaining
		// Hair-only combining marks got drawn in Ultra — see
		// static/fonts/README.md). Quoting that 147 as "the" glyph count
		// would undersell finished design work that just hasn't cleared
		// the interpolation-compatibility bar yet.
		// Re-measured 2026-09-17 directly from the Glyphs glyph box (was
		// 172/79 on 2026-09-05): 180 total - "新規グリフ" (empty
		// placeholder) - three.ss01 - t.ss01 (unencoded alt slots) = 177
		// encoded; 175 of those have real Hair ink (only asciitilde/
		// asciicircum are still blank) — +3 vs the 2026-09-05 count for
		// Ōmacron/ōmacron/macroncomb, added this round. Shape set hasn't
		// grown since, so these two numbers are still accurate as of
		// Ango-VF27.woff2 (2026-10-11) — 175 characters ship (up from 147 in
		// VF13, 151 in VF19-26; VF27 added 24 punctuation/symbols whose
		// Ultra layers were derived). Still out: `sterling`, and `^ ~ %`,
		// which are empty in both masters and now fall back to Norma.
		// Languages: Hyperglot 0.7.3, base support, validity=verified
		// (same method/thresholds as Norma's "93") against those 175
		// chars — unchanged at 79; Ō/ō alone didn't clear any additional
		// language at the verified tier.
		info: {
			design: 'Takumi Isobe',
			release: 'TBD',
			collection: '10 weights',
			formats: 'OTF, TTF, WOFF2',
			glyphs: '234',
			languages: '92'
		},
		// Now a real variable font — all 10 named stops are genuine
		// interpolation between the drawn Hair/Ultra masters (Ango-VF34: 2026-11-06
		// counts above are the shipped cmap, 234, and Hyperglot verified, 92).
		weights: ANGO_WEIGHTS,
		overview: { groups: HUMORIST_GLYPH_GROUPS, metrics: HUMORIST_METRICS },
		information: { features: HUMORIST_FEATURES, languages: HUMORIST_LANGUAGES },
		// The same line on every weight row (150 -> 950, lightest to heaviest),
		// so the rows differ only in weight. The other sets are kept in
		// ANGO_TESTER_TEXTS above — point this at `.wine`, `.cheese` (the A-I
		// list) or `.mozzarellaBrie` to bring any of them back.
		defaultTexts: ANGO_TESTER_TEXTS.alphabet,
		testerLines: HUMORIST_TESTER_LINES,
		weightMenu: ANGO_WEIGHTS,
		// The A-Z/a-z proof, for the gallery's specimen tile. The big name on
		// /fonts and at the top of the page is set at this weight (the home
		// hero's own, Light).
		specimen: ['ABCDEFGHIJKLMNOP', 'QRSTUVWXYZabcdefg', 'hijklmnopqrstuvwxyz'],
		specimenWeight: 300,
		// The page's own title is the family prefix alone, in Medium (2026-11-01,
		// at the user's request — "一番上のHumoristをApgrにして、Mediumで").
		pageTitle: NAME_PREFIX,
		pageTitleWeight: 550,
		// Borrowed from gQ (2026-08-31, at the user's request) — Ango has no
		// hero image of its own yet, so its page top reuses gQ's for now.
		thumbnail: '/images/fonts/gq.png',
		theme: { bg: '#d59514', fg: '#000000' },
		// No catalogBg — no hover swatch (2026-08-31).
		// The gallery, left to right (2026-10-11, the user's order): the cycling
		// glyph, the Apres Guerre cream jar and box, the "Mozzarella & Brie de
		// Meaux" weight pairing (added after the second, same day), the fire
		// extinguisher — the mockups are from the "ANGO CASE STUDIES" set the
		// user supplied — and the specimen. More pictures are to come; they go
		// in this list.
		gallery: [
			{ kind: 'glyphs' },
			{
				kind: 'image',
				src: '/images/fonts/ango-case-study-cream.jpg',
				alt: 'A blue jar and a white box for “Facial Barrier Cream (3)” by Apres Guerre, set in TTT Humorist — a case study mockup',
				width: 2000,
				height: 1125
			},
			{
				kind: 'image',
				src: '/images/fonts/ango-case-study-mozzarella-brie.webp',
				alt: '“Mozzarella &” in a light weight of TTT Humorist above “Brie de Meaux” in a heavy one, white on blue',
				width: 2000,
				height: 720
			},
			{
				kind: 'image',
				src: '/images/fonts/ango-case-study-extinguisher.jpg',
				alt: 'A white fire extinguisher printed with “Fire Extinguisher” set in TTT Humorist — a case study mockup',
				width: 2000,
				height: 1333
			},
			{ kind: 'specimen' }
		],
		hero: {
			label: 'In development',
			vol: 'vol.03',
			subtitle: '(Coming Soon)',
			debut: 'Coming Soon',
			comingSoon: true,
			intro: 'A sibling to Norma.',
			statement: 'Coming soon.'
		},
		// Colours of Ango's own page (Figma 3:733/7:906, 2026-09). Black-based
		// since 2026-10 (at the user's request — "FontHeroと下の画像3つのカラー
		// リングを黒背景基調に"): the band is black with paper type (the old
		// blue is too weak on black at the Hair weight). It was lime/blue/lime.
		// The two typographic gallery tiles — the cycling glyph and the
		// specimen — then went white with brand-blue type (2026-10-11, "graphic
		// は、白背景に青文字で。アニメーションも同様で"): see galleryBg/Fg.
		// #f6f6f6 rather than pure white (the same day, "白いタイルの枠が見えな
		// くなっている件=>f6f6f6で"): the page is white, so a white tile had no
		// visible edge, and the specimen text read as cut off by nothing.
		homeSection: {
			panelBg: '#000000',
			panelFg: '#F1F0EF',
			galleryBg: '#f6f6f6',
			galleryFg: 'var(--brand-blue)',
			blockBg: '#000000',
			blockFg: '#DAE06B',
			glyph: 'a',
			headline: 'Geometric Humanist',
			// Ango's own Hair master (150) — deliberately its most delicate
			// weight at the page's single largest moment, per Figma (and a
			// nice match for its "Reticent and Ravenous" tagline).
			headlineWeight: 150,
			// Home hero: set in its own Light (Figma 175:178) — only where there
			// is no heroImage; with one, as below, the picture stands in.
			heroWeight: 300,
			// The Apres Guerre moisturiser mockup in place of the grey panel
			// (2026-10-11, supplied by the user): landscape for PC, portrait
			// for phones. It is a light picture, so the type over it is the
			// brand blue and the Header stays blue. The portrait file is the
			// supplied 1500x2000 with studio grey (the picture's own top and
			// bottom edge colours, with its grain) added above and below to
			// 1500x3261, so that at any phone's hero shape the cover crop only
			// ever trims grey, never the product at the sides.
			heroImage: {
				src: '/images/fonts/ango-hero.jpg',
				srcSm: '/images/fonts/ango-hero-portrait.jpg',
				bg: '#d9d9d9',
				fg: 'var(--brand-blue)',
				tone: 'light'
			}
		}
	},
	{
		// Announced on the home page (ochre section, own logotype) and in the
		// mobile menu's UPCOMING list. Registered here with a catalogue
		// specimen; everything below is still fully provisional (unlike Ango,
		// no drawings at all yet). Re-shown 2026-08-29, re-hidden 2026-08-31,
		// both at the user's request.
		slug: 'ttt-alfred',
		name: 'TTT Alfred',
		category: 'Neo classic',
		order: 5,
		status: 'in-development',
		hidden: true,
		placeholder: true,
		// No font files yet — render as Norma for preview purposes
		fontFamily: 'Norma',
		tagline: 'A Neo Classic in development.',
		description:
			'TTT Alfred is a Neo Classic typeface in development at Apres Guerre. ' +
			'Details on its design direction, weights and release schedule will follow.',
		descriptionFr:
			'TTT Alfred est un caractère Neo Classic en cours de développement chez Apres Guerre. ' +
			'Les détails sur son orientation, ses graisses et son calendrier de sortie suivront.',
		classification: 'In development',
		// Provisional weights — same axis as Norma until the spec is finalised
		weights: WEIGHTS,
		defaultTexts: ['Alfred'],
		// Placeholder catalogue specimen — set at a lighter cut (wght 250)
		// than Norma's own card, so the two don't read as the same font
		// twice (Ango no longer needs this distinction — its own font
		// renders its card now). Replace once Alfred has its own metal.
		specimen: ['VOL. II', 'ALFRED', 'Neo Classic'],
		specimenWeight: 250,
		// Matches the home page's ochre Alfred section exactly (#d59514 / black).
		theme: { bg: '#d59514', fg: '#000000' },
		// A paler tint of the same ochre used for the hero theme above.
		// Ango (also ochre) no longer has its own catalogBg — see the note
		// where Ango is defined above.
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

/** Slugs the pages answered to before the renames, straight to where they
 *  are now (a 301 — see fonts/[slug]/+page.ts; one hop, never a chain).
 *  `elio` is Ango's name before 2026-10-03; `ango` and `gq` before the
 *  2026-10-30 rename; `apgr-gq-sans` lived a day (2026-10-30 to 10-31) before
 *  GQ Sans became Quad Sans; the `apgr-` ones until the TTT prefix
 *  (2026-11-06); `ttt-maxica` for the hours before Maxa was confirmed. Alfred is left out: it is hidden, so it never had a public
 *  page to carry over. The /buy?font= parameter reads the same map. */
export const LEGACY_SLUGS: Record<string, string> = {
	ango: 'ttt-humorist',
	elio: 'ttt-humorist',
	gq: 'ttt-quad-sans',
	'apgr-gq-sans': 'ttt-quad-sans',
	'apgr-humorist': 'ttt-humorist',
	'apgr-quad-sans': 'ttt-quad-sans',
	'apgr-maxica': 'ttt-maxa',
	'ttt-maxica': 'ttt-maxa'
};

/** The name as the big display sets it: the prefix dropped ("Humorist"), as
 *  Kontrapunkt Type's "KP Duo Sans" shows as "Duo Sans". The full name is
 *  still what the page's title, spec lines and buttons say. */
export function displayName(tf: Pick<Typeface, 'name'>): string {
	return tf.name.startsWith(`${NAME_PREFIX} `) ? tf.name.slice(NAME_PREFIX.length + 1) : tf.name;
}

/** How a home panel's name moves (2026-11-05, at the user's idea — "wght可変
 *  アニメーション、3D rotationアニメーション、タイプライターアニメーションなどを
 *  それぞれTopのサムネで動きがあると面白い"). Each runs only while its panel is on
 *  screen, and none under reduced motion.
 *  - `wght`: a wave of weight runs through the letters (a variable face).
 *  - `rotate`: the letters turn about their vertical axis one after another.
 *  - `typewriter`: the name is typed, held, and backspaced, with a caret.
 *  - `tracking`: the spacing between the letters opens and closes. */
export type HomePanelMotion = 'wght' | 'rotate' | 'typewriter' | 'tracking';

/** One panel of the home page's typeface section: a flat ground with the name
 *  set huge in its own face, and a caption (2026-11-05, at the user's request,
 *  after britishstandardtype.xyz/typefaces — "シンプルな背景とテキストのみ"). */
export interface HomePanel {
	key: string;
	/** The page it opens; none for a name that has no page yet. */
	href?: string;
	/** The public name, prefix included — the caption's and the link's label. */
	name: string;
	/** The big name, one word to a line ("Quad" over "Sans"). */
	lines: string[];
	/** CSS font-family the big name is set in. */
	fontFamily: string;
	/** wght of the big name. */
	weight: number;
	bg: string;
	fg: string;
	motion: HomePanelMotion;
	/** What the caption says after the name, one part each ("Grotesque", "In
	 *  development"). Set apart by space, not by a "·": Ango's middle dot sits
	 *  on the baseline. */
	meta: string[];
}

/** How each typeface shows in the home section. The order here is the order
 *  on the page (Maxa, Humorist, Quad Sans — then Quad Serif, below): kept
 *  apart from `Typeface.order`, which the menus and /fonts follow. A typeface
 *  that is hidden is left out, as everywhere else. */
const HOME_PANEL_STYLES: {
	slug: string;
	weight: number;
	bg: string;
	fg: string;
	motion: HomePanelMotion;
}[] = [
	// Maxa's axis is the widest (50-950) and its name the shortest, so it takes
	// the weight wave; Quad Sans has the one weight, so it is typed.
	// Grounds (2026-11-05, the user's): Maxa black, Humorist white, Quad Sans blue.
	{ slug: 'ttt-maxa', weight: 400, bg: 'var(--black)', fg: 'var(--brand-paper)', motion: 'wght' },
	{ slug: 'ttt-humorist', weight: 300, bg: 'var(--white)', fg: 'var(--black)', motion: 'rotate' },
	{
		slug: 'ttt-quad-sans',
		weight: 400,
		bg: 'var(--brand-blue)',
		fg: 'var(--brand-paper)',
		motion: 'typewriter'
	}
];

/** Quad Serif — the serif half of the Quad family, named on the home page
 *  before it exists: no face is drawn and there is no page, so the panel does
 *  not link, and its name is set in a stand-in serif (EB Garamond, the file the
 *  /opentype reference already carries — see app.html) until there is. Quad
 *  Sans's panel is blue and paper, so this one is its inverse: paper and
 *  blue (the user named the first three grounds only, 2026-11-05). */
const QUAD_SERIF_PANEL: HomePanel = {
	key: 'ttt-quad-serif',
	name: `${NAME_PREFIX} Quad Serif`,
	lines: ['Quad', 'Serif'],
	fontFamily: 'Quad Serif',
	weight: 400,
	bg: 'var(--brand-paper)',
	fg: 'var(--brand-blue)',
	motion: 'tracking',
	meta: ['Serif', 'Coming soon']
};

/** The home section's panels, in the order they run down the page. */
export function homePanels(): HomePanel[] {
	const faces = HOME_PANEL_STYLES.flatMap(({ slug, ...style }) => {
		const tf = getTypeface(slug);
		if (!tf || tf.hidden) return [];
		const panel: HomePanel = {
			key: tf.slug,
			href: `/fonts/${tf.slug}`,
			name: tf.name,
			lines: displayName(tf).split(' '),
			fontFamily: tf.fontFamily,
			meta: tf.classification.split(' · '),
			...style
		};
		return [panel];
	});
	return [...faces, QUAD_SERIF_PANEL];
}
