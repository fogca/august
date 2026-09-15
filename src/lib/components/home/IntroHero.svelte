<!-- Home page entrance animation — Figma nodes 1:635 -> 1:654 (PC) and
     7:782 -> 7:874 (SP), file UEy0lKKtgP8jN4x2DWZUOB. Sequence: nothing ->
     the five letters of the "ŌGAST" wordmark stagger in from below, small
     and spread the full width of the stage (like a space-between row) ->
     each letter grows in place, anchored to its own baseline, until the
     row closes up into the large resting wordmark, while the stage
     crossfades dark->light and the letters off-white->black -> the Header
     reveals from above on that same beat (see homeIntro.svelte.ts).

     ONE set of paths (the large wordmark, Figma node 1:655) is used for
     both states — the small state is the same five glyphs scaled down, per
     letter, not a second asset crossfaded in. The per-letter small-state
     transform comes straight from the two Figma frames' own measured letter
     boxes (get_metadata on 1:635 and 1:654): both groups sit at x=20 with
     their bottoms at ~880 in the 1440x900 frame, the letters scale by a
     uniform 0.3825, and only the horizontal offset differs per letter —
     the small row is spread across the same 1400px the large row fills, so
     growing closes the gaps. Scaling is about each letter's own bottom-left
     (GSAP's transformOrigin is bbox-relative for SVG), so each glyph rises
     from its baseline as it grows; tx/ty below are the residual translate
     from that anchored scale to the measured small box, in viewBox units.

     An earlier version derived these same numbers but applied them as if
     the scale were about the viewBox origin rather than the letter's own
     box — right for O (at x=0), increasingly wrong to the right, pushing S
     and T off the canvas. That's the "only OGA showed" bug; the numbers
     here are computed against the anchor GSAP actually uses.

     Figma delivered NO Smart-Animate/prototype timing data on either frame
     (get_motion_context — empty), so the timing/easing here is this file's
     own. The wordmark uses a macron (Ō) while the site's running text
     settled on the circumflex "Ôgast" — kept as drawn (bespoke logotype art,
     not running text), flagged rather than reconciled either way. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { homeIntro } from '$lib/state/homeIntro.svelte';

	type Letter = {
		id: string;
		d: string;
		/** Residual translate (viewBox units) from the bottom-left-anchored
		 *  0.3825x scale to the measured small-state box — see header. */
		tx: number;
		ty: number;
	};

	/** Uniform across all five letters (measured 0.38249–0.38253). */
	const SMALL_SCALE = 0.3825;
	/** Extra drop below the small resting position for the stagger-in. */
	const RISE = 26;

	// Left-to-right reading order: Ō, G, A, S, T. Latest Figma export.
	const LETTERS: Letter[] = [
		{
			id: 'O',
			d: 'M0 215.153C0 124.553 60.5539 56.7302 148.863 56.7302C231.717 56.7302 297.726 120.465 297.726 215.153C297.726 309.84 244.012 380.86 148.863 380.86C60.0924 380.86 0 317.587 0 215.153ZM265.01 246.138C282.448 181.052 253.225 100.176 185.502 82.0296C120.416 64.5919 53.0877 115.356 34.5952 184.398C12.9217 265.307 46.2642 337.876 112.224 355.544C183.013 374.515 245.463 319.136 265.026 246.138H265.01ZM217.262 6.46084L80.4639 14.8995V0H217.262V6.46084Z',
			tx: 0,
			ty: 3.81
		},
		{
			id: 'G',
			d: 'M572.065 362.318V363.224C549.765 373.69 518.812 380.53 493.315 380.53C393.634 380.53 333.08 313.614 333.08 222.569C333.08 131.524 398.628 59.6143 493.315 59.6143C526.542 59.6143 563.412 71.0031 586.635 84.65V116.971C567.055 101.033 520.625 84.65 487.398 84.65C421.389 84.65 360.39 140.177 360.39 220.295C360.39 291.298 418.653 355.94 487.398 355.94C516.538 355.94 548.397 347.748 572.065 333.64V242.595H486.492L468.279 217.097H602.111V385.524L572.065 362.318Z',
			tx: 13.12,
			ty: 0.93
		},
		{
			id: 'A',
			d: 'M759.161 86.9084L740.043 59.5981H791.482L920.765 378.24H891.625L842.922 255.797H725.934L678.599 378.24H649.459L759.161 86.9084ZM832.901 230.761L780.555 100.572L733.664 230.761H832.901Z',
			tx: 31.23,
			ty: 5.42
		},
		{
			id: 'S',
			d: 'M1035.97 378.701C1010.93 378.701 981.347 369.142 956.756 360.489L950.84 320.438C978.15 340.019 1009.56 352.759 1045.97 352.759C1075.56 352.759 1107.43 335.008 1107.43 304.055C1107.43 267.647 1064.18 242.595 1046.9 230.316C1000.47 202.099 961.322 182.058 961.322 136.09C961.322 84.6505 1004.11 59.1532 1056.92 59.1532C1073.3 59.1532 1098.8 65.0701 1111.09 71.8936C1117.47 74.6296 1120.19 76.904 1123.83 77.8105V111.944C1108.82 96.9293 1079.22 82.3595 1052.83 82.3595C1009.58 82.3595 988.187 108.763 988.187 133.799C988.187 158.835 1019.6 183.409 1066.48 213.917C1094.69 229.393 1136.13 263.527 1136.13 302.687C1136.13 361.412 1087.87 378.701 1035.98 378.701H1035.97Z',
			tx: 59.97,
			ty: 5.14
		},
		{
			id: 'T',
			d: 'M1260.71 82.8205H1156.47V60.0592H1400L1384.99 82.8205H1288.02V378.701H1260.71V82.8205Z',
			tx: 151.38,
			ty: 5.14
		}
	];

	let letterEls: SVGPathElement[] = [];
	let stageEl: HTMLElement | undefined = $state();

	onMount(() => {
		if (!browser) return;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			// Straight to the resting state — same convention as
			// PageTransition.svelte and the home page's video pause. Inline
			// style, not setAttribute: a presentation attribute would lose to
			// this file's own CSS fill fallback.
			if (stageEl) stageEl.style.backgroundColor = '#F1F0EF';
			letterEls.forEach((el) => {
				el.style.fill = '#000000';
			});
			homeIntro.headerReady = true;
			return;
		}

		let cancelled = false;
		let tl: { kill: () => void } | undefined;
		import('gsap').then(({ gsap }) => {
			if (cancelled || !stageEl) return;

			// Small, spread, sitting just below its resting line, invisible.
			gsap.set(letterEls, {
				transformOrigin: '0% 100%',
				scale: SMALL_SCALE,
				x: (i: number) => LETTERS[i].tx,
				y: (i: number) => LETTERS[i].ty + RISE,
				opacity: 0,
				fill: '#F1F0EF'
			});

			const timeline = gsap.timeline({
				delay: 0.25,
				onComplete: () => {
					homeIntro.headerReady = true;
				}
			});
			tl = timeline;
			// Dev-only handle so the intro can be paused/seeked from devtools or
			// a Playwright run (page load alone reliably outlasts the ~2.5s
			// intro, so there's no other way to inspect a mid-animation frame).
			// Stripped from production builds by Vite.
			if (import.meta.env.DEV) {
				(window as unknown as { __ogastIntro?: typeof timeline }).__ogastIntro = timeline;
			}

			// 1 — stagger in from below, left to right, still small.
			timeline.to(letterEls, {
				opacity: 1,
				y: (i: number) => LETTERS[i].ty,
				duration: 0.6,
				ease: 'power3.out',
				stagger: 0.09
			});

			// 2 — grow from the baseline into the large resting wordmark; the
			// row closes up as each letter's own width fills the gap beside
			// it. Stage and fill crossfade over the same beat.
			timeline.to(
				letterEls,
				{
					scale: 1,
					x: 0,
					y: 0,
					fill: '#000000',
					duration: 1.3,
					ease: 'expo.inOut'
				},
				'+=0.25'
			);
			timeline.to(
				stageEl,
				{ backgroundColor: '#F1F0EF', duration: 1.3, ease: 'power2.inOut' },
				'<'
			);

			// 3 — Header slides in from above during the tail of the grow, so
			// it reads as the same beat rather than a separate later step.
			timeline.call(
				() => {
					homeIntro.headerReady = true;
				},
				[],
				'-=0.55'
			);
		});

		return () => {
			cancelled = true;
			tl?.kill();
		};
	});
