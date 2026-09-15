<!-- Home page entrance animation — Figma nodes 1:635 -> 1:654 (PC) and
     7:782 -> 7:874 (SP), file UEy0lKKtgP8jN4x2DWZUOB. Sequence: nothing ->
     the "ŌGAST" wordmark's 5 letters stagger in from below, small, at the
     bottom of a dark stage -> the small wordmark crossfades into the large
     resting wordmark while the stage crossfades dark->light and the large
     letters crossfade off-white->black -> the Header reveals from above at
     that same beat (see homeIntro.svelte.ts).

     Two INDEPENDENT sets of Figma-exported vector paths are used — a small
     wordmark (viewBox 0 0 1401 148) and a large one (0 0 1400 385.524) —
     not one set scaled into the other. Figma delivered these as two
     separately-drawn assets (confirmed non-affinely-related: comparing
     both frames' bounding boxes does not yield one consistent per-letter
     scale+translate), so an earlier version of this file tried to derive a
     per-letter scale/translate mapping from the LARGE paths alone to fake
     the small state. That math was wrong for the widest letters (S and T
     stayed off-canvas at the small stage — only "OGA" ever appeared,
     reported by the user), and even where the numbers were close, it was
     always going to be an approximation. Now that the real small-state
     paths are available, the small stage renders them directly (no scale
     math at all — just opacity/position on paths already at the right
     size) and the "grow" is a crossfade + subtle scale between the two
     real assets, not a per-letter interpolation between them.

     The 10 paths (5 small + 5 large) are Figma's own exported vector
     geometry — not hand-redrawn, no live font exists for this bespoke
     logotype. Figma delivered NO Smart-Animate/prototype timing data on
     either frame (confirmed via get_motion_context — empty), so the
     crossfade timing here is this file's own, not Figma's.

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

	type Letter = { id: string; d: string };

	// Left-to-right reading order: Ō, G, A, S, T. Small wordmark — its own
	// real artwork (viewBox 0 0 1401 148), not a scaled copy of the large one.
	const SMALL_LETTERS: Letter[] = [
		{
			id: 'O',
			d: 'M0 82.2909C0 47.6384 23.1605 21.698 56.9367 21.698C88.6263 21.698 113.873 46.0751 113.873 82.2909C113.873 118.507 93.329 145.67 56.9367 145.67C22.984 145.67 0 121.47 0 82.2909ZM101.36 94.1422C108.03 69.2482 96.8529 38.315 70.9502 31.3744C46.0562 24.7049 20.3048 44.1209 13.2319 70.5279C4.94224 101.474 17.695 129.23 42.9231 135.987C69.9983 143.243 93.8837 122.062 101.366 94.1422H101.36ZM83.0978 2.47112L30.7756 5.69871V0H83.0978V2.47112Z'
		},
		{
			id: 'G',
			d: 'M437.603 138.578V138.925C429.074 142.928 417.235 145.544 407.483 145.544C369.357 145.544 346.197 119.95 346.197 85.1276C346.197 50.305 371.267 22.8011 407.483 22.8011C420.192 22.8011 434.293 27.1571 443.175 32.3767V44.7387C435.686 38.6428 417.928 32.3767 405.22 32.3767C379.973 32.3767 356.642 53.6145 356.642 84.2577C356.642 111.415 378.926 136.139 405.22 136.139C416.365 136.139 428.55 133.006 437.603 127.61V92.7869H404.873L397.907 83.0348H449.095V147.454L437.603 138.578Z'
		},
		{
			id: 'A',
			d: 'M722.652 33.2405L715.339 22.7949H735.013L784.461 144.668H773.316L754.688 97.8364H709.943L691.838 144.668H680.693L722.652 33.2405ZM750.855 88.2608L730.834 38.4664L712.899 88.2608H750.855Z'
		},
		{
			id: 'S',
			d: 'M1043.37 144.844C1033.79 144.844 1022.48 141.188 1013.07 137.879L1010.81 122.56C1021.25 130.049 1033.27 134.922 1047.19 134.922C1058.51 134.922 1070.7 128.133 1070.7 116.294C1070.7 102.369 1054.16 92.787 1047.55 88.0906C1029.79 77.2983 1014.82 69.6328 1014.82 52.0513C1014.82 32.3769 1031.18 22.6248 1051.38 22.6248C1057.65 22.6248 1067.4 24.8879 1072.1 27.4977C1074.54 28.5441 1075.58 29.414 1076.97 29.7608V42.8161C1071.23 37.0733 1059.91 31.5006 1049.82 31.5006C1033.28 31.5006 1025.09 41.5994 1025.09 51.175C1025.09 60.7506 1037.11 70.1497 1055.04 81.8182C1065.83 87.7376 1081.68 100.793 1081.68 115.771C1081.68 138.232 1063.22 144.844 1043.37 144.844H1043.37Z'
		},
		{
			id: 'T',
			d: 'M1347.73 31.677H1307.85V22.9713H1401L1395.26 31.677H1358.17V144.844H1347.73V31.677Z'
		}
	];

	// Large (resting) wordmark — latest export from Figma (2026-09,
	// viewBox 0 0 1400 386), at the user's request.
	const LARGE_LETTERS: Letter[] = [
		{
			id: 'O',
			d: 'M0 215.153C0 124.553 60.5539 56.7302 148.863 56.7302C231.717 56.7302 297.726 120.465 297.726 215.153C297.726 309.84 244.012 380.86 148.863 380.86C60.0924 380.86 0 317.587 0 215.153ZM265.01 246.138C282.448 181.052 253.225 100.176 185.502 82.0296C120.416 64.5919 53.0877 115.356 34.5952 184.398C12.9217 265.307 46.2642 337.876 112.224 355.544C183.013 374.515 245.463 319.136 265.026 246.138H265.01ZM217.262 6.46084L80.4639 14.8995V0H217.262V6.46084Z'
		},
		{
			id: 'G',
			d: 'M572.065 362.318V363.224C549.765 373.69 518.812 380.53 493.315 380.53C393.634 380.53 333.08 313.614 333.08 222.569C333.08 131.524 398.628 59.6143 493.315 59.6143C526.542 59.6143 563.412 71.0031 586.635 84.65V116.971C567.055 101.033 520.625 84.65 487.398 84.65C421.389 84.65 360.39 140.177 360.39 220.295C360.39 291.298 418.653 355.94 487.398 355.94C516.538 355.94 548.397 347.748 572.065 333.64V242.595H486.492L468.279 217.097H602.111V385.524L572.065 362.318Z'
		},
		{
			id: 'A',
			d: 'M759.161 86.9084L740.043 59.5981H791.482L920.765 378.24H891.625L842.922 255.797H725.934L678.599 378.24H649.459L759.161 86.9084ZM832.901 230.761L780.555 100.572L733.664 230.761H832.901Z'
		},
		{
			id: 'S',
			d: 'M1035.97 378.701C1010.93 378.701 981.347 369.142 956.756 360.489L950.84 320.438C978.15 340.019 1009.56 352.759 1045.97 352.759C1075.56 352.759 1107.43 335.008 1107.43 304.055C1107.43 267.647 1064.18 242.595 1046.9 230.316C1000.47 202.099 961.322 182.058 961.322 136.09C961.322 84.6505 1004.11 59.1532 1056.92 59.1532C1073.3 59.1532 1098.8 65.0701 1111.09 71.8936C1117.47 74.6296 1120.19 76.904 1123.83 77.8105V111.944C1108.82 96.9293 1079.22 82.3595 1052.83 82.3595C1009.58 82.3595 988.187 108.763 988.187 133.799C988.187 158.835 1019.6 183.409 1066.48 213.917C1094.69 229.393 1136.13 263.527 1136.13 302.687C1136.13 361.412 1087.87 378.701 1035.98 378.701H1035.97Z'
		},
		{
			id: 'T',
			d: 'M1260.71 82.8205H1156.47V60.0592H1400L1384.99 82.8205H1288.02V378.701H1260.71V82.8205Z'
		}
	];

	let smallLetterEls: SVGPathElement[] = [];
	let smallSvgEl: SVGSVGElement | undefined = $state();
	let smallGroupEl: SVGGElement | undefined = $state();
	let largeLetterEls: SVGPathElement[] = [];
	let largeGroupEl: SVGGElement | undefined = $state();
	let stageEl: HTMLElement | undefined = $state();

	onMount(() => {
		if (!browser) return;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			// Skip straight to the resting (large, light) state — same
			// convention as PageTransition.svelte and the Home hero video.
			if (stageEl) stageEl.style.backgroundColor = '#F1F0EF';
			if (smallGroupEl) smallGroupEl.style.opacity = '0';
			// An inline style, not setAttribute — a plain SVG presentation
			// attribute loses to this file's own CSS fill:#f1f0ef fallback
			// rule (CSS beats presentation attributes regardless of when the
			// attribute is set), so setAttribute here would silently no-op.
			largeLetterEls.forEach((el) => {
				el.style.fill = '#000000';
				el.style.opacity = '1';
			});
			homeIntro.headerReady = true;
			return;
		}

		let cancelled = false;
		import('gsap').then(({ gsap }) => {
			if (cancelled || !stageEl || !smallGroupEl || !largeGroupEl) return;

			// .IntroHero__wordmark--small is opacity:0 in CSS by default (it has
			// no pre-hydration/no-JS role, unlike the large wordmark's own
			// fill:#f1f0ef fallback) — without this, the whole small-state
			// stagger plays invisibly underneath that 0 opacity and the intro
			// silently skips straight to the crossfade, reading as "the
			// animation doesn't run at all" even though every tween below is
			// actually firing correctly.
			if (smallSvgEl) smallSvgEl.style.opacity = '1';

			gsap.set(smallLetterEls, { opacity: 0, y: 24 });
			gsap.set(largeLetterEls, { opacity: 0, fill: '#F1F0EF' });

			const tl = gsap.timeline({
				delay: 0.2,
				onComplete: () => {
					homeIntro.headerReady = true;
				}
			});

			// 1 — small wordmark's letters stagger in from below, left to right.
			tl.to(smallLetterEls, {
				opacity: 1,
				y: 0,
				duration: 0.45,
				ease: 'power3.out',
				stagger: 0.08
			});

			// 2 — crossfade: the small wordmark fades out (with a slight
			// upward scale, so it reads as "growing into" the large one)
			// while the large wordmark fades in and crossfades white->black,
			// and the stage crossfades dark->light, all at once.
			tl.to(
				smallGroupEl,
				{
					opacity: 0,
					scale: 1.15,
					transformOrigin: '50% 100%',
					duration: 0.7,
					ease: 'power2.inOut'
				},
				'+=0.15'
			);
			tl.fromTo(
				largeGroupEl,
				{ scale: 0.94, transformOrigin: '50% 100%' },
				{ scale: 1, duration: 0.9, ease: 'power2.out' },
				'<'
			);
			tl.to(
				largeLetterEls,
				{ opacity: 1, fill: '#000000', duration: 0.9, ease: 'power2.out' },
				'<'
			);
			tl.to(stageEl, { backgroundColor: '#F1F0EF', duration: 0.9, ease: 'power2.inOut' }, '<');

			// 3 — Header slides in from above, timed into the tail of the
			// crossfade so it reads as one continuous beat rather than a
			// separate later step.
			tl.call(
				() => {
					homeIntro.headerReady = true;
				},
				[],
				'-=0.3'
			);
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<section class="IntroHero" bind:this={stageEl} aria-label="Ôgast">
	<svg
		bind:this={smallSvgEl}
		class="IntroHero__wordmark IntroHero__wordmark--small"
		viewBox="0 0 1401 148"
		preserveAspectRatio="xMidYMax meet"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g bind:this={smallGroupEl}>
			{#each SMALL_LETTERS as letter, i (letter.id)}
				<path bind:this={smallLetterEls[i]} d={letter.d} fill="#F1F0EF" />
			{/each}
		</g>
	</svg>
	<svg
		class="IntroHero__wordmark IntroHero__wordmark--large"
		viewBox="0 0 1400 385.524"
		preserveAspectRatio="xMidYMax meet"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g bind:this={largeGroupEl}>
			{#each LARGE_LETTERS as letter, i (letter.id)}
				<path bind:this={largeLetterEls[i]} d={letter.d} />
			{/each}
		</g>
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

	/* Both wordmarks share the same grid cell (stacked, not side by side) —
	   the small one is visible first, then crossfades into the large one. */
	.IntroHero__wordmark {
		grid-column: 1;
		grid-row: 1;
		display: block;
		height: auto;
	}

	.IntroHero__wordmark--small {
		width: min(38vw, 535px);
	}

	.IntroHero__wordmark--large {
		width: 100%;
		max-width: 1400px;
	}

	.IntroHero__wordmark--large path {
		/* No-JS/pre-hydration fallback: SVG's own default fill is black,
		   which would be invisible against this section's dark background.
		   gsap.set() overrides this the instant the animation script runs;
		   without JS at all, this keeps the wordmark legible (static, at
		   its natural large size) instead of vanishing into the background. */
		fill: #f1f0ef;
		will-change: opacity, fill;
	}

	/* Pre-hydration/no-JS: only the large wordmark should show (its own CSS
	   fallback fill above keeps it legible); the small one has no such
	   role once JS isn't there to run its stagger, so hide it up front. */
	.IntroHero__wordmark--small {
		opacity: 0;
	}

	/* SP: both wordmarks rotate 90° to read top-to-bottom, matching Figma's
	   own SP frames (7:782/7:874) — sized via container-query units so the
	   rotated box's on-screen width/height come from the UN-rotated
	   container's height/width respectively. The small one is sized to a
	   fraction of the large one's box (~37%), keeping the same relative
	   scale relationship as the desktop layout above. */
	@media (max-width: 767.98px) {
		.IntroHero {
			place-items: center start;
			padding-inline: 0;
			padding-bottom: 0;
			container-type: size;
		}

		.IntroHero__wordmark--small {
			width: 30cqh;
			height: 30cqw;
		}

		.IntroHero__wordmark--large {
			width: 82cqh;
			max-width: none;
			height: 82cqw;
		}

		.IntroHero__wordmark--small,
		.IntroHero__wordmark--large {
			transform: rotate(90deg);
			margin-left: 6vw;
		}
	}
</style>
