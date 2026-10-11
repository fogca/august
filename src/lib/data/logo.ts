// Apres Guerre wordmark — from the logo SVG the user supplied (2026-10-12, the
// latest of three: 1020.47x113.39, an exact 9:1; kept as supplied at
// docs/brand/apres-guerre-logo.svg, where its fill is #14308f). The colour is
// not used: the logo is drawn in currentColor, i.e. the CSS brand colour
// (base.css --brand-blue), at the user's request.
//
// Every letter is already one clean outline (the earlier version drew each
// as a fill plus an outline ring and had to be unioned), taken here as it
// was drawn: `d` is the SVG path data verbatim, with the <polygon> letters
// (the three E's) rewritten as a path. Source viewBox units, SVG y-down.
//
// Everything else that has to know the logo's proportions — the CSS (the
// wordmark's layout, the Header's lockup, the masthead spacer), the home
// page's pile of letters — takes them from here, so changing the artwork
// means replacing this file's data and nothing else. The CSS gets them as
// custom properties (LOGO_CSS_VARS, emitted by +layout.svelte).

export interface LogoLetter {
	/** The letter it draws (E and R repeat, so key by index, not by this). */
	char: string;
	/** Bounding box in viewBox units. */
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	/** The point deepest inside the ink (furthest from any edge) and its
	 *  distance to the nearest edge — a disc of radius `r` around it is solid
	 *  ink. Where a zoom dives in so that the letter's own stroke fills the
	 *  screen (the home page's Custom section). Computed offline from the
	 *  outline with a distance transform. */
	core: { x: number; y: number; r: number };
	d: string;
}

export const LOGO_VIEWBOX_W = 1020.47;
export const LOGO_VIEWBOX_H = 113.39;

/** Left to right: A P R E S G U E R R E. */
export const LOGO_LETTERS: LogoLetter[] = [
	{
		char: 'A',
		x0: 0,
		x1: 92.39,
		y0: 3.19,
		y1: 109.31,
		core: { x: 44.38, y: 14.06, r: 8.63 },
		d: 'M79.39,109.31l-15.71-39.5H28.22l-15.27,39.5H0L35.93,13.9l-7.5-10.71h20.91l43.05,106.11h-13ZM59.12,58.41l-14.34-35.66-12.84,35.66h27.18Z'
	},
	{
		char: 'P',
		x0: 110.62,
		x1: 173.12,
		y0: 3.19,
		y1: 109.31,
		core: { x: 117.99, y: 58.44, r: 7.5 },
		d: 'M110.62,109.31V3.19h30c15.37,0,32.5,12.56,32.5,30.59,0,15.18-11.24,24.94-21.77,29.01l-.19.07-8.53,1.07-19.28-.14v45.51h-12.73ZM138.13,53.12c13.19,0,21.39-7.3,21.39-19.04,0-12.94-8.92-20.36-24.47-20.36h-11.7v39.4h14.78Z'
	},
	{
		char: 'R',
		x0: 193.14,
		x1: 273.26,
		y0: 3.19,
		y1: 109.31,
		core: { x: 200.26, y: 59.32, r: 7.2 },
		d: 'M255.31,109.31l-31.13-45.38-18.31-.13v45.51h-12.73V3.19h30c15.37,0,32.5,12.56,32.5,30.59,0,14.19-9.83,23.65-19.71,28.14l37.33,47.38h-17.96ZM205.87,54.58c27.33-.19,36.17-5.28,36.17-20.5,0-12.94-8.92-20.36-24.47-20.36h-11.7v40.86Z'
	},
	{
		char: 'E',
		x0: 288.87,
		x1: 348.97,
		y0: 3.34,
		y1: 109.31,
		core: { x: 296.37, y: 55.34, r: 7.62 },
		d: 'M288.87,109.31L288.87,3.34 345.7,3.34 339.07,14.75 302.01,14.75 301.34,49.74 339,49.74 332.15,61.15 301.13,61.15 300.6,97.9 348.97,97.9 340.26,109.31 288.87,109.31Z'
	},
	{
		char: 'S',
		x0: 362.61,
		x1: 426.26,
		y0: 3.05,
		y1: 109.47,
		core: { x: 417.36, y: 93.18, r: 6.54 },
		d: 'M392.29,109.46c-8.03,0-17.29-2.87-26.1-5.97l-.95-.33-2.63-17.8,3.19,2.29c9.5,6.81,19.22,10.11,29.72,10.11,8.93,0,18.16-5.25,18.16-14.05,0-9.6-10.48-16.73-16.74-20.99-.77-.53-1.48-1.01-2.09-1.44-.97-.58-2.02-1.22-3.06-1.84-13.54-8.15-25.24-15.19-25.24-29.91,0-16.09,12.76-26.48,32.5-26.48,5.56,0,14.04,2,18.21,4.28.94.41,1.65.78,2.22,1.09.64.34,1.1.59,1.56.7l1.26.32v16.33l-2.84-2.84c-4.39-4.39-13.5-9.06-21.73-9.06-12.6,0-19.19,7.51-19.19,14.93s9.37,14.61,24.5,24.45c10.66,5.84,23.22,17.26,23.22,30.03,0,16.89-12.06,26.19-33.97,26.19Z'
	},
	{
		char: 'G',
		x0: 463.46,
		x1: 553.57,
		y0: 3.19,
		y1: 113.39,
		core: { x: 545.84, y: 97.69, r: 7.75 },
		d: 'M542.23,104.62c-7.36,3.3-17.24,5.42-25.42,5.42-31.91,0-53.35-21.15-53.35-52.62s21.94-54.23,53.35-54.23c11.62,0,23.92,4.17,30.95,8.31l.82.48v14.88l-2.72-2.21c-5.83-4.75-20.31-10.05-30.96-10.05-24.28,0-39.3,21.85-39.3,42.09,0,22.42,18.37,42.09,39.3,42.09,8.92,0,18.43-2.41,25.65-6.49v-26.74h-26.8l-8.25-11.55h48.07v59.39l-11.34-8.76Z'
	},
	{
		char: 'U',
		x0: 579.14,
		x1: 660.44,
		y0: 0,
		y1: 111.38,
		core: { x: 590.52, y: 90.12, r: 6.84 },
		d: 'M620.01,111.37c-12.71,0-22.54-3.51-30.08-10.74-7.28-7.58-10.79-18-10.79-31.89V1.34l12.73,3.58v64.84c.13,15.2,10.37,30.93,27.26,30.93,14.84,0,28.88-13.61,28.88-28V0l12.43,3.61v68.36c0,4.07-.48,10.04-2.78,15.35-2.06,4.75-4.88,9.01-8.4,12.68-3.9,3.9-7.95,6.63-12.76,8.61-4.43,1.94-9.37,2.77-16.49,2.77Z'
	},
	{
		char: 'E',
		x0: 688.55,
		x1: 748.64,
		y0: 3.34,
		y1: 109.31,
		core: { x: 696.05, y: 55.34, r: 7.62 },
		d: 'M688.55,109.31L688.55,3.34 745.38,3.34 738.74,14.75 701.68,14.75 701.01,49.74 738.67,49.74 731.83,61.15 700.81,61.15 700.27,97.9 748.64,97.9 739.93,109.31 688.55,109.31Z'
	},
	{
		char: 'R',
		x0: 771.1,
		x1: 851.22,
		y0: 3.19,
		y1: 109.31,
		core: { x: 778.22, y: 59.32, r: 7.2 },
		d: 'M833.27,109.31l-31.13-45.38-18.31-.13v45.51h-12.73V3.19h30c15.37,0,32.5,12.56,32.5,30.59,0,14.19-9.83,23.65-19.71,28.14l37.33,47.38h-17.96ZM783.83,54.58c27.33-.19,36.17-5.28,36.17-20.5,0-12.94-8.92-20.36-24.47-20.36h-11.7v40.86Z'
	},
	{
		char: 'R',
		x0: 864.64,
		x1: 944.76,
		y0: 3.19,
		y1: 109.31,
		core: { x: 871.76, y: 59.32, r: 7.2 },
		d: 'M926.81,109.31l-31.13-45.38-18.31-.13v45.51h-12.73V3.19h30c15.37,0,32.5,12.56,32.5,30.59,0,14.19-9.83,23.65-19.71,28.14l37.33,47.38h-17.96ZM877.37,54.58c27.33-.19,36.17-5.28,36.17-20.5,0-12.94-8.92-20.36-24.47-20.36h-11.7v40.86Z'
	},
	{
		char: 'E',
		x0: 960.38,
		x1: 1020.47,
		y0: 3.34,
		y1: 109.31,
		core: { x: 967.88, y: 55.34, r: 7.62 },
		d: 'M960.38,109.31L960.38,3.34 1017.21,3.34 1010.57,14.75 973.51,14.75 972.84,49.74 1010.5,49.74 1003.66,61.15 972.64,61.15 972.1,97.9 1020.47,97.9 1011.76,109.31 960.38,109.31Z'
	}
];

