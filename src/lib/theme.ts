// The page theme: which palette <html data-theme> selects (see base.css).
// Shared by hooks.server.ts (first paint) and +layout.svelte (client-side
// navigation), so the two can't disagree.
//
//   home  — the home page: white, brand blue text.
//   white — the typeface detail pages (/fonts/<slug>): the same, but a page
//           of their own rather than the home page's (2026-10, at the
//           user's request — "白背景で問題ない").
//   page  — everything else: brand blue on peach.
export type Theme = 'home' | 'white' | 'page';

const TYPEFACE_PAGE = /^\/fonts\/[^/]+\/?$/;

export function themeFor(path: string): Theme {
	if (path === '/') return 'home';
	if (TYPEFACE_PAGE.test(path)) return 'white';
	return 'page';
}

/** The base.css token holding each theme's background — what the page
 *  transition's panel is painted with, so it matches the page it reveals. */
export const THEME_BG_TOKEN: Record<Theme, string> = {
	home: '--white',
	white: '--white',
	page: '--brand-peach'
};
