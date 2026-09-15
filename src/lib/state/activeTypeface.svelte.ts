// Shared signal for the Home page's mobile "typeface footer bar" — the user
// wants ONE persistent fixed bar at the bottom of the screen while scrolling
// through the typeface sections (Norma, Elio, ...), not one bar per section
// scrolling away with it. Each TypefaceSection reports itself here via an
// IntersectionObserver the instant it's the one centred in the viewport;
// TypefaceFooterBar.svelte (rendered once, in +page.svelte) just reads
// `current`/`visible` reactively. Same cross-sibling pattern as
// homeIntro.svelte.ts — TypefaceSection and the footer bar are siblings
// under +page.svelte with no parent-child relationship.
import type { Typeface } from '$lib/data/typefaces';

class ActiveTypefaceState {
	current = $state<Typeface | null>(null);
	/** False while scrolled outside every typeface section (over the intro,
	 *  or past the last section into Buy/Custom/Office) — the footer bar
	 *  slides fully out rather than showing stale content there. */
	visible = $state(false);
}

export const activeTypeface = new ActiveTypefaceState();
