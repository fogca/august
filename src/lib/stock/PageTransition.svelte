<!--
  PageTransition.svelte
  ─────────────────────────────────────────────────────────────
  SvelteKit 用の汎用ページ遷移ラッパー。
  - 旧ページ: scale down + darken overlay + 白パネル slide down (from top)
  - 新ページ: 白パネル上にフェードイン
  - Awwwards 系の silky ease を採用 (CustomEase 'panelSilk')

  USAGE
  -------------------------------------------------------------
  1) gsap と CustomEase を install
     npm i gsap

  2) +layout.svelte で本コンポーネントを root に配置
     <PageTransition
       onPanelUp={() => { /* Lenis stop など */ }}
       onFadeInStart={() => { /* Header 表示 */ }}
       onComplete={() => { /* Lenis start など */ }}
     >
       <Header />
       {@render children()}
       <Footer />
     </PageTransition>

  3) Lenis を併用する場合: 親で lenis.stop() / lenis.start()
     を onPanelUp / onComplete に渡す

  CUSTOMIZATION
  -------------------------------------------------------------
  - panelColor: 白パネルの色 (default '#ffffff'). 黒系遷移は '#121212' 等
  - skipFadeIn: ローダーや専用イントロが直後に走るルートでは
                true にしてフェードインをスキップ
