// Steiner weight axis definitions (Variable Font wght axis values)
// Numeric naming scheme (2026-06-11): name = wght / 10, except "1" = wght 1.
// 20 weights: 1, 5, 10, ... 95 (40 = Book, 95 = Ultra).
export interface WeightDef {
	id: number;
	name: string;
	axisValue: number;
}

export const WEIGHTS: WeightDef[] = [1, ...Array.from({ length: 19 }, (_, i) => (i + 1) * 5)].map(
	(n) => ({ id: n, name: String(n), axisValue: n === 1 ? 1 : n * 10 })
);

// Default tester text — bridges Scheteiner (medium) and Steiner's anthroposophy
export const DEFAULT_TEXT = 'The aether carries Rudolf Steiner anthroposophy.';

// Running text appended under each weight's word in the Type Tester.
// German (anthroposophy register) is shown now.
export const TESTER_PARAGRAPH_DE =
	'Das Denken ist eine stille Tätigkeit des Willens. Zwischen Wachen und Träumen bewegt sich die Seele durch Welten, die wir selten beim Namen nennen.';
// English alternative — kept for later use, NOT currently displayed.
export const TESTER_PARAGRAPH_EN =
	'The human being, Steiner held, is woven of four bodies — the physical, the etheric, the astral, and the I — each unfolding in its own seven-year season.';

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

// Per-weight-row default sizes (independent tester rows)
export const WEIGHT_ROW_SIZE_DEFAULT_DESKTOP = 64;
export const WEIGHT_ROW_SIZE_DEFAULT_MOBILE = 28;

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
	word: 'Steiner',
	numbers: '0123456789',
	symbols: '. , - ; : ! ? & @ # $ %',
	bilingual: 'Steiner — 意味を運ぶ媒質\nThe aether carries meaning before sight.'
};
