<!-- Home page top (2026-10 redesign, Figma "II-ii"): the opening (1:635 PC,
     7:782 SP), then the resting top (175:178 PC, 7:874 SP).

     Opening: the wordmark's letters, in the brand orange, rise into place
     left to right on the brand-blue ground (Figma 1:635; colours swapped
     from the first cut, 2026-10, at the user's request — so the logo turns
     blue at the very moment the ground turns white). Then the ground lifts
     away to the white page underneath, the letters turning blue as it goes,
     while the first typeface hero comes up from below, growing as it rises,
     until its top edge rests at half the screen height ("OPから背景が白に
     なり、下から大きくなりながら書体Hero100vhがinして、50vh分見える感じ").

     The opening is a fixed overlay carrying its own copy of the wordmark
     (Logo.svelte, the same component and position as the Header's), above
     the Header. By the time the overlay's ground has faded the letters have
     become the same blue as the Header's own mark, which is already sitting
     on exactly the same pixels underneath — so the hand-over is invisible
     and nothing has to be told to "show" the Header.

     The whole sequence is CSS animation, so it runs from the server-rendered
     first paint without waiting on hydration, and a page that never gets its
     JS still finishes (the overlay fades on its own). The script only adds
     what CSS can't: the scroll lock while it plays ("OP中はスクロール禁止"),
     skipping it, and signalling completion (homeIntro.introComplete) so the
     page's snap can arm. Completion is read off the running animation itself
     (getAnimations / .finished), never off animation events alone: on a slow
     hydration those can fire before any listener exists, which would leave
     the page locked for good.

     It plays once, on arriving at the site. An in-app navigation back to "/"
     (homeIntro.inApp) and a page that loads already scrolled (a restored
     position) both land straight on the resting state.

     Heroes (175:178): one per typeface, a full screen tall (90vh on SP, at
     the user's request), dark, with a tagline top-left and the face's name
     set in itself bottom-left; 4px of page between them. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Typeface } from '$lib/data/typefaces';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { initScroll, getLenis } from '$lib/scroll';
	import Logo from '$lib/components/Logo.svelte';

	interface Props {
		typefaces: Typeface[];
	}

	let { typefaces }: Props = $props();

	/** Distance (px) the page may already be scrolled before the opening is
	 *  skipped outright — a restored mid-page position must never meet the
	 *  scroll lock. */
	const AT_TOP = 4;

	/** True once the opening is over or was skipped: the overlay goes and
	 *  the heroes/lead render at rest with no animation. */
	let settled = $state(false);
	let heroesEl: HTMLElement | undefined = $state();

	function finish() {
		settled = true;
		homeIntro.introComplete = true;
	}

	/** Blocks every common way to move the page (wheel, touch-drag, scroll
	 *  keys) and stops Lenis. Capture phase, with propagation stopped, so
	 *  Lenis never sees the gesture even if something else restarts it
	 *  mid-opening. Returns the matching unlock. */
	function lockScroll(): () => void {
		const blockedKeys = new Set([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End']);
		const block = (e: Event) => {
			e.preventDefault();
			e.stopPropagation();
		};
		const onKeydown = (e: KeyboardEvent) => {
			if (blockedKeys.has(e.key)) e.preventDefault();
		};
		const opts = { capture: true, passive: false };
		window.addEventListener('wheel', block, opts);
		window.addEventListener('touchmove', block, opts);
		window.addEventListener('keydown', onKeydown);
		getLenis()?.stop();

		return () => {
			window.removeEventListener('wheel', block, opts);
			window.removeEventListener('touchmove', block, opts);
			window.removeEventListener('keydown', onKeydown);
			const l = getLenis();
			l?.start();
			// Resync Lenis's internal target to wherever the window really is
			// (a scroll it didn't originate leaves it stale — see below).
			l?.scrollTo(window.scrollY, { immediate: true, force: true });
		};
	}

	/** The heroes' entrance — the opening's last beat — if it is still to
	 *  run or running. Svelte scopes keyframe names, hence endsWith. */
	function heroesEntrance(): Animation | undefined {
		return heroesEl
			?.getAnimations()
			.find((a) => 'animationName' in a && String(a.animationName).endsWith('heroes-in'));
	}

	onMount(() => {
		homeIntro.introComplete = false;

		const entrance = heroesEntrance();
		if (
			homeIntro.inApp ||
			window.scrollY > AT_TOP ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
			!entrance ||
			entrance.playState === 'finished'
		) {
			finish();
			return;
		}

		let unlock: (() => void) | undefined;
		let released = false;

		// Nothing in the opening scrolls the page, so any scroll while it plays
		// is external. Bail to the resting state rather than stay locked with
		// the page moved out from under the lock.
		const onExternalScroll = () => {
			release();
			finish();
		};

		function release() {
			if (released) return;
			released = true;
			window.removeEventListener('scroll', onExternalScroll);
			unlock?.();
			unlock = undefined;
		}

		window.addEventListener('scroll', onExternalScroll, { passive: true });
		initScroll().then(() => {
			if (!released) unlock = lockScroll();
		});

		// Resolves at the end; rejects if the animation is cancelled (settling
		// early removes it) — either way the opening is over.
		const done = () => {
			release();
			finish();
		};
		entrance.finished.then(done, done);

		return release;
	});
</script>

<div class="HomeTop" class:is-settled={settled}>
	<div class="Opening" aria-hidden="true">
		<div class="Opening__logo"><Logo /></div>
	</div>

	<section class="HomeLead">
		<h1 class="HomeLead__title">Apres Guerre</h1>
		<!-- The frame's own copy (it repeats twice there as filler), with the
		     brand name updated and "from Tokyo" left out, per the user's
		     earlier request to keep the city out of the site's copy. -->
		<p class="HomeLead__text">
			Apres Guerre is an independent type foundry. We draw humanist typefaces that treat the letter
			as the medium meaning passes through — retail families and bespoke type for those who value
			the power of design.
		</p>
	</section>

	<div class="HomeHeroes" bind:this={heroesEl}>
		{#each typefaces as tf (tf.slug)}
			<a class="HomeHero" href="/fonts/{tf.slug}">
				<p class="HomeHero__tagline">{tf.homeSection?.headline}</p>
				<p
					class="HomeHero__name"
					style="font-family: '{tf.fontFamily}', var(--font-norma); font-variation-settings: 'wght' {tf
						.homeSection?.heroWeight ?? 400};"
				>
					{tf.homeSection?.heroName ?? tf.name}
				</p>
			</a>
		{/each}
	</div>
</div>

<style>
	.HomeTop {
		/* Opening timeline (seconds from first paint). */
		--rise-at: 0.3s;
		--rise-dur: 1.2s;
		--rise-step: 60ms;
		--lift-at: 2.4s;
		--lift-dur: 0.8s;
		/* The ground turns white first, then the hero comes up into it. */
		--hero-at: 2.75s;
		--hero-dur: 1.6s;
		--lead-at: 3.2s;
		--lead-dur: 0.8s;
		--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
		--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
		/* Heroes: full screen PC, 90vh SP; the lead holds the top half. */
		--hero-h: 100vh;
		--lead-h: 50vh;
		/* The page's side inset (base.css --padding). */
		--edge: var(--padding);
	}

	/* ── Opening overlay ── */
	.Opening {
		position: fixed;
		inset: 0;
		/* Above the Header (1200), whose own mark it hands over to. */
		z-index: 1300;
		background: var(--brand-blue);
		pointer-events: none;
		animation: opening-lift var(--lift-dur) ease var(--lift-at) forwards;
	}

	.Opening__logo {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 0;
	}

	/* Each letter rises out of its word's own box (the <svg> clips to its
	   viewBox), staggered left to right. translateY is in viewBox units here
	   — 170 clears the 156-unit-tall box entirely. */
	.Opening :global(.Logo__word path) {
		animation: letter-rise var(--rise-dur) var(--ease-out-expo) backwards;
		animation-delay: calc(var(--rise-at) + var(--i) * var(--rise-step));
	}

	@keyframes letter-rise {
		from {
			transform: translateY(170px);
		}
	}

	/* Only the ground fades (to transparent, so the page and the rising hero
	   show through); the letters are not faded but recoloured, orange to the
	   Header's blue, over the same beat. */
	@keyframes opening-lift {
		to {
			background-color: rgba(255, 255, 255, 0);
			visibility: hidden;
		}
	}

	.Opening :global(.Logo__word) {
		color: var(--brand-orange);
		animation: logo-to-blue var(--lift-dur) ease var(--lift-at) forwards;
	}

	@keyframes logo-to-blue {
		to {
			color: var(--brand-blue);
		}
	}

	/* ── Lead: the white top half ── */
	.HomeLead {
		position: relative;
		height: var(--lead-h);
		padding: 0;
	}

	.HomeLead__title {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	/* Ango 11px / 1.4, 646px wide, 349px down in the 900px frame — its last
	   line ~55px above the hero, which is what's kept here. */
	.HomeLead__text {
		position: absolute;
		left: var(--edge);
		bottom: 55px;
		width: min(646px, calc(100% - 2 * var(--edge)));
		margin: 0;
		font-family: var(--font-ango), sans-serif;
		font-size: 11px;
		font-weight: 400;
		font-variation-settings: 'wght' 400;
		line-height: 1.4;
		letter-spacing: 0;
		color: var(--brand-blue);
		animation: lead-in var(--lead-dur) ease var(--lead-at) backwards;
	}

	@keyframes lead-in {
		from {
			opacity: 0;
		}
	}

	/* ── Heroes ── */
	.HomeHeroes {
		/* Rises from fully below the fold, growing to full width. */
		transform-origin: 50% 0;
		animation: heroes-in var(--hero-dur) var(--ease-out-quint) var(--hero-at) backwards;
	}

	@keyframes heroes-in {
		from {
			transform: translateY(var(--lead-h)) scale(0.8);
		}
	}

	.HomeHero {
		position: relative;
		display: block;
		height: var(--hero-h);
		background: var(--brand-hero);
		text-decoration: none;
	}

	.HomeHero + .HomeHero {
		margin-top: 4px;
	}

	.HomeHero__tagline,
	.HomeHero__name {
		position: absolute;
		left: var(--edge);
		margin: 0;
		line-height: 1;
		letter-spacing: 0;
		color: var(--brand-paper);
		white-space: nowrap;
	}

	/* 60px, not the frame's 20px: the Header stays over the heroes now, and
	   its nav row (PC) sits at y=33-48 on the same left edge. */
	.HomeHero__tagline {
		top: 60px;
		font-family: var(--font-norma);
		font-size: 16px;
		font-variation-settings: 'wght' 400;
	}

	.HomeHero__name {
		bottom: 20px;
		font-size: 100px;
	}

	/* Settled (opening over or skipped): no overlay, everything at rest. */
	.HomeTop.is-settled .Opening {
		display: none;
	}

	.HomeTop.is-settled .HomeHeroes,
	.HomeTop.is-settled .HomeLead__text {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.Opening {
			display: none;
		}

		.HomeHeroes,
		.HomeLead__text {
			animation: none;
		}
	}

	@media (max-width: 767.98px) {
		.HomeTop {
			--hero-h: 90vh;
			/* Small viewport: the hero's top lands at the middle of what is
			   actually visible, URL bar and all. */
			--lead-h: 50svh;
		}

		.HomeLead__text {
			bottom: 32px;
		}

		/* Clears the menu toggle (y=10-42) the same way. */
		.HomeHero__tagline {
			top: 58px;
			font-size: 14px;
		}

		.HomeHero__name {
			bottom: 16px;
			font-size: 64px;
		}
	}
</style>
