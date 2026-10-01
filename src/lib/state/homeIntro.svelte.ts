// Shared signal for the home page's opening (2026-10 redesign, Figma 1:635
// -> 175:178 PC, 7:782 -> 7:874 SP — see HomeTop.svelte). The page's
// section snap must not arm while the opening is still playing (its scroll
// is locked, and a snap firing mid-way would fight it), so HomeTop flips
// this once the opening is genuinely done, whichever way it got there (the
// full animation, reduced motion, or a page that loaded already scrolled).
class HomeIntroState {
	introComplete = $state(false);
	/** True while the opening's own copy of the wordmark is the one on show.
	 *  The opening overlay normally sits above the Header, but during a
	 *  client-side navigation the page fades in on an opacity layer that the
	 *  Header outranks — its static mark would then cover the letters rising
	 *  underneath. The Header hides its mark while this is set. */
	openingActive = $state(false);
}

export const homeIntro = new HomeIntroState();