-->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import gsap from 'gsap';
	import { CustomEase } from 'gsap/CustomEase';

	gsap.registerPlugin(CustomEase);
	// Awwwards-style silk ease for the white panel
	if (!CustomEase.get('panelSilk')) CustomEase.create('panelSilk', 'M0,0 C0.76,0 0.24,1 1,1');
	// Soft, slow-landing ease for content fade-in
	if (!CustomEase.get('contentFade'))
		CustomEase.create('contentFade', 'M0,0 C0.22,1 0.36,1 1,1');

	type Props = {
		children: Snippet;
		// Per-route override: pass true on routes that hand off to a
		// custom intro/loader so we skip the fade-in step.
		skipFadeIn?: boolean;
		// Panel background — supports per-route theming.
		panelColor?: string;
		// Lifecycle hooks
		onPanelUp?: () => void; // called when the outgoing animation starts (good for lenis.stop())
		onFadeInStart?: () => void; // called as the new page begins to fade in (good for Header reveal)
		onComplete?: () => void; // called when the entire transition ends
		// Tunable timings (seconds)
		outDuration?: number;
		fadeInDelay?: number;
		fadeInDuration?: number;
		pageScale?: number;
		darkenOpacity?: number;
		darkenDelayRatio?: number;
		darkenDurationRatio?: number;
		panelDelayRatio?: number;
		panelDuration?: number;
	};

	let {
		children,
		skipFadeIn = false,
		panelColor = '#ffffff',
		onPanelUp,
		onFadeInStart,
		onComplete,
		outDuration = 1.0,
		fadeInDelay = 0.3,
		fadeInDuration = 0.9,
		pageScale = 0.85,
		darkenOpacity = 0.35,
		darkenDelayRatio = 0.25,
		darkenDurationRatio = 0.75,
		panelDelayRatio = 0.45,
		panelDuration = 0.95
	}: Props = $props();

	let needsEntryAnim = false;
	let activeSkipFadeIn = false;
	// Tracks the in-flight outgoing timeline so a navigation that interrupts
	// another one can kill it outright, rather than leaving its callbacks to
	// fire late against a route that's already moved on (see the kill call
	// below for what that leaves stuck).
	let activeTimeline: gsap.core.Timeline | null = null;

	onNavigate((navigation) => {
		if (!navigation.from) return;
		if (navigation.from.url.pathname === navigation.to?.url.pathname) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion) return;

		// A second navigation starting before the first has finished its ~1.2s
		// outgoing+fade-in cycle leaves that first cycle's callbacks (including
		// the .darken-overlay backgroundColor reset, which only runs in the
		// fade-in's onComplete) never firing — nothing else was going to clear
		// its armed 'black' background-color. Kill anything still running
		// before arming a new cycle, so only the latest navigation's callbacks
		// ever get to run.
		activeTimeline?.kill();
		gsap.killTweensOf(['.page-wrapper', '.darken-overlay', '.transition-panel']);

		needsEntryAnim = true;
		activeSkipFadeIn = skipFadeIn;
		onPanelUp?.();

		// Anchor scale origin to the visible viewport center. Use visualViewport
		// (the currently-visible height) rather than innerHeight (which iOS Safari
		// keeps pinned to the toolbar-collapsed max) so the origin matches what's
		// actually on screen when the toolbar is showing.
		const scrollY = window.scrollY;
		const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
		const vhCenter = scrollY + viewportHeight / 2;
		gsap.set('.page-wrapper', {
			transformOrigin: `50% ${vhCenter}px`
		});
		// Arm the panel transparent, NOT panelColor — see the CSS note: a
		// same-class bug to .darken-overlay's. transform: translateY(-100%)
		// hides the panel visually, but iOS Safari's toolbar/safe-area
		// sampler reads a fixed element's background-color independent of
		// where transform has moved it to, so an opaque panel sitting
		// off-screen still painted the safe area panelColor (white, by
		// default) for the ~0.45s between arming and the slide-in actually
		// starting. The real colour is snapped on in the slide-in tween's
		// onStart below, once the panel is genuinely about to be visible.
		gsap.set('.transition-panel', { backgroundColor: 'transparent' });
		// Arm the darken layer at zero alpha (kept transparent while idle — see
		// the CSS note on why alpha, not opacity, carries the darkness).
		gsap.set('.darken-overlay', { backgroundColor: 'rgba(0,0,0,0)' });

		return new Promise<void>((resolve) => {
			const tl = gsap.timeline({
				onComplete: () => {
					if (activeSkipFadeIn) {
						gsap.set('.page-wrapper', {
							scale: 1,
							transformOrigin: 'center center'
						});
					} else {
						gsap.set('.page-wrapper', {
							scale: 1,
							opacity: 0,
							zIndex: 1100,
							transformOrigin: 'center center'
						});
					}
					activeTimeline = null;
					resolve();
				}
			});
			activeTimeline = tl;

			tl.to(
				'.page-wrapper',
				{ scale: pageScale, duration: outDuration, ease: 'power2.inOut' },
				0
			);

			tl.to(
				'.darken-overlay',
				{
					backgroundColor: `rgba(0,0,0,${darkenOpacity})`,
					duration: outDuration * darkenDurationRatio,
					ease: 'power2.inOut'
				},
				outDuration * darkenDelayRatio
			);

			tl.to(
				'.transition-panel',
				{
					y: '0%',
					duration: panelDuration,
					ease: 'panelSilk',
					// Snap to the real colour right as the slide-in starts, not a
					// moment before — see the arming comment above.
					onStart: () => gsap.set('.transition-panel', { backgroundColor: panelColor })
				},
				outDuration * panelDelayRatio
			);
		});
	});

	afterNavigate(() => {
		// Unconditional safety net, ahead of the needsEntryAnim gate below:
		// .darken-overlay and .transition-panel only stay safe for Safari's
		// toolbar/safe-area sampler (see the CSS notes) while their
		// background-color is 'transparent', and that only gets restored
		// ~1.2s after a navigation settles (the fade-in tween's onComplete,
		// further down). Navigate again inside that window — a second link
		// tapped before the first page has finished fading in — and
		// needsEntryAnim gets consumed by the FIRST afterNavigate while the
		// SECOND onNavigate has already re-armed both layers to an opaque
		// colour; nothing else then guarantees their own reset ever runs.
		// Force both back to transparent on every settled navigation,
		// independent of which one armed them.
		if (browser) {
			gsap.set('.darken-overlay', { backgroundColor: 'transparent' });
			gsap.set('.transition-panel', { backgroundColor: 'transparent' });
		}

		if (!needsEntryAnim) return;
		needsEntryAnim = false;
		if (!browser) return;

		if (activeSkipFadeIn) {
			// Hand off to a custom intro/loader on the new page.
			gsap.set('.page-wrapper', { clearProps: 'all' });
			// Hand the hidden state back to CSS (translateY(-100%)) instead of baking
			// a px transform — otherwise the fixed white panel leaves a strip pinned
			// at the top on mobile when the URL bar retracts and the viewport grows.
			gsap.set('.transition-panel', { clearProps: 'transform,backgroundColor' });
			gsap.set('.darken-overlay', { backgroundColor: 'transparent' });
			activeSkipFadeIn = false;
			onComplete?.();
			return;
		}

		gsap.to('.page-wrapper', {
			opacity: 1,
			duration: fadeInDuration,
			delay: fadeInDelay,
			ease: 'contentFade',
			onStart: () => {
				onFadeInStart?.();
			},
			onComplete: () => {
				gsap.set('.page-wrapper', { clearProps: 'all' });
				// Hand the hidden state back to CSS (translateY(-100%)) instead of baking
			// a px transform — otherwise the fixed white panel leaves a strip pinned
			// at the top on mobile when the URL bar retracts and the viewport grows.
			gsap.set('.transition-panel', { clearProps: 'transform,backgroundColor' });
				gsap.set('.darken-overlay', { backgroundColor: 'transparent' });
				onComplete?.();
			}
		});
	});