</script>

<section class="IntroHero" bind:this={stageEl} aria-label="Ôgast">
	<svg
		class="IntroHero__wordmark"
		viewBox="0 0 1400 385.524"
		preserveAspectRatio="xMidYMax meet"
		xmlns="http://www.w3.org/2000/svg"
	>
		{#each LETTERS as letter, i (letter.id)}
			<path bind:this={letterEls[i]} d={letter.d} />
		{/each}
	</svg>
</section>

<style>
	.IntroHero {
		height: 100vh;
		height: 100dvh;
		display: grid;
		place-items: end center;
		background: #1f1b1a;
		padding-inline: 20px;
		padding-bottom: 20px;
		overflow: hidden;
	}

	.IntroHero__wordmark {
		display: block;
		width: 100%;
		max-width: 1400px;
		height: auto;
		/* The animated transforms move letters outside the viewBox for a
		   frame or two at the extremes of the rise — don't let the SVG's own
		   default overflow:hidden clip them. */
		overflow: visible;
	}

	.IntroHero__wordmark path {
		/* No-JS/pre-hydration fallback: SVG's default fill is black, invisible
		   on this dark stage. gsap.set() overrides this the instant the script
		   runs; without JS the wordmark stays legible at its resting size. */
		fill: #f1f0ef;
		will-change: transform, opacity, fill;
	}

	/* SP: the same composition spun vertical to read top-to-bottom, pinned
	   to the left edge (Figma 7:782/7:874). Sized via container-query units
	   so the rotated box's on-screen width/height come from the UN-rotated
	   container's height/width respectively. */
	@media (max-width: 767.98px) {
		.IntroHero {
			place-items: center start;
			padding-inline: 0;
			padding-bottom: 0;
			container-type: size;
		}

		.IntroHero__wordmark {
			width: 82cqh;
			max-width: none;
			height: 82cqw;
			transform: rotate(90deg);
			margin-left: 6vw;
		}
	}
</style>
