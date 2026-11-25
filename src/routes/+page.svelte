<script lang="ts">
	import { browser } from '$app/environment';
	import HomeTop from '$lib/components/home/HomeTop.svelte';
	import GlyphFill from '$lib/components/home/GlyphFill.svelte';
	import { homePanels } from '$lib/data/typefaces';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { WORDMARK_LETTERS } from '$lib/data/wordmark';
	import { onScroll } from '$lib/scroll';
	import { onMount } from 'svelte';

	// Top page (2026-10 Apres Guerre redesign, Figma "II-ii"):
	//   opening + typeface heroes (HomeTop)  →  Custom (zoom)  →  Custom copy
	//   →  About  →  Contact  →  Footer

	// homeIntro is a module singleton, so an in-app navigation BACK to '/'
	// would otherwise still read last visit's `true` — arming the snap
	// mid-opening, the exact thing introComplete exists to prevent. HomeTop
	// sets it again once this visit's opening is done.
	if (browser) homeIntro.introComplete = false;

	const panels = homePanels();

	// The Custom section's pile: the P of the wordmark, and only the P
	// (2026-11-25, at the user's request — "テキストスタックはTではなくPにして";
	// it was the T from 2026-11-11, and the old wordmark's A, P, G and R before),
	// as its outline at the wordmark's own proportions.
	//
	// Sized off the screen rather than fixed px (2026-10, "それぞれの文字もっと
	// 大きくして"): letter height is a share of the viewport height on PC, of
	// its width on phones (where height would make them too wide to tumble).
	const PILE_LETTER = WORDMARK_LETTERS.find((l) => l.char === 'P')!;
	const PILE_HEIGHT_OF_VH = 0.4;
	const PILE_HEIGHT_OF_VW_SMALL = 0.5;
	const SMALL_SCREEN = 768;
	// Measured off the P's outline (viewBox units) — measure again if the logo
	// artwork changes. Its ink runs from y0 to y1; the core, what the zoom
	// dives into, is the largest circle inside the ink: where the stem meets
	// the foot of the bowl.
	const PILE_Y0 = 0.15;
	const PILE_Y1 = 112.23;
	const PILE_CORE = { x: 9.94, y: 58.45, r: 9.94 };

	function pileShapes() {
		const target =
			window.innerWidth < SMALL_SCREEN
				? window.innerWidth * PILE_HEIGHT_OF_VW_SMALL
				: window.innerHeight * PILE_HEIGHT_OF_VH;
		const scale = target / (PILE_Y1 - PILE_Y0);
		return [
			{
				d: PILE_LETTER.d,
				ox: PILE_LETTER.x0,
				oy: PILE_Y0,
				w: (PILE_LETTER.x1 - PILE_LETTER.x0) * scale,
				h: (PILE_Y1 - PILE_Y0) * scale,
				scale,
				core: PILE_CORE
			}
		];
	}

	// ── Custom: scroll zooms into the pile ─────────────────────────────────
	// (2026-10, at the user's request — "スクロールしていくと下に行かずに、どん
	// どんZoomしていってほしい…Zoomしてまた別のセクションになる"). The section
	// is a tall track with the glyph field pinned (sticky) inside it; scrolling
	// through the track zooms the field in (GlyphFill's `zoom`) instead of
	// moving it, until one letter's own stroke fills the screen with the brand
	// blue — which is the ground of the next section, so the zoom lands in it.
	let customTrackEl: HTMLElement | undefined = $state();
	let customStageEl: HTMLElement | undefined = $state();
	/** 0 when the stage pins, 1 when it lets go. */
	let customZoom = $state(0);

	onMount(() => {
		if (!customTrackEl || !customStageEl) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const track = customTrackEl;
		const stage = customStageEl;
		// Layout offsets, so nothing transformed (the heroes' entrance) skews it.
		const docTop = (el: HTMLElement) => {
			let y = 0;
			for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
				y += n.offsetTop;
			}
			return y;
		};
		const update = () => {
			const span = track.offsetHeight - stage.offsetHeight;
			const p = span > 0 ? (window.scrollY - docTop(track)) / span : 0;
			customZoom = Math.min(1, Math.max(0, p));
		};
		update();
		const off = onScroll(update);
		window.addEventListener('resize', update, { passive: true });
		return () => {
			off();
			window.removeEventListener('resize', update);
		};
	});

	// The section-to-section snap (one gesture → one full step, top → each
	// typeface hero → Custom) was removed 2026-11-11, at the user's request —
	// "100vhスナップがまだ残ってる" — now the heroes are a /fonts row tall: the
	// page scrolls freely.
</script>

<svelte:head>
	<title>PLEASANT — PF Humorist</title>
	<meta
		name="description"
		content="PLEASANT — an independent type foundry. PF Humorist, a nine-weight geometric humanist variable typeface, in development."
	/>
</svelte:head>

