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

  iOS 26 の floating tab bar 対策 (2026-08-31, Dev/OTIF の +layout.svelte
  から移植)
  -------------------------------------------------------------
  .darken-overlay / .transition-panel は position:fixed ではなく、スク
  ロール層内の position:absolute として実装している。iOS 26 Safari の
  floating tab bar は position:fixed 要素をレイアウトビューポート（タブ
  バーの上端）でクリップし、物理画面の本当の下端までは届かない一方、通
  常のスクロール層のコンテンツは viewport-fit=cover により物理下端まで
  描画される。100vh/100dvh/100lvh すら物理下端に届かない（実機計測:
  物理812に対しlvh=704, dvh/innerHeight=610-704, safe-area env=0）ため、
  screen.height を使った panelMetrics() で毎ナビゲーションごとに実測ボッ
  クスを組み立てている。「白背景が一瞬出る」系のバグは大抵これが原因。
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
	// below for what that leaves stuck). Killing the tweens doesn't reset
	// their properties, but the very next thing onNavigate does is re-arm
	// every property fresh (display/top/height/y/yPercent/colour) below, so
	// whatever state a kill leaves behind is fully overwritten either way —
	// no separate safety net needed on top of this.
	let activeTimeline: gsap.core.Timeline | null = null;

	// Transition-surface geometry, in raw px and DOCUMENT coordinates —
	// ported from Dev/OTIF's +layout.svelte, which hit and fixed this same
	// bug first. iOS 26 Safari's floating tab bar clips `position: fixed`
	// content at the layout viewport (ends above the tab), while in-flow/
	// scroll-layer content paints edge-to-edge to the true physical screen
	// bottom (viewport-fit=cover) — so .darken-overlay/.transition-panel
	// live as position:absolute inside the scroll layer (boxed around the
	// current scrollY each navigation) instead of position:fixed. No CSS
	// viewport unit reaches the physical bottom there (measured on device:
	// physical 812 vs lvh 704, dvh/innerHeight 610-704, safe-area env 0) —
	// screen.height is the only metric that spans it. Desktop (fine
	// pointer) uses innerHeight instead: exact there, while screen.height
	// (the whole monitor) would only add dead travel.
	const SURFACE_PAD = 150; // coverage beyond the viewport on each side
	function panelMetrics() {
		const coarse = window.matchMedia('(pointer: coarse)').matches;
		const physical = coarse
			? Math.max(window.screen.height, window.innerHeight)
			: window.innerHeight;
		return {
			top: window.scrollY - SURFACE_PAD, // document-coord box top
			height: physical + SURFACE_PAD * 2, // pad above + screen + pad below
			// translateY that parks the box's BOTTOM edge just above the
			// physical screen top (this variant enters from above, unlike
			// OTIF's bottom entry — negative of OTIF's own offY).
			offY: -(physical + SURFACE_PAD + 20)
		};
	}

	onNavigate((navigation) => {
		if (!navigation.from) return;
		if (navigation.from.url.pathname === navigation.to?.url.pathname) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion) return;

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

		// yPercent is explicitly zeroed: the resets further down park the
		// panel via yPercent, and GSAP tracks y and yPercent as SEPARATE
		// channels that add together — without this, every navigation after
		// the first started from yPercent:-100 + y:<px> combined and the
		// panel never entered the screen at all.
		const m = panelMetrics();
		gsap.set('.transition-panel', {
			display: 'block',
			top: m.top,
			height: m.height,
			y: m.offY,
			yPercent: 0,
			backgroundColor: panelColor
		});
		gsap.set('.darken-overlay', { display: 'block', top: m.top, height: m.height, opacity: 0 });

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
					opacity: darkenOpacity,
					duration: outDuration * darkenDurationRatio,
					ease: 'power2.inOut'
				},
				outDuration * darkenDelayRatio
			);

			// y in px (from the physical-top start set above), not '0%' — see
			// panelMetrics.
			tl.to(
				'.transition-panel',
				{ y: 0, duration: panelDuration, ease: 'panelSilk' },
				outDuration * panelDelayRatio
			);
		});
	});

	afterNavigate(() => {
		if (!needsEntryAnim) return;
		needsEntryAnim = false;
		if (!browser) return;

		if (activeSkipFadeIn) {
			// Hand off to a custom intro/loader on the new page. display:none
			// while idle keeps both layers out of the paint tree (and out of
			// Safari's background sampling on top of that).
			gsap.set('.page-wrapper', { clearProps: 'all' });
			gsap.set('.transition-panel', {
				display: 'none',
				y: panelMetrics().offY,
				yPercent: 0,
				clearProps: 'backgroundColor'
			});
			gsap.set('.darken-overlay', { display: 'none', opacity: 0 });
			activeSkipFadeIn = false;
			onComplete?.();
			return;
		}

		// The outgoing box (top/height) was computed from scrollY at the OLD
		// page — SvelteKit resets scroll to 0 for a normal navigation, so by
		// now that box sits low, document-coordinate-wise, relative to the
		// NEW page's (reset) scroll position. If the user had scrolled down
		// any real amount before navigating, that leaves a gap at the BOTTOM
		// of the new viewport where neither surface reaches (this variant
		// enters from above). Re-box both to the current scroll position —
		// still fully opaque/covering at this instant, this only moves where
		// that coverage actually sits.
		const m2 = panelMetrics();
		gsap.set(['.transition-panel', '.darken-overlay'], { top: m2.top, height: m2.height });

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
				gsap.set('.transition-panel', {
					display: 'none',
					y: panelMetrics().offY,
					yPercent: 0,
					clearProps: 'backgroundColor'
				});
				gsap.set('.darken-overlay', { display: 'none', opacity: 0 });
				onComplete?.();
			}
		});
	});
