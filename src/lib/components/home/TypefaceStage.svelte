<!-- Home page typeface showcase — ONE pinned stage, not N scrolling sections.
     (2026-09, at the user's request: "せっかく同じデザインなので位置固定で中身
     だけ変わるようにして欲しい。イメージはピンして、一定量スクロールで画像が
     閉じて次のが開いたり" — same layout for every typeface, so hold it still
     and change only its contents; pin the imagery, and after a set amount of
     scroll one closes and the next opens.)

     Replaces TypefaceSection.svelte, whose grid/clamps/SP overrides are ported
     here verbatim — only the per-section IntersectionObserver and the scrubbed
     GSAP timeline are gone, since neither survives the sections collapsing into
     one stage.

     MECHANISM
     A wrapper N screens tall holds one `position: sticky` pin, one screen tall.
     Sticky travel is therefore (N-1) screens = exactly one swap per screen of
     scroll. Pinning is CSS sticky rather than a GSAP pin on purpose:
       - GSAP's pin injects a .pin-spacer wrapper; the home page's snap reads
         geometry straight off these elements, and sticky changes no DOM.
       - Lenis measures with `ignoreSticky: true` but has no handling for a
         position:fixed pinned element, so GSAP-pinned offsets read wrong.
       - coverReveal/maskReveal both bail below 768px precisely because
         pin-spacers (fixed px) desync against dvh when the mobile URL bar
         moves. Sticky has no spacer, so this stage keeps working on phones.
     See scroll.ts's own header and base.css's `overflow-x: clip` guard — a
     `overflow-x: hidden` ancestor anywhere would kill the pin outright.

     THE SWAP ("画像が閉じて次のが開く")
     A horizontal-band shutter: `clip-path: inset(C 0 C 0)`, C 0%→50% to close
     and 50%→0% to open, staggered panel → blockA → blockB. clip-path rather
     than scaleY because scaling would squash the headline and the specimen
     lines, and distorted type on a type foundry's own page is not acceptable.
     Nothing moves or resizes: the layout is literally fixed and only the
     contents change.

     PROGRESSIVE ENHANCEMENT
     Without `.is-pinned` (SSR, no JS, or prefers-reduced-motion) the layers are
     plain stacked full-height blocks, all fully open, in document order — the
     page still reads correctly, it just doesn't choreograph. onMount is the
     only thing that adds the class. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Typeface } from '$lib/data/typefaces';
	import Arrow from '$lib/components/Arrow.svelte';
	import { onScroll } from '$lib/scroll';
	import { activeTypeface } from '$lib/state/activeTypeface.svelte';
	import { homeIntro } from '$lib/state/homeIntro.svelte';

	interface Props {
		typefaces: Typeface[];
	}
	let { typefaces }: Props = $props();

	const count = $derived(typefaces.length);

	// Shutter choreography, in units of `f` — the phase within one swap, 0..1.
	// The 0.08 gap between CLOSE_END and OPEN_START is a deliberate empty beat:
	// the outgoing composition is fully shut before the incoming one starts.
	const CLOSE_END = 0.62;
	const OPEN_START = 0.7;
	const STAGGER = 0.06; // per shutter element (panel 0, blockA 1, blockB 2)
	// Where the "current" typeface flips — inside the empty beat between the
	// outgoing composition shutting and the incoming one opening, so the mobile
	// footer bar and the stage's bleed colour change exactly when the screen is
	// blank rather than a sixth of a step early (which is what Math.round did).
	const INDEX_FLIP = (CLOSE_END + OPEN_START) / 2;

	const easeInCubic = (t: number) => t * t * t;
	const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
	const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

	let wrapEl: HTMLElement | undefined = $state();
	let pinEl: HTMLElement | undefined = $state();
	let layerEls: HTMLElement[] = $state([]);
	let pinned = $state(false);
	let activeIndex = $state(0);
	// Read once at init (not in onMount) because the markup below needs it for
	// the video's own `autoplay` attribute, which is evaluated at creation.
	const prefersReducedMotion = browser
		? window.matchMedia('(prefers-reduced-motion: reduce)').matches
		: false;

	// Cached per-layer element handles — queried once after mount rather than
	// bound individually, so the markup stays readable.
	type LayerParts = {
		root: HTMLElement;
		shutters: HTMLElement[];
		sidebar: HTMLElement | null;
		headline: HTMLElement | null;
		video: HTMLVideoElement | null;
	};
	let parts: LayerParts[] = [];

	function collectParts() {
		parts = layerEls.filter(Boolean).map((root) => ({
			root,
			shutters: Array.from(root.querySelectorAll<HTMLElement>('[data-shutter]')),
			sidebar: root.querySelector<HTMLElement>('.TypefaceStage__sidebar'),
			headline: root.querySelector<HTMLElement>('.TypefaceStage__headline'),
			video: root.querySelector<HTMLVideoElement>('video')
		}));
	}

	function applyLayer(
		layer: LayerParts,
		clipFor: (shutterIndex: number) => number,
		sidebarOpacity: number,
		sidebarY: number,
		headlineOpacity: number,
		visible: boolean
	) {
		layer.root.style.visibility = visible ? 'visible' : 'hidden';
		for (const el of layer.shutters) {
			const k = Number(el.dataset.shutter ?? 0);
			el.style.setProperty('--clip', `${clipFor(k)}%`);
		}
		if (layer.sidebar) {
			layer.sidebar.style.opacity = String(sidebarOpacity);
			layer.sidebar.style.transform = `translate3d(0, ${sidebarY}px, 0)`;
		}
		if (layer.headline) layer.headline.style.opacity = String(headlineOpacity);
	}

	function update() {
		if (!pinned || !wrapEl || !pinEl || parts.length < 2) return;

		const rect = wrapEl.getBoundingClientRect();
		// Measure the PIN, never window.innerHeight: the pin is sized in svh
		// (stable small viewport) while innerHeight is the dynamic one, so on
		// iOS they disagree by exactly the URL bar's height.
		const pinH = pinEl.getBoundingClientRect().height;
		const travel = rect.height - pinH;
		if (travel <= 0) return;

		const p = clamp01(-rect.top / travel);
		const stepPos = p * (count - 1); // continuous, 0 … count-1
		const out = Math.min(Math.floor(stepPos), count - 2); // outgoing layer
		const f = stepPos - out; // phase within this swap, 0 … 1

		const next = activeTypeface;
		const current = f < INDEX_FLIP ? out : out + 1;
		if (current !== activeIndex) activeIndex = current;

		for (let k = 0; k < parts.length; k++) {
			const layer = parts[k];
			if (k === out) {
				// Closing: eased in, so it hangs open then slams shut.
				const closeT = (s: number) =>
					easeInCubic(clamp01((f - s * STAGGER) / (CLOSE_END - s * STAGGER)));
				const sidebarT = easeInCubic(clamp01(f / 0.28));
				applyLayer(layer, (s) => 50 * closeT(s), 1 - sidebarT, -16 * sidebarT, 1 - closeT(0), true);
			} else if (k === out + 1) {
				// Opening: eased out, so it bursts then settles.
				const openT = (s: number) =>
					easeOutCubic(clamp01((f - OPEN_START - s * STAGGER) / (1 - OPEN_START - s * STAGGER)));
				const sidebarT = easeOutCubic(clamp01((f - OPEN_START) / (0.96 - OPEN_START)));
				applyLayer(layer, (s) => 50 * (1 - openT(s)), sidebarT, 16 * (1 - sidebarT), 1, true);
			} else {
				// Everything else stays shut and skips paint entirely.
				applyLayer(layer, () => 50, 0, 0, 1, false);
			}
		}

		// Paint the strip of wrapper that shows below the pin when the iOS URL
		// bar retracts (pin is svh, viewport is dvh) in the active layer's own
		// block colour, so the seam reads as part of the composition.
		const activeTf = typefaces[current];
		if (activeTf?.homeSection) {
			wrapEl.style.setProperty('--stage-bleed', activeTf.homeSection.blockBg);
		}

		// Report to the mobile footer bar. Compared by slug, never by object
		// identity — Vite HMR can leave two same-slug instances around (the
		// bug that broke the old per-section observer mid-session).
		if (activeTf && next.current?.slug !== activeTf.slug) next.current = activeTf;
		// Gated on the intro OP being genuinely done (2026-09, at the user's
		// report: "OP中にNormaの書体フッターが表示されてる") — rect.top alone
		// isn't enough: IntroHero is sized in dvh while this reads against
		// window.innerHeight (the static layout viewport), and on mobile those
		// two can disagree enough that this stage already reads as "on
		// screen" while the OP is still playing over it. window.scrollY > 0
		// is a further explicit backstop (2026-09, "Topスクロール位置0の時は、
		// 書体フッター非表示にして") — at the very top of the page this stage
		// can never be the one actually in view, no matter what the rect math
		// above says.
		next.visible =
			homeIntro.introComplete &&
			window.scrollY > 0 &&
			rect.top < window.innerHeight &&
			rect.bottom > 0;
	}

	onMount(() => {
		if (!browser) return;
		collectParts();

		const reduced = prefersReducedMotion;

		// Under two typefaces there is no travel to spend, so the stage stays
		// in its stacked form rather than dividing by zero.
		if (reduced || count < 2) {
			// Stacked fallback still has to report which typeface is centred —
			// this is the proven per-section observer, kept only for this path.
			const observers = layerEls.filter(Boolean).map((el, i) => {
				const io = new IntersectionObserver(
					([entry]) => {
						if (entry.isIntersecting) {
							activeTypeface.current = typefaces[i];
							activeTypeface.visible = true;
						} else if (activeTypeface.current?.slug === typefaces[i].slug) {
							activeTypeface.visible = false;
						}
					},
					{ rootMargin: '-50% 0px -50% 0px', threshold: 0 }
				);
				io.observe(el);
				return io;
			});
			return () => observers.forEach((io) => io.disconnect());
		}

		pinned = true;

		let frame = 0;
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				update();
			});
		};

		// One rAF-coalesced reader for everything: the shutter, the active
		// index and the footer bar can never disagree, because they are all
		// derived from the same rect in the same pass.
		const offScroll = onScroll(schedule);
		window.addEventListener('resize', schedule, { passive: true });

		// Layers only become absolute once `pinned` is applied to the DOM.
		requestAnimationFrame(() => {
			collectParts();
			update();
		});
		// Elio and Norma are font-display:swap variable fonts — the headline
		// reflows when they land, which moves this stage under the reader.
		document.fonts?.ready.then(update);

		return () => {
			if (frame) cancelAnimationFrame(frame);
			offScroll();
			window.removeEventListener('resize', schedule);
			activeTypeface.visible = false;
		};
	});

	// Re-run the reader the instant the OP finishes, rather than waiting for
	// the reader's next scroll/resize — otherwise, if the stage already reads
	// as "on screen" at rest (see the dvh/innerHeight note above), the footer
	// bar would stay hidden until the reader happens to scroll again, even
	// though the OP is genuinely done and it should show now.
	$effect(() => {
		if (homeIntro.introComplete && pinned) update();
	});

	// Norma's wght-sweep clip only plays while its own layer is the active one
	// — a looping video under a shut shutter is wasted decode. Under reduced
	// motion it never plays at all: base.css's blanket only zeroes CSS
	// durations, so a looping <video> has to opt out by hand (the `autoplay`
	// attribute is dropped in the markup for the same reason, since it fires
	// before this effect ever runs).
	$effect(() => {
		const i = activeIndex;
		parts.forEach((layer, k) => {
			if (!layer.video) return;
			if (prefersReducedMotion) {
				layer.video.pause();
				return;
			}
			if (k === i) void layer.video.play().catch(() => {});
			else layer.video.pause();
		});
	});
