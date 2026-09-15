<!-- Home page entrance animation — Figma nodes 1:635 -> 1:654 (PC) and
     7:782 -> 7:874 (SP), file UEy0lKKtgP8jN4x2DWZUOB. Sequence: nothing ->
     the "ŌGAST" wordmark's 5 letters stagger in from below, small, at the
     bottom of a dark stage -> each letter grows in place (bottom-anchored)
     into its large resting position while the stage crossfades dark->light
     and the letters crossfade off-white->black -> the Header reveals from
     above at that same beat (see homeIntro.svelte.ts).

     The 5 letters (Ō G A S T) are Figma's own exported vector paths (file
     UEy0lKKtgP8jN4x2DWZUOB, node 1:655's children) — not hand-redrawn, no
     live font exists for this bespoke logotype. Figma delivered NO
     Smart-Animate/prototype timing data on either frame (confirmed via
     get_motion_context — empty), so the small->large relationship was
     derived from comparing both frames' own measured per-letter bounding
     boxes: scale and the *vertical* translate are uniform across all 5
     letters (~0.3825x, translateY ~239 in this viewBox's own units) while
     only the *horizontal* translate differs per letter — consistent with a
     row that grows bottom-anchored and lets each letter's own width eat
     into the gaps beside it as the row redistributes, rather than each
     letter scaling from its own center or the row widening. Every letter
     therefore animates the SAME translate+scale shape, just different X.

     The Figma wordmark itself uses a macron (Ō) — the Header/Footer's own
     plain-text "Ôgast" settled on a circumflex earlier this session. Kept
     as drawn here (this is bespoke logotype art, not the site's running
     text), not reconciled sitewide — flagged for the user rather than
     silently changed either way.

     Figma's end-state frame (1:654) also shows an "Account / Cart (0)"
     nav pairing that has no backing feature anywhere in this codebase (no
     accounts, no persistent cart — /buy is a direct Stripe checkout).
     Rather than ship dead UI, the header keeps using its own real,
     existing nav (unchanged) instead of reproducing that pairing. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { homeIntro } from '$lib/state/homeIntro.svelte';

	type Letter = {
		id: string;
		d: string;
		/** Large/resting-state scale (always 1) and small-state starting
		 *  scale+translate, in the 1400x385.524 viewBox's own units — see
		 *  the file header comment for how these were derived. */
		smallScale: number;
		smallTx: number;
		smallTy: number;
	};

	// Left-to-right reading order: Ō, G, A, S, T. Path data is Figma's own
	// exported geometry (node 1:655's children) — see the file header note.
	const LETTERS: Letter[] = [
		{
			id: 'O',
			d: 'M217.262 6.46084L80.4639 14.8995V0H217.262V6.46084Z M0 215.153C0 124.553 60.5539 56.7302 148.863 56.7302C231.717 56.7302 297.726 120.465 297.726 215.153C297.726 309.84 244.012 380.86 148.863 380.86C60.0924 380.86 0 317.587 0 215.153ZM265.01 246.138C282.448 181.052 253.225 100.176 185.502 82.0296C120.416 64.5919 53.0877 115.356 34.5952 184.398C12.9217 265.307 46.2642 337.876 112.224 355.544C183.013 374.515 245.463 319.136 265.026 246.138H265.01Z',
			smallScale: 0.3825,
			smallTx: 0,
			smallTy: 239
		},
		{
			id: 'G',
			d: 'M572.065 362.318V363.224C549.765 373.69 518.812 380.53 493.315 380.53C393.634 380.53 333.08 313.614 333.08 222.569C333.08 131.524 398.628 59.6143 493.315 59.6143C526.542 59.6143 563.412 71.0032 586.635 84.6501V116.971C567.055 101.033 520.625 84.6501 487.398 84.6501C421.389 84.6501 360.39 140.177 360.39 220.295C360.39 291.298 418.653 355.94 487.398 355.94C516.538 355.94 548.397 347.748 572.065 333.64V242.595H486.492L468.279 217.097H602.111V385.524L572.065 362.318Z',
			smallScale: 0.3825,
			smallTx: 218.8,
			smallTy: 239.0
		},
		{
			id: 'A',
			d: 'M759.161 86.9084L740.043 59.5981H791.482L920.765 378.24H891.625L842.922 255.797H725.934L678.599 378.24H649.459L759.161 86.9084ZM832.901 230.761L780.555 100.572L733.664 230.761H832.901Z',
			smallScale: 0.3824,
			smallTx: 432.3,
			smallTy: 239.0
		},
		{
			id: 'S',
			d: 'M1035.97 378.701C1010.93 378.701 981.347 369.142 956.756 360.489L950.84 320.438C978.15 340.019 1009.56 352.759 1045.97 352.759C1075.56 352.759 1107.43 335.008 1107.43 304.055C1107.43 267.647 1064.18 242.595 1046.9 230.316C1000.47 202.099 961.322 182.058 961.322 136.09C961.322 84.6505 1004.11 59.1532 1056.92 59.1532C1073.3 59.1532 1098.8 65.0701 1111.09 71.8936C1117.47 74.6296 1120.19 76.904 1123.83 77.8105V111.944C1108.82 96.9293 1079.22 82.3595 1052.83 82.3595C1009.58 82.3595 988.187 108.763 988.187 133.799C988.187 158.835 1019.6 183.409 1066.48 213.917C1094.69 229.393 1136.13 263.527 1136.13 302.687C1136.13 361.412 1087.87 378.701 1035.98 378.701H1035.97Z',
			smallScale: 0.3824,
			smallTx: 647.2,
			smallTy: 239.0
		},
		{
			id: 'T',
			d: 'M1260.71 82.8205H1156.47V60.0592H1400L1384.99 82.8205H1288.02V378.701H1260.71V82.8205Z',
			smallScale: 0.3825,
			smallTx: 865.45,
			smallTy: 239.0
		}
	];

	let letterEls: SVGPathElement[] = [];
	let stageEl: HTMLElement | undefined = $state();

	onMount(() => {
		if (!browser) return;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			// Skip straight to the resting (large, light) state — same
			// convention as PageTransition.svelte and the Home hero video.
			if (stageEl) stageEl.style.backgroundColor = '#F1F0EF';
			// An inline style, not setAttribute — a plain SVG presentation
			// attribute loses to this file's own CSS fill:#f1f0ef fallback
			// rule (CSS beats presentation attributes regardless of when the
			// attribute is set), so setAttribute here would silently no-op.
			letterEls.forEach((el) => {
				el.style.fill = '#000000';
			});
			homeIntro.headerReady = true;
			return;
		}

		let cancelled = false;
		import('gsap').then(({ gsap }) => {
			if (cancelled || !stageEl) return;

			// Small-state starting point: opacity 0 and an extra 24-unit
			// offset below each letter's small resting Y, so the stagger-in
			// reads as sliding up from below rather than a plain fade.
			gsap.set(letterEls, {
				x: (i: number) => LETTERS[i].smallTx,
				y: (i: number) => LETTERS[i].smallTy + 24,
				scaleX: (i: number) => LETTERS[i].smallScale,
				scaleY: (i: number) => LETTERS[i].smallScale,
				transformOrigin: '0 0',
				opacity: 0,
				fill: '#F1F0EF'
			});

			const tl = gsap.timeline({
				delay: 0.2,
				onComplete: () => {
					homeIntro.headerReady = true;
				}
			});

			// 1 — stagger in from below, small, left to right.
			tl.to(letterEls, {
				opacity: 1,
				y: (i: number) => LETTERS[i].smallTy,
				duration: 0.55,
				ease: 'power3.out',
				stagger: 0.08
			});

			// 2 — grow in place (bottom-anchored) to the resting size/position,
			// crossfading the stage dark->light and the letters white->black
			// at the same time.
			tl.to(
				letterEls,
				{
					x: 0,
					y: 0,
					scaleX: 1,
					scaleY: 1,
					fill: '#000000',
					duration: 1.15,
					ease: 'expo.inOut'
				},
				'+=0.2'
			);
			tl.to(stageEl, { backgroundColor: '#F1F0EF', duration: 1.15, ease: 'power2.inOut' }, '<');

			// 3 — Header slides in from above, timed into the tail of the
			// grow so it reads as one continuous beat rather than a separate
			// later step.
			tl.call(
				() => {
					homeIntro.headerReady = true;
				},
				[],
				'-=0.5'
			);
		});

		return () => {
			cancelled = true;
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
		display: flex;
		align-items: flex-end;
		justify-content: center;
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
	}

	.IntroHero__wordmark path {
		/* No-JS/pre-hydration fallback: SVG's own default fill is black,
		   which would be invisible against this section's dark background.
		   gsap.set() overrides this the instant the animation script runs;
		   without JS at all, this keeps the wordmark legible (static, at
		   its natural large size) instead of vanishing into the background. */
		fill: #f1f0ef;
		will-change: transform, opacity, fill;
	}

	/* SP: the wordmark rotates 90° to read top-to-bottom, matching Figma's
	   own SP frames (7:782/7:874) — same letters/paths, same small->large
	   per-letter transform, just the whole composition spun vertical and
	   pinned to the left edge instead of centered along the bottom. Sized
	   via container-query units so the rotated box's on-screen width/height
	   come from the UN-rotated container's height/width respectively. */
	@media (max-width: 767.98px) {
		.IntroHero {
			align-items: center;
			justify-content: flex-start;
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
