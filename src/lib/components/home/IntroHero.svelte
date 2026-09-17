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
     own — retimed 2026-09 (at the user's request, "もう少し滑らかに、
     そしてゆっくり") to a longer, gentler curve; see the timing constants
     below. The site's running text uses the same macron (Ōgast) as this
     wordmark — unified 2026-09 at the user's request (it had been the
     circumflex "Ô" for a while). Norma carries Ō; Elio doesn't yet, so in
     Elio-set copy that one letter falls back per-glyph to Norma.

     SP layout note: the wordmark is rotated 90deg to read top-to-bottom
     (Figma 7:782/7:874). Rotating an element whose CSS width/height are its
     PRE-rotation dimensions, while positioning it with grid `place-items` +
     a margin, is what caused the "position is off" bug — rotation pivots
     around the box's own centre, and swapping a 692x320-ish box to 320x692
     around a fixed centre shifts both edges asymmetrically, pushing the
     visible glyphs partway off the right edge of the screen (confirmed by
     measuring the post-rotate bounding box: ~140px of it sat outside a
     390px-wide viewport). Fixed by splitting the rotation onto an inner
     element sized with its dimensions swapped, absolutely centred inside an
     outer frame that carries the FINAL (post-rotation) box — see
     .IntroHero__wordmark-frame / __wordmark below.

     The SVG's own preserveAspectRatio was originally xMidYMax — i.e.
     bottom-aligned pre-rotation, which becomes LEFT-aligned once rotated
     (a 90deg turn maps the pre-rotation bottom edge to the post-rotation
     left edge). At rest, the grown wordmark's own em-box (ascender to
     descender) doesn't fill this frame's full width, so that left-alignment
     read as the resting wordmark sitting visibly left of centre (2026-09,
     at the user's own report: "SPでは、ロゴが左に寄ってるが大きくなった時に
     中心に来るように調整して"). xMidYMid centres it instead — measured via
     Playwright, the resting glyph union's centre moved from ~119px to
     ~183px in a 390px viewport (target 195). Harmless on PC: the
     un-rotated SVG there has height:auto, so its box already matches the
     viewBox's own aspect ratio with no slack for either alignment to
     redistribute.

     Scroll lock: the user asked for scrolling to be disabled for the
     duration of the OP ("OP中はスクロール禁止"). lockScroll() below
     preventDefaults wheel/touch/the usual scroll keys and stops Lenis;
     released the instant the entrance timeline completes. Gated on
     actually being at the top of the page at mount (`window.scrollY` ≈
     0) — the user's own flagged edge case: a restored mid-page scroll
     position (SvelteKit's own back-navigation scroll restoration, most
     likely) must never collide with this lock, or a visitor lands
     scrolled partway down with scrolling switched off and no way to move.
     When that's the case, the OP is skipped outright (jump straight to
     the resting state, same as prefers-reduced-motion) rather than risk
     it.

     That mount-time check alone isn't enough (2026-09, at the user's own
     follow-up report: "SPでスクロールバックとかでトップに戻った時スクロー
     ルがOP中で禁止されてる問題") — SvelteKit's scroll restoration on a
     back-navigation to "/" can land AFTER this component has already
     mounted at scrollY 0 and started the (now locked) OP, jumping the
     real window scroll out from under it while Lenis is stopped. Lenis
     drives window.scrollTo itself per rAF from its own internal target,
     so a scroll it didn't originate leaves that internal target stale —
     the page then reads as permanently stuck, because the very next
     gesture animates back toward the stale pre-restoration target instead
     of from where the reader actually is. `watchForExternalScroll` below
     catches exactly that: any scroll appearing during the OP that this
     file didn't itself cause is treated the same as the mount-time guard
     — bail to the resting state and release the lock immediately, then
     resync Lenis's internal position to the real window.scrollY so the
     next gesture starts from the right place instead of snapping back. */

     Section-to-section snap (2026-09, referencing yadohouse.jp's own
     top-page feel at the user's request): once the OP is genuinely done
     (`homeIntro.introComplete` — see homeIntro.svelte.ts), a small scroll
     gesture snaps precisely to the next full-viewport section, all the
     way through the typeface sections, using Lenis's own official Snap
     companion (`lenis/snap`) rather than a hand-rolled gesture detector.
     THIS file only flips the `introComplete` signal at the right moments
     (all three exit paths below do); +page.svelte owns the actual Snap
     instance, since it's the one that knows about every section (this one
     plus each TypefaceSection) to snap between. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { initScroll, getLenis } from '$lib/scroll';
	import { summerColor, summerColorHex } from '$lib/state/summerColor.svelte';

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

	// Timing — retimed 2026-09 for a slower, smoother read (was 0.6/0.09
	// stagger + 1.3s grow, ~2.5s total; this reads closer to ~3.5s).
	/** Each letter's own rise-and-fade-in duration. */
	const STAGGER_DURATION = 0.75;
	/** Delay between one letter starting and the next. */
	const STAGGER_INTERVAL = 0.11;
	/** The small row growing closed into the resting wordmark. */
	const GROW_DURATION = 1.75;
	/** Pause between the stagger finishing and the grow beginning. */
	const GROW_GAP = 0.3;
	/** How much later the stage's own dark->light crossfade starts than the
	 *  letters' own grow — at the user's own request, so the background
	 *  doesn't begin lightening in the exact same instant the grow begins. */
	const BG_DELAY = 0.2;

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

	/** Straight to the resting state — same convention as PageTransition.svelte
	 *  and the home page's video pause. Inline style, not setAttribute: a
	 *  presentation attribute would lose to this file's own CSS fill fallback.
	 *  Shared by the reduced-motion path and the "not actually at the top"
	 *  guard (see the file header's "Scroll lock" note) — both skip the OP
	 *  outright and land here instead, for their own separate reasons; both
	 *  still count as the intro's own business being "done" either way. */
	function jumpToRestingState() {
		if (stageEl) stageEl.style.backgroundColor = '#F1F0EF';
		letterEls.forEach((el) => {
			el.style.fill = '#000000';
		});
		homeIntro.headerReady = true;
		homeIntro.introComplete = true;
	}

	/** See the file header's "Scroll lock" note. preventDefaults every common
	 *  way to move the page (wheel, touch-drag, the usual scroll keys) and
	 *  stops Lenis, so nothing can scroll while the OP plays — not merely
	 *  "no smooth scroll", genuinely nothing moves. Returns the matching
	 *  unlock function. */
	function lockScroll(): () => void {
		const blockedKeys = new Set([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End']);
		const onWheel = (e: WheelEvent) => e.preventDefault();
		const onTouchMove = (e: TouchEvent) => e.preventDefault();
		const onKeydown = (e: KeyboardEvent) => {
			if (blockedKeys.has(e.key)) e.preventDefault();
		};
		window.addEventListener('wheel', onWheel, { passive: false });
		window.addEventListener('touchmove', onTouchMove, { passive: false });
		window.addEventListener('keydown', onKeydown);
		getLenis()?.stop();

		return () => {
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('keydown', onKeydown);
			const l = getLenis();
			l?.start();
			// Resync Lenis's own internal scroll target to wherever the window
			// actually is — see the file header's "That mount-time check alone
			// isn't enough" note. Cheap no-op on the common path (nothing moved
			// the window while stopped), but the fix for the one that did.
			l?.scrollTo(window.scrollY, { immediate: true, force: true });
		};
	}

	onMount(() => {
		if (!browser) return;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			jumpToRestingState();
			return;
		}

		// The user's own flagged edge case (see the file header's "Scroll
		// lock" note): don't let a restored mid-page scroll position collide
		// with the lock below. Only play (and lock for) the OP when this is
		// genuinely a fresh view from the top.
		if (window.scrollY > 4) {
			jumpToRestingState();
			return;
		}

		let cancelled = false;
		let tl: { kill: () => void } | undefined;
		let unlock: (() => void) | undefined;
		let bailed = false;
		/** See the timeline's onComplete below — the one-shot listener that
		 *  fades the stage from yellow to white on the reader's first scroll
		 *  after the OP. Tracked here so it can be torn down on unmount even
		 *  if it never fires (e.g. the reader navigates away first). */
		let onFirstScrollToWhite: (() => void) | undefined;

		/** See the file header's "That mount-time check alone isn't enough"
		 *  note: a late scroll restoration lands after this component has
		 *  already started (and locked) the OP. Bail exactly like the
		 *  mount-time guard above — kill the timeline, release the lock,
		 *  jump straight to the resting state — rather than staying locked
		 *  for the rest of the OP's ~3.5s while the page reads as stuck. */
		function bailFromExternalScroll() {
			if (bailed || cancelled) return;
			bailed = true;
			cancelled = true;
			tl?.kill();
			unlock?.();
			unlock = undefined;
			jumpToRestingState();
		}

		// Nothing in this file's own OP ever calls scrollTo — the whole scene
		// is a fixed, pinned stage — so ANY scroll event arriving before the
		// OP completes is necessarily external (scroll restoration, or a
		// gesture that slipped past the lock).
		window.addEventListener('scroll', bailFromExternalScroll, { passive: true });

		initScroll().then(() => {
			if (cancelled) return;
			unlock = lockScroll();
		});

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
					// The OP has genuinely finished — release the lock and
					// signal +page.svelte that section-to-section snap can
					// now arm. Also stop watching for an external scroll:
					// from here on a moving window is expected, normal
					// scrolling, not a restoration racing the lock.
					window.removeEventListener('scroll', bailFromExternalScroll);
					unlock?.();
					unlock = undefined;
					homeIntro.introComplete = true;

					// The stage holds at the summer colour it just grew into
					// (2026-09, at the user's request — "ダークグレーから
					// イエローにして、そこからスクロール検知でホワイトになる
					// ようにして") until the reader's own first scroll, which
					// is what actually fades it the rest of the way to white.
					// {once:true} — this is a one-shot beat, not a standing
					// listener; nothing ever needs to fade it back.
					onFirstScrollToWhite = () => {
						if (stageEl) gsap.to(stageEl, { backgroundColor: '#F1F0EF', duration: 0.6, ease: 'power2.out' });
					};
					window.addEventListener('scroll', onFirstScrollToWhite, { once: true, passive: true });
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

			// 1 — stagger in from below, left to right, still small. power2 (not
			// power3) for a softer arrival with less of a hard stop at rest.
			timeline.to(letterEls, {
				opacity: 1,
				y: (i: number) => LETTERS[i].ty,
				duration: STAGGER_DURATION,
				ease: 'power2.out',
				stagger: STAGGER_INTERVAL
			});

			// 2 — grow from the baseline into the large resting wordmark; the
			// row closes up as each letter's own width fills the gap beside
			// it. Stage and fill crossfade over the same beat. power4 (not
			// expo) reads smoother through the middle of the curve — expo's
			// near-flat-then-explosive shape read as a sudden jump rather
			// than a continuous grow at this slower duration.
			timeline.to(
				letterEls,
				{
					scale: 1,
					x: 0,
					y: 0,
					fill: '#000000',
					duration: GROW_DURATION,
					ease: 'power4.inOut'
				},
				`+=${GROW_GAP}`
			);
			// Crossfades to the shared summer colour, not straight to white
			// (2026-09, at the user's request) — the fade to white is a
			// separate, later beat, gated on the reader's first scroll (see
			// the timeline's own onComplete above).
			timeline.to(
				stageEl,
				{
					backgroundColor: summerColorHex(summerColor.current),
					duration: GROW_DURATION,
					ease: 'power2.inOut'
				},
				`<+=${BG_DELAY}`
			);

			// 3 — Header slides in from above during the tail of the grow, so
			// it reads as the same beat rather than a separate later step.
			// (Scroll itself stays locked until the timeline's own
			// onComplete above — the header appearing early is just a
			// visual beat, not the signal that the OP, or the lock, is done.)
			timeline.call(
				() => {
					homeIntro.headerReady = true;
				},
				[],
				`-=${GROW_DURATION * 0.37}`
			);
		});

		return () => {
			cancelled = true;
			window.removeEventListener('scroll', bailFromExternalScroll);
			if (onFirstScrollToWhite) window.removeEventListener('scroll', onFirstScrollToWhite);
			tl?.kill();
			unlock?.();
		};
	});
