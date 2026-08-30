// Atom weight axis definitions (Variable Font wght axis values)
// Numeric naming scheme (2026-06-11): name = wght / 10, except "1" = wght 1.
// 20 weights: 1, 5, 10, ... 95 (40 = Book, 95 = Ultra).
export interface WeightDef {
	id: number;
	/** Numeric name — the canonical one (name x 10 = wght, except Hair at 1) */
	name: string;
	/** Word for the same step. Shown beside the number; the nine CSS keywords
	 *  sit at their standard axis values so a menu reads as expected. */
	label: string;
	axisValue: number;
}

const WEIGHT_LABELS = [
	'Hair',
	'Line',
	'Thin',
	'UltraLight',
	'ExtraLight',
	'SemiLight',
	'Light',
	'Book',
	'Regular',
	'Text',
	'Medium',
	'Demibold',
	'Semibold',
	'Dark',
	'Bold',
	'UltraBold',
	'ExtraBold',
	'Heavy',
	'Black',
	'Ultra'
];

export const WEIGHTS: WeightDef[] = [
	1,
	...Array.from({ length: 19 }, (_, i) => (i + 1) * 5)
].map((n, i) => ({
	id: n,
	name: String(n),
	label: WEIGHT_LABELS[i],
	axisValue: n === 1 ? 1 : n * 10
}));

// Maximum characters allowed in the textarea
export const MAX_CHARS = 500;

// Control defaults and ranges
export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 240;
// Viewport-dependent defaults: chairman directive 2026-05-07
export const FONT_SIZE_DEFAULT_DESKTOP = 36;
export const FONT_SIZE_DEFAULT_MOBILE = 20;
export const FONT_SIZE_DEFAULT = FONT_SIZE_DEFAULT_DESKTOP;
// Breakpoint at which mobile default applies
export const MOBILE_BREAKPOINT_PX = 768;

// Switch: show the large specimen line and its size slider. 2026-08-30 — back
// on (a 1-2 word specimen, not the body copy, is the tester's main content
// now). Flip back to false to hide both again — the markup and state stay in
// WeightRow either way, just gated.
export const SHOW_ROW_TITLE = true;

// Switch: show the body copy under each word, and its own size slider.
// 2026-08-30 — off for now in favour of the specimen line above (see
// SHOW_ROW_TITLE); defaultNotes stays intact in typefaces.ts, just not
// rendered while this is false.
export const SHOW_ROW_NOTE = false;

// Per-weight-row default sizes (independent tester rows). 2026-08-30 — 64/36,
// sized for a short 1-2 word specimen rather than a running line of text.
export const WEIGHT_ROW_SIZE_DEFAULT_DESKTOP = 64;
export const WEIGHT_ROW_SIZE_DEFAULT_MOBILE = 36;

// Body copy under each word — its own slider, so these are just the starting
// points. Unused while SHOW_ROW_NOTE is false, kept for when it flips back.
export const WEIGHT_ROW_NOTE_DEFAULT_DESKTOP = 48;
export const WEIGHT_ROW_NOTE_DEFAULT_MOBILE = 16;

export const LETTER_SPACING_MIN = -0.05;
export const LETTER_SPACING_MAX = 0.2;
export const LETTER_SPACING_DEFAULT = 0;
export const LETTER_SPACING_STEP = 0.005;

export const LINE_HEIGHT_MIN = 0.9;
export const LINE_HEIGHT_MAX = 2.0;
export const LINE_HEIGHT_DEFAULT = 1.2;
export const LINE_HEIGHT_STEP = 0.05;

export type AlignValue = 'left' | 'center' | 'right' | 'justify';
export const ALIGN_OPTIONS: AlignValue[] = ['left', 'center', 'right', 'justify'];
export const ALIGN_DEFAULT: AlignValue = 'left';

// Per-weight-row default alignment (independent tester rows). 2026-08-30 —
// mobile centers the short 1-2 word specimen; desktop keeps the original
// left alignment.
export const WEIGHT_ROW_ALIGN_DEFAULT_DESKTOP: AlignValue = 'left';
export const WEIGHT_ROW_ALIGN_DEFAULT_MOBILE: AlignValue = 'center';

// Preset texts (bilingual intentional — .notdef shows for unsupported chars)
export const PRESETS: Record<string, string> = {
	pangram: 'The quick brown fox jumps over the lazy dog 1234567890',
	word: 'Atom',
	numbers: '0123456789',
	symbols: '. , - ; : ! ? & @ # $ %',
	bilingual: 'Atom — 意味を運ぶ媒質\nThe aether carries meaning before sight.'
};