<!-- Since 2026-11-11 (at the user's request — "Fontsのデザインからスタック
     アニメーション > Footerのみのシンプルな構成に"): the typeface heroes, the
     pile of Ts, then the footer. The Custom copy, About and Contact sections
     that followed the pile were removed. -->
<main class="Home">
	<!-- 1. Opening, then the typeface heroes (see HomeTop.svelte). -->
	<HomeTop {panels} />

	<!-- 2. Custom type for business — a full-screen field of the wordmark's
	     own T raining down and packing the screen (GlyphFill, in `shapes`
	     mode; without that prop it pours the typeset version), pinned while
	     scrolling zooms into it (see "Custom: scroll zooms into the pile"). -->
	<section class="Home__custom" id="custom" bind:this={customTrackEl}>
		<div class="Custom__stage" bind:this={customStageEl}>
			<GlyphFill shapes={pileShapes} color="var(--black)" zoom={customZoom} />
		</div>
	</section>

	<!-- 2b. Where the zoom lands: the same black the stroke filled the screen
	     with. Carries the Custom copy that used to sit in a white card over
	     the field (2026-10, at the user's request, the card is gone from the
	     field — "白背景・テキストエリア削除"). -->
	<section class="Home__customCopy" aria-labelledby="custom-heading">
		<div class="Custom__inner">
			<p class="Custom__eyebrow">Bespoke</p>
			<!-- Spans, not <br>: they stay inline on desktop and become the three
			     designed lines on phones. -->
			<h2 class="Custom__heading" id="custom-heading">
				<span>Custom Type</span> <span>for Corporate</span> <span>Identity</span>
			</h2>
			<p class="Custom__body">
				Beyond our retail library, PLEASANT designs bespoke typefaces for brands and
				institutions — a proprietary voice, drawn from the first sketch to a fully realised family.
				A custom typeface is the most enduring asset a brand can own: it travels across every
				screen, surface, and language while remaining unmistakably yours.
			</p>
			<a class="Custom__cta" href="/custom">Explore custom type</a>
		</div>
	</section>
</main>

<style>
	.Home {
		/* One display size shared by every section title. Bounded by viewport
		   HEIGHT as well as width, so a long statement still wraps inside its
		   own screen on a short laptop instead of pushing the section taller. */
		--display-fs: clamp(40px, min(7vw, 9.5vh), 88px);
	}

	/* --- 2. Custom type for business (glyph field) --- */
	/* A tall track: one screen for the pinned stage plus --zoom-span of
	   scroll that drives the zoom. No overflow clipping here — a clipping
	   ancestor is exactly what kills position:sticky. */
	.Home__custom {
		--zoom-span: 180vh;
		position: relative;
		height: calc(100vh + var(--zoom-span));
		height: calc(100lvh + var(--zoom-span));
		background: #ffffff;
		/* Full-bleed: base.css's global `section { padding-inline }` would
		   otherwise inset the canvas from both edges. */
		padding: 0;
	}

	.Custom__stage {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100lvh;
		overflow: hidden;
		background: #ffffff;
	}

	@media (max-width: 767.98px) {
		.Home__custom {
			--zoom-span: 150vh;
		}
	}

	/* No zoom without motion: just the one screen of the field. */
	@media (prefers-reduced-motion: reduce) {
		.Home__custom {
			--zoom-span: 0px;
		}
	}
	/* --- 2b. Where the zoom lands --- */
	.Home__customCopy {
		min-height: 100vh;
		min-height: 100lvh;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Black since 2026-11-11, like the Ts the zoom dives into. */
		background: var(--black);
		padding-block: clamp(96px, 12vh, 140px);
		text-align: center;
	}

	/* base.css re-asserts a colour on each text element individually. */
	.Home__customCopy :global(*) {
		color: var(--brand-paper);
	}

	.Custom__inner {
		max-width: 760px;
	}

	.Custom__eyebrow {
		font-family: var(--font-en), sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.7;
		margin: 0 0 20px;
	}

	.Custom__heading {
		font-family: var(--font-en), sans-serif;
		font-size: clamp(36px, min(6vw, 8vh), 80px);
		line-height: 1.02;
		/* Capitals again since 2026-11-11 (at the user's request — "タイトルは
		   uppercaseで表示"); the copy itself stays in title case. */
		text-transform: uppercase;
		letter-spacing: 0.025em;
		margin: 0 0 28px;
	}

	/* Phones: break to the designed three lines instead of wrapping freely. */
	@media (max-width: 767.98px) {
		.Custom__heading span {
			display: block;
		}
	}

	.Custom__body {
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		/* Centred, not justified (2026-09, at the user's request —
		   "Custom文章justifyからcenterへ"). */
		text-align: center;
		max-width: 56ch;
		margin: 0 auto 32px;
	}

	/* Solid, square-cornered box link (2026-09, at the user's request —
	   "Top AboutとCustomセクションのボタンもContact同様ボックスリンクに変更")
	   — replaces the Arrow.svelte + text pattern. Black on white (2026-10-31,
	   the white / blue / black palette; it was blue on the brand orange, and
	   white on the signal red before that). */
	.Home__customCopy .Custom__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 16px 32px;
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		color: #000000;
		background: #ffffff;
		border: 0;
		border-radius: 0;
		text-decoration: none;
		transition: opacity 0.15s ease;
	}

	.Custom__cta:hover {
		opacity: 0.8;
	}
</style>
