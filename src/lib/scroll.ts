// Central scroll infrastructure for the site.
//
// One Lenis instance drives the window scroll and is wired into GSAP
// ScrollTrigger exactly once. Everything scroll-related goes through here —
// no component should reach for `window.__lenisInstance` or import
// gsap/ScrollTrigger on its own:
//
//   initScroll()       bootstrap (idempotent); called from the root layout
//   destroyScroll()    teardown; called from the root layout
//   getLenis()         live Lenis instance (null until ready / on server)
//   getScrollTrigger() gsap + ScrollTrigger, resolved AFTER the Lenis
//                      handshake so triggers never race the smooth scroller
//   onScroll(fn)       scroll subscription; returns an unsubscribe function
//   scrollToEl(target) smooth-scroll via Lenis with a native fallback
//   refreshTriggers()  recompute trigger positions (after nav / layout shifts)
//
// NOTE: Lenis scrolls the window natively (it animates window.scrollTo per
// rAF), so `position: sticky` and native scroll events keep working. The one
// thing that breaks sticky is an `overflow-x: hidden` ancestor — see the
// guard comment in static/css/base.css.

import { browser } from '$app/environment';
import type Lenis from 'lenis';

type Gsap = typeof import('gsap').gsap;
type ScrollTriggerStatic = typeof import('gsap/ScrollTrigger').ScrollTrigger;

let lenis: Lenis | null = null;
let gsapRef: Gsap | null = null;
let scrollTriggerRef: ScrollTriggerStatic | null = null;
let tickerFn: ((time: number) => void) | null = null;
let ready: Promise<void> | null = null;

/** Bootstrap Lenis + GSAP ScrollTrigger. Idempotent; safe to call anywhere. */
export function initScroll(): Promise<void> {
	if (!browser) return Promise.resolve();
	if (ready) return ready;

	ready = (async () => {
		const [{ default: LenisCtor }, { gsap }, { ScrollTrigger }] = await Promise.all([
			import('lenis'),
			import('gsap'),
			import('gsap/ScrollTrigger')
		]);

		gsap.registerPlugin(ScrollTrigger);
		// Ignore the resize the mobile URL bar fires on show/hide — otherwise
		// pinned reveals jump mid-scroll as the viewport (dvh) changes.
		ScrollTrigger.config({ ignoreMobileResize: true });
		gsapRef = gsap;
		scrollTriggerRef = ScrollTrigger;

		// `anchors: true` makes Lenis handle same-page #hash links natively.
		lenis = new LenisCtor({ anchors: true });
		lenis.on('scroll', ScrollTrigger.update);
		// Filming hook: expose the live instance so capture tooling can drive
		// deterministic scroll positions (reverted after capture).
		(window as unknown as { __lenis?: Lenis }).__lenis = lenis;

		// Drive Lenis from GSAP's ticker so the scroller and triggers share a clock.
		tickerFn = (time: number) => lenis?.raf(time * 1000);
		gsap.ticker.add(tickerFn);
		gsap.ticker.lagSmoothing(0);

		// Recompute any triggers created before this handshake finished.
		ScrollTrigger.refresh();
	})();

	return ready;
}

export function destroyScroll(): void {
	if (tickerFn && gsapRef) gsapRef.ticker.remove(tickerFn);
	tickerFn = null;
	lenis?.destroy();
	lenis = null;
	gsapRef = null;
	scrollTriggerRef = null;
	ready = null;
}

/** The live Lenis instance — null on the server or before initScroll resolves. */
export function getLenis(): Lenis | null {
	return lenis;
}

/**
 * gsap + ScrollTrigger, guaranteed registered and wired to Lenis.
 * Use this instead of importing gsap directly when creating scroll triggers.
 */
export async function getScrollTrigger(): Promise<{
	gsap: Gsap;
	ScrollTrigger: ScrollTriggerStatic;
}> {
	await initScroll();
	return { gsap: gsapRef!, ScrollTrigger: scrollTriggerRef! };
}

/**
 * Subscribe to scroll. Lenis animates the real window scroll, so one native
 * listener catches both user input and programmatic smooth scrolling.
 * Returns an unsubscribe function (hand it straight back from onMount).
 */
export function onScroll(fn: () => void): () => void {
	window.addEventListener('scroll', fn, { passive: true });
	return () => window.removeEventListener('scroll', fn);
}

/** Smooth-scroll to an element or selector, preferring Lenis. */
export function scrollToEl(target: HTMLElement | string): void {
	if (lenis) {
		lenis.scrollTo(target);
		return;
	}
	const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
	el?.scrollIntoView({ behavior: 'smooth' });
}

/** Recompute ScrollTrigger positions after content/layout changes. */
export function refreshTriggers(): void {
	const st = scrollTriggerRef;
	if (!st) return;
	requestAnimationFrame(() => st.refresh());
}
