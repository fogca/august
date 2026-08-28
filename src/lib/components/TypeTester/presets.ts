// Steiner weight axis definitions (Variable Font wght axis values)
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

// Temporary switch: hide the large specimen line and its size slider, leaving
// only the body copy. Flip back to true to restore both — the markup and state
// are still in WeightRow, just gated.
export const SHOW_ROW_TITLE = false;

// Per-weight-row default sizes (independent tester rows)
export const WEIGHT_ROW_SIZE_DEFAULT_DESKTOP = 125;
export const WEIGHT_ROW_SIZE_DEFAULT_MOBILE = 72;

// Body copy under each word — its own slider, so these are just the starting
// points.
export const WEIGHT_ROW_NOTE_DEFAULT_DESKTOP = 32;
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

// Preset texts (bilingual intentional — .notdef shows for unsupported chars)
export const PRESETS: Record<string, string> = {
	pangram: 'The quick brown fox jumps over the lazy dog 1234567890',
	word: 'Asger',
	numbers: '0123456789',
	symbols: '. , - ; : ! ? & @ # $ %',
	bilingual: 'Asger — 意味を運ぶ媒質\nThe aether carries meaning before sight.'
};