</script>

<div class="transition-bg">
	<div class="page-wrapper">
		{@render children()}
	</div>
	<!-- Transition surfaces live INSIDE the scroll layer (absolute, document
	     coordinates set per-navigation from scrollY), NOT position:fixed —
	     see the panelMetrics comment above for why. Nested inside
	     .transition-bg (position:relative) so their top/left/right resolve
	     against it, not the initial containing block. -->
	<div class="darken-overlay" aria-hidden="true"></div>
	<div class="transition-panel" aria-hidden="true"></div>
</div>

<style>
	/* iOS Safari tints its floating toolbar (and the safe areas behind it) with
	   the BODY's background-color. Kept black deliberately (2026-08-31,
	   matching Dev/OTIF): .page-wrapper's own min-height:100dvh doesn't reach
	   the true physical screen bottom on iOS 26's floating tab bar either
	   (same gap panelMetrics works around above) — body shows through that
	   sliver during ordinary scrolling, not just transitions, and a black
	   sliver there reads as an intentional edge rather than a stray white
	   gap. (An EARLIER version of this comment said the opposite — "do not
	   set body black" — written back when the black was a blanket, untimed
	   body colour with no real fix for the underlying gap. This is a
	   different, narrower situation: the gap itself is now unavoidable
	   given iOS 26's clipping, so black is the better fallback for it.) */
	:global(body) {
		background: black;
	}

	.transition-bg {
		background: black;
		min-height: 100vh;
		min-height: 100dvh;
		/* Anchor for the absolutely-positioned transition surfaces inside
		   (.darken-overlay / .transition-panel) — its top is the document
		   top, so their JS-set `top` values are plain scrollY offsets. */
		position: relative;
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

	.darken-overlay {
		/* Absolute in the scroll layer, NOT fixed — see panelMetrics above:
		   iOS 26 clips the fixed layer at the layout viewport (ends above
		   the floating tab), while scroll-layer content paints to the
		   physical screen bottom, the only way this veil actually covers
		   the whole screen there. top/height are set per-navigation from
		   scrollY + physical screen height (padded both ways); left/right
		   span the document. */
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 100px; /* placeholder — JS sets the real box every navigation */
		background: black;
		opacity: 0;
		z-index: 998;
		pointer-events: none;
		will-change: opacity;
		/* display:none while idle — keeps it out of Safari's background
		   sampling and out of the paint tree entirely. The script flips
		   display on/off around the animation. */
		display: none;
	}

	.transition-panel {
		/* Absolute in the scroll layer for the same iOS 26 fixed-layer-clip
		   reason as .darken-overlay above — the sheet can only reach the
		   physical screen edges from inside the scroll layer. Its box
		   (top/height) is set per-navigation from scrollY + physical screen
		   height; the slide is a px translateY within that box, entering
		   from above (negative offY — see panelMetrics). */
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100px; /* placeholder — JS sets the real box every navigation */
		background: white;
		transform: translateY(-100%);
		z-index: 1000;
		pointer-events: none;
		will-change: transform;
		/* display:none while idle — same reasoning as .darken-overlay. */
		display: none;
	}
</style>
