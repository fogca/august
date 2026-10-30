// The page theme: which palette <html data-theme> selects (see base.css).
// Shared by hooks.server.ts (first paint) and +layout.svelte (client-side
// navigation), so the two can't disagree.
//
// The palette is white, blue and black (2026-10-31, at the user's request):
// text is black, blue is the wordmark and the accents.
//
//   home  — the home page: black on white.
//   white — the typeface detail pages (/fonts/<slug>): the same, but a page
//           of their own rather than the home page's.
//   about — /about: white text on the brand blue ground, the home opening's
//           own colours.
//   page  — everything else: black on white.
export type Theme = 'home' | 'white' | 'about' | 'page';

const TYPEFACE_PAGE = /^\/fonts\/[^/]+\/?$/;
const ABOUT_PAGE = /^\/about\/?$/;

export function themeFor(path: string): Theme {
	if (path === '/') return 'home';
	if (TYPEFACE_PAGE.test(path)) return 'white';
	if (ABOUT_PAGE.test(path)) return 'about';
	return 'page';
}

/** The base.css token holding each theme's background — what the page
 *  transition's panel is painted with, so it matches the page it reveals. */
export const THEME_BG_TOKEN: Record<Theme, string> = {
	home: '--white',
	white: '--white',
	about: '--brand-blue',
	page: '--white'
};
