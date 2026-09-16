// Shared signal for the Home page's mobile "typeface footer bar" — the user
// wants ONE persistent fixed bar at the bottom of the screen while scrolling
// through the typefaces (Norma, Elio, ...), not one bar per section scrolling
// away with it. TypefaceFooterBar.svelte (rendered once, in +page.svelte) just
// reads `current`/`visible` reactively. Same cross-sibling pattern as
// homeIntro.svelte.ts — the stage and the footer bar are siblings under
// +page.svelte with no parent-child relationship.
//
// The writer is TypefaceStage.svelte, from the single scroll-progress pass that
// also drives the shutter, so the bar and the visible typeface can never
// disagree. (Before 2026-09 this was one IntersectionObserver per section, back
// when each typeface had its own; the stacked reduced-motion fallback inside
// the stage still uses that form, since there are real sections there again.)
//
// Always compare by `slug`, never by object identity: Vite HMR can leave two
// different same-slug Typeface instances in play after enough edits to
// typefaces.ts, which silently broke an earlier identity check.
import type { Typeface } from '$lib/data/typefaces';

class ActiveTypefaceState {
	current = $state<Typeface | null>(null);
	/** False while the typeface stage itself is off screen (over the intro, or
	 *  past it into Custom/About/Contact) — the footer bar slides fully out
	 *  rather than showing stale content there. */
	visible = $state(false);
}

export const activeTypeface = new ActiveTypefaceState();