</script>

<div class="transition-bg">
	<div class="page-wrapper">
		{@render children()}
	</div>
</div>

<div class="darken-overlay" aria-hidden="true"></div>
<div class="transition-panel" aria-hidden="true"></div>

<style>
	/* iOS Safari tints its floating toolbar (and the safe areas behind it) with
	   the BODY's background-color. A black body therefore paints a black band
	   under a white page — the bug this used to cause. The transition's black
	   backdrop lives on .transition-bg (a real element, never sampled by
	   Safari), so body must stay the page colour. Do not set body black again. */
	:global(body) {
		background: var(--color-bg, #ffffff);
	}

	.transition-bg {
		background: black;
		min-height: 100vh;
		min-height: 100dvh;
	}

	/* No `will-change` here: it would make this wrapper the containing block
	   for `position: fixed` descendants and break GSAP ScrollTrigger pins.
	   GSAP promotes layers itself while the transition is animating. */
	.page-wrapper {
		background: var(--color-bg, white);
		min-height: 100vh;
		min-height: 100dvh;
		position: relative;
	}

	/* Transparent while idle on purpose: iOS Safari samples the background-color
	   of viewport-edge `position: fixed` elements to tint its toolbar, and it
	   does so even when the element is fully transparent via opacity — so the
	   darkening is driven entirely through background-color's own alpha
	   (rgba, animated by GSAP below), never through the `opacity` property.
	   An earlier version armed this to a flat `background-color: black` and
	   animated `opacity` on top of it; the color itself stayed opaque black
	   for the whole transition, which Safari read straight through the
	   opacity, tinting the toolbar/safe-areas solid black. Keeping the alpha
	   IN the color sidesteps that. */
	.darken-overlay {
		position: fixed;
		inset: 0;
		background: transparent;
		z-index: 998;
		pointer-events: none;
		will-change: background-color;
	}

	/* Hidden via translateY(-100%) — slides down from above on entry. Use the
	   LARGE viewport height (100lvh) so the panel always clears the collapsed
	   mobile toolbar height — otherwise a white band pins to the top when the
	   URL bar retracts. The transition also clearProps:'transform' on reset
	   so no stale px translate is left behind.

	   Transparent while idle, same reasoning as .darken-overlay above: this
	   is ALSO a viewport-edge `position: fixed` element, and Safari's
	   toolbar/safe-area sampler reads its background-color independently of
	   `transform` — an opaque panel sitting off-screen (translateY(-100%))
	   still painted the safe area panelColor. The real colour is set by the
	   script only once the slide-in is actually starting (see onStart
	   above), and cleared back to transparent on every reset. */
	.transition-panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		height: 100lvh;
		background: transparent;
		transform: translateY(-100%);
		z-index: 1000;
		pointer-events: none;
		will-change: transform;
	}
</style>