/** The two words as horizontal crops of the same viewBox: SP stacks them,
 *  everywhere else they sit on one line. `from`/`to` slice LOGO_LETTERS; a
 *  crop runs from its first letter's left edge to its last letter's right
 *  edge — except GUERRE's, which runs on to the viewBox's end. */
export const LOGO_WORDS = [
	{ word: 'APRES', from: 0, to: 5, x0: 0, x1: LOGO_LETTERS[4].x1 },
	{ word: 'GUERRE', from: 5, to: 11, x0: LOGO_LETTERS[5].x0, x1: LOGO_VIEWBOX_W }
] as const;

/** The gap between the two lines when stacked on SP, in viewBox units: the
 *  same share of the height it had in the Figma frame (29.4 of a 156-unit
 *  line, Figma 7:782). */
export const LOGO_STACK_GAP = Math.round(((LOGO_VIEWBOX_H * 29.4) / 156) * 100) / 100;

/** The logo's proportions as CSS custom properties (unitless numbers, in
 *  viewBox units) for `:root` — see +layout.svelte. */
export const LOGO_CSS_VARS = [
	['--logo-w', LOGO_VIEWBOX_W],
	['--logo-h', LOGO_VIEWBOX_H],
	['--logo-apres-w', LOGO_WORDS[0].x1 - LOGO_WORDS[0].x0],
	['--logo-guerre-x', LOGO_WORDS[1].x0],
	['--logo-guerre-w', LOGO_WORDS[1].x1 - LOGO_WORDS[1].x0],
	['--logo-stack-gap', LOGO_STACK_GAP],
	['--logo-stack-h', 2 * LOGO_VIEWBOX_H + LOGO_STACK_GAP]
]
	.map(([name, value]) => `${name}:${Math.round(Number(value) * 100) / 100}`)
	.join(';');
