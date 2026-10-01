// Shared signal for the home page's opening (2026-10 redesign, Figma 1:635
// -> 175:178 PC, 7:782 -> 7:874 SP — see HomeTop.svelte). The page's
// section snap must not arm while the opening is still playing (its scroll
// is locked, and a snap firing mid-way would fight it), so HomeTop flips
// this once the opening is genuinely done, whichever way it got there (the
// full animation, reduced motion, or a page that loaded already scrolled).
class HomeIntroState {
	introComplete = $state(false);
	/** True after the first in-app navigation (set by +layout.svelte). The
	 *  opening plays once, on arriving at the site, not on every return to
	 *  "/". */
	inApp = $state(false);
}

export const homeIntro = new HomeIntroState();