</script>

<section
	class="TypefaceStage"
	class:is-pinned={pinned}
	bind:this={wrapEl}
	style="--steps: {count};"
>
	<div class="TypefaceStage__pin" bind:this={pinEl}>
		{#each typefaces as tf, i (tf.slug)}
			{@const hs = tf.homeSection!}
			<div
				class="TypefaceStage__layer"
				bind:this={layerEls[i]}
				inert={pinned && i !== activeIndex}
				style="--type-font: '{tf.fontFamily}'; --panel-bg: {hs.panelBg}; --panel-fg: {hs.panelFg}; --block-bg: {hs.blockBg}; --block-fg: {hs.blockFg};"
			>
				<!-- PC only — name/tagline/spec/Discover, always on a white ground.
				     It is the frame the shutter opens inside, so it is never clipped;
				     it fades and drifts instead. -->
				<div class="TypefaceStage__sidebar">
					<p class="TypefaceStage__name">{tf.name} Ōgast</p>
					<p class="TypefaceStage__tagline">{tf.tagline}</p>
					<p class="TypefaceStage__meta">
						{tf.weights.length} weights / {tf.info?.languages ?? '—'} languages supported
					</p>
					<a class="TypefaceStage__cta" href="/fonts/{tf.slug}">
						<span class="CtaLabel">Discover</span>
						<Arrow size={9} />
					</a>
				</div>

				<div class="TypefaceStage__panel" data-shutter="0">
					<p
						class="TypefaceStage__headline"
						style="font-family: '{tf.fontFamily}', sans-serif; font-variation-settings: 'wght' {hs.headlineWeight}; font-weight: {hs.headlineWeight};"
					>
						{hs.headline}
					</p>
				</div>

				<div class="TypefaceStage__blocks">
					<div class="TypefaceStage__blockA" data-shutter="1">
						{#if tf.heroVideo}
							<video
								class="TypefaceStage__video"
								src={tf.heroVideo}
								autoplay
								loop
								muted
								playsinline
								aria-label="{tf.name} variable weight axis specimen"
							></video>
						{:else}
							<span class="TypefaceStage__glyph" style="font-family: '{tf.fontFamily}', sans-serif;"
								>{hs.glyph}</span
							>
						{/if}
					</div>
					<div class="TypefaceStage__blockB" data-shutter="2">
						{#if tf.specimen}
							<div
								class="TypefaceStage__specimen"
								style="font-family: '{tf.fontFamily}', sans-serif;"
							>
								{#each tf.specimen as line (line)}
									<span class="TypefaceStage__specimen-line">{line}</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	/* base.css's global `section { padding-left/right: var(--padding) }` would
	   otherwise inset this full-bleed stage from both edges. No `overflow`
	   property here on purpose: overflow on the wrapper would make it the
	   sticky containment box and unpin the stage outright. */
	.TypefaceStage {
		padding-left: 0;
		padding-right: 0;
		position: relative;
		background: var(--stage-bleed, #ffffff);
	}

	/* Travel = (steps - 1) screens, i.e. exactly one swap per screen. */
	.TypefaceStage.is-pinned {
		height: calc(var(--steps) * 100svh);
	}

	/* Height only in the pinned form. Un-pinned (SSR, no JS, reduced motion) the
	   layers are N stacked full-height screens and this has to grow with them —
	   a fixed 100svh here would clip everything after the first. */
	.TypefaceStage__pin {
		background: #ffffff;
	}

	.is-pinned .TypefaceStage__pin {
		position: sticky;
		top: 0;
		height: 100svh;
		overflow: hidden;
	}

	.TypefaceStage__layer {
		display: grid;
		grid-template-columns: 362fr 1078fr;
		grid-template-rows: 453fr 447fr;
		grid-template-areas:
			'sidebar panel'
			'sidebar blocks';
		height: 100svh;
		background: #ffffff;
	}

	/* Transparent once stacked on top of one another: the layers sit in the
	   same box, later ones paint over earlier ones, and an opaque ground on the
	   incoming layer would mask the outgoing one completely — all you would see
	   is white while both shutters are mid-swap. The pin below supplies the
	   white ground instead. (The un-pinned fallback keeps its own background,
	   since there the layers are separate stacked screens.) */
	.is-pinned .TypefaceStage__layer {
		position: absolute;
		inset: 0;
		height: auto;
		background: transparent;
	}

	/* The shutter itself. --clip is written per element, staggered, from the
	   scroll reader above. */
	[data-shutter] {
		clip-path: inset(var(--clip, 0%) 0 var(--clip, 0%) 0);
	}

	/* --- Sidebar (PC only) --- */
	.TypefaceStage__sidebar {
		grid-area: sidebar;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8px;
		padding-inline: clamp(24px, 3.4vw, 49px);
		will-change: opacity, transform;
	}

	.TypefaceStage__name {
		font-family: var(--type-font), sans-serif;
		font-size: clamp(22px, 2.2vw, 32px);
		line-height: 1.25;
		font-weight: 400;
		color: #000000;
		margin: 0;
	}

	.TypefaceStage__tagline {
		font-family: var(--type-font), sans-serif;
		font-size: clamp(13px, 1.1vw, 16px);
		line-height: 1.25;
		font-weight: var(--fw-light);
		color: #000000;
		margin: 8px 0 0;
	}

	.TypefaceStage__meta {
		font-family: var(--type-font), sans-serif;
		font-size: clamp(11px, 0.85vw, 12px);
		line-height: 1.25;
		font-weight: var(--fw-light);
		color: #000000;
		opacity: 0.6;
		margin: 20px 0 0;
	}

	.CtaLabel {
		display: inline-block;
		transform: translateY(1.5px);
	}

	.TypefaceStage__cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 28px;
		font-family: var(--type-font), sans-serif;
		font-size: 14px;
		font-weight: var(--fw-ui);
		color: #000000;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.TypefaceStage__cta:hover {
		opacity: 0.6;
	}

	/* --- Panel: giant self-referential headline --- */
	.TypefaceStage__panel {
		grid-area: panel;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--panel-bg);
		overflow: hidden;
	}

	.TypefaceStage__headline {
		font-size: clamp(40px, 6.1vw, 88px);
		line-height: 1.25;
		color: var(--panel-fg);
		text-align: center;
		white-space: nowrap;
		margin: 0;
		padding-inline: 16px;
	}

	/* --- Blocks: two concept tiles standing in for real specimen photography --- */
	.TypefaceStage__blocks {
		grid-area: blocks;
		display: grid;
		grid-template-columns: 402fr 676fr;
	}

	.TypefaceStage__blockA,
	.TypefaceStage__blockB {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: var(--block-bg);
	}

	.TypefaceStage__video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.TypefaceStage__glyph {
		font-size: clamp(96px, 13vw, 190px);
		line-height: 1;
		color: var(--block-fg);
	}

	.TypefaceStage__specimen {
		text-align: center;
		color: var(--block-fg);
	}

	/* base.css's tag-selector reset sets color directly on span, which beats
	   inheriting from the wrapping div above — same gotcha as .Elio__abc-line. */
	.TypefaceStage__specimen-line {
		display: block;
		font-size: clamp(16px, 2.6vw, 30px);
		line-height: 1.3;
		color: var(--block-fg);
	}

	@media (max-width: 767.98px) {
		.TypefaceStage__layer {
			grid-template-columns: 1fr;
			grid-template-rows: 358fr 362fr;
			grid-template-areas: 'panel' 'blocks';
		}

		.TypefaceStage__sidebar,
		.TypefaceStage__cta {
			display: none;
		}

		.TypefaceStage__headline {
			font-size: 64px;
			line-height: 1;
			white-space: normal;
			max-width: 90%;
		}

		.TypefaceStage__blocks {
			grid-template-columns: 1fr;
		}

		/* SP shows only block A, matching Figma's own single-photo mobile
		   simplification. */
		.TypefaceStage__blockB {
			display: none;
		}

		.TypefaceStage__glyph {
			font-size: 140px;
		}
	}
</style>
