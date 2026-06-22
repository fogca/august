import type { Action } from 'svelte/action';
import { getScrollTrigger } from '$lib/scroll';

// Coalesce refreshes: each `use:coverReveal` instance asks for a refresh, but
// we only want one after they have all created their triggers (avoids triggers
// recalculating against a half-built, mid-pin layout).
let refreshHandle: ReturnType<typeof setTimeout> | null = null;
function scheduleRefresh(refresh: () => void) {
	if (refreshHandle) clearTimeout(refreshHandle);
	refreshHandle = setTimeout(() => {
		refreshHandle = null;
		refresh();
	}, 60);
}

export interface CoverRevealOptions {
	/** When false the action is inert — lets you mark items conditionally. */
	enabled?: boolean;
	/** Pin length as a multiple of the viewport height (default 1 = 100vh). */
	distance?: number;
	/** Show GSAP ScrollTrigger start/end markers for debugging. */
	markers?: boolean;
}

// Cover-reveal scroll transition.
//
// Apply `use:coverReveal` to an INCOMING section. As you scroll into it, the
// PREVIOUS sibling section is pinned (held in the viewport) while this section
// slides up over it — the new section "covers" the old one, then carries on
// scrolling normally. Sections without the action just stack and scroll as
// usual, so the reveal is opt-in per transition: mark only the destination
// sections you want it on.
//
// Mechanics: GSAP ScrollTrigger pins the previous sibling with
// `pinSpacing: false` (no spacer is inserted into the flow), so this section's
// normal scroll carries it up over the now-fixed predecessor. This section is
// lifted with `z-index` so it paints above the pinned (position:fixed) one.
// The incoming section must have an opaque background to actually cover.
export const coverReveal: Action<HTMLElement, CoverRevealOptions | undefined> = (
	node,
	options
) => {
	type Killable = { kill: (revert?: boolean) => void };
	let trigger: Killable | null = null;
	let restoreStyles: (() => void) | null = null;
	let disposed = false;

	async function build(opts: CoverRevealOptions | undefined) {
		if ((opts?.enabled ?? true) === false) return;

		// Respect reduced-motion: skip the pin entirely, sections just stack.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		// Phones: skip the pin. Pinning + the mobile URL bar (dvh) desyncs the
		// pinned predecessor and leaves scroll/white-band artefacts; plain stacked
		// scrolling is robust on mobile. Desktop/tablet keep the cover reveal.
		if (window.matchMedia('(max-width: 767.98px)').matches) return;

		const prev = node.previousElementSibling as HTMLElement | null;
		if (!prev) return;

		// Shared gsap instance, registered and wired to Lenis before any trigger
		// is created (see $lib/scroll.ts).
		const { ScrollTrigger } = await getScrollTrigger();
		if (disposed) return;

		// Lift the incoming section above the pinned (position:fixed) predecessor.
		const prevPosition = node.style.position;
		const prevZIndex = node.style.zIndex;
		if (getComputedStyle(node).position === 'static') node.style.position = 'relative';
		node.style.zIndex = '1';
		restoreStyles = () => {
			node.style.position = prevPosition;
			node.style.zIndex = prevZIndex;
		};

		const distance = opts?.distance ?? 1;

		trigger = ScrollTrigger.create({
			trigger: prev,
			// Pin the predecessor the moment it fills the viewport, then hold it
			// for one viewport of scroll while this section slides up to cover it.
			// (Covered sections are sized ~100vh so a single screen fully covers.)
			start: 'top top',
			end: () => '+=' + window.innerHeight * distance,
			pin: true,
			pinSpacing: false,
			invalidateOnRefresh: true,
			markers: opts?.markers ?? false
		});

		scheduleRefresh(() => ScrollTrigger.refresh());
	}

	build(options);

	return {
		update(next: CoverRevealOptions | undefined) {
			trigger?.kill(true);
			restoreStyles?.();
			trigger = null;
			restoreStyles = null;
			build(next);
		},
		destroy() {
			disposed = true;
			trigger?.kill(true);
			restoreStyles?.();
		}
	};
};