</script>

<section class="IntroHero" bind:this={stageEl} aria-label="Ōgast">
	<!-- Split from .IntroHero itself (2026-09, at the user's request —
	     "ロゴは100svhの配置で問題ないけど、背景自体は100lvhで"): the section's
	     own background needs to cover the full LARGE viewport so nothing of
	     the page behind it ever shows through iOS Safari's own translucent
	     chrome, but the wordmark's grid placement should stay anchored to the
	     SMALL (guaranteed-visible) viewport rather than grow/shift with it.
	     .IntroHero__content carries that grid at 100svh; .IntroHero itself
	     (this section) just supplies the 100lvh coloured backdrop behind it. -->
	<div class="IntroHero__content">
		<!-- .IntroHero__wordmark-frame carries the FINAL on-screen box (identity
		     on PC; the post-rotation box on SP) so grid place-items positions it
		     exactly where it visually ends up — see the file header comment. -->
		<div class="IntroHero__wordmark-frame">
			<svg
				class="IntroHero__wordmark"
				viewBox="0 0 1400 385.524"
				preserveAspectRatio="xMidYMid meet"
				xmlns="http://www.w3.org/2000/svg"
			>
				{#each LETTERS as letter, i (letter.id)}
					<path bind:this={letterEls[i]} d={letter.d} />
				{/each}
			</svg>
		</div>
	</div>
</section>

<style>
	.IntroHero {
		height: 100vh;
		height: 100lvh;
		background: #1f1b1a;
		overflow: hidden;
	}

	.IntroHero__content {
		height: 100vh;
		height: 100svh;
		display: grid;
		place-items: end center;
		padding-inline: 20px;
		padding-bottom: 20px;
	}

	.IntroHero__wordmark-frame {
		width: 100%;
		max-width: 1400px;
	}

	.IntroHero__wordmark {
		display: block;
		width: 100%;
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

	/* SP: the same composition spun vertical to read top-to-bottom (Figma
	   7:782/7:874). Sized via container-query units so the rotated box's
	   on-screen width/height come from the UN-rotated container's
	   height/width respectively — that container is now .IntroHero__content
	   (100svh), not .IntroHero itself (100lvh — see that split's own
	   comment), so these units still resolve against the safe-visible area. */
	@media (max-width: 767.98px) {
		.IntroHero__content {
			place-items: center start;
			padding-inline: 0;
			padding-bottom: 0;
			container-type: size;
		}

		/* This box IS the final, post-rotation visual box — sized and placed
		   as plain (unrotated) geometry, so grid's place-items:center start
		   plus this margin land it exactly where it should sit, full stop.
		   The rotation itself happens one level down, isolated on the SVG
		   (see below), so it can never disturb this element's own box.
		   margin-left centres the frame itself within the container ((100 -
		   82) / 2 = 9cqw) plus a touch more (2026-09, at the user's own
		   follow-up — "マクロンがあるのでもう少しSPは右側に配置して": the
		   macron on Ō reads as a light accent rather than solid ink, so
		   centring on the raw glyph bounding box alone still reads slightly
		   left-heavy). */
		.IntroHero__wordmark-frame {
			width: 82cqw;
			max-width: none;
			height: 82cqh;
			margin-left: 11vw;
			position: relative;
		}

		.IntroHero__wordmark {
			position: absolute;
			top: 50%;
			left: 50%;
			/* Pre-rotation box — dimensions swapped versus the frame above,
			   since rotating 90deg is what swaps them back to match it. */
			width: 82cqh;
			height: 82cqw;
			max-width: none;
			transform: translate(-50%, -50%) rotate(90deg);
		}
	}
</style>
