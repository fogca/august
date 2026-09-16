// Shared signal for the Home page's logo entrance animation (Figma nodes
// 1:635/1:654 for PC, 7:782/7:874 for SP — a small wordmark stagger-in that
// grows large with a dark->light crossfade; the Header reveals at the same
// beat, per the user's own framing: "そのタイミングでheaderも上からin").
// Header.svelte and the Home page are siblings under +layout.svelte with no
// parent-child relationship, so this is the channel between them — same
// pattern as lang.svelte.ts.
//
// Defaults to false (hidden-ready OFF) rather than true: Header's own
// hiddenTop derivation ANDs this with isHome, so the default only ever
// matters on "/" itself — everywhere else this is inert. Starting false
// means the Home page's SSR/first-paint already renders the header hidden,
// with no onMount flash before the intro's own JS takes over.
class HomeIntroState {
	headerReady = $state(false);
	/** True once the intro's own business is genuinely finished — whichever
	 *  of its three paths got there (the full animated OP, the
	 *  prefers-reduced-motion instant-rest state, or the "not actually at
	 *  the top" guard — see IntroHero.svelte). Distinct from `headerReady`,
	 *  which flips early (during the OP's own tail) purely as a visual
	 *  beat — the Home page uses THIS one as the signal that it's now safe
	 *  to arm section-to-section scroll snap (see +page.svelte), since
	 *  doing that any earlier would let a snap fire mid-OP. */
	introComplete = $state(false);
}

export const homeIntro = new HomeIntroState();
