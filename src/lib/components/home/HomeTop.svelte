<!-- Home page top (2026-10 redesign, Figma "II-ii"): the opening (1:635 PC,
     7:782 SP), then the resting top (175:178 PC, 7:874 SP).

     Opening: the wordmark's letters, in white, rise into place on a black
     ground (Figma 1:635 had it brand blue; black since 2026-11-05, at the
     user's request, with the new name). The words overlap: each begins when
     the one before it is three letters in ("Tim" of Time), not when it is
     done, so the whole name is up sooner (the user asked for a shorter
     opening). Then the ground lifts
     away to the white page underneath, the letters turning black as it goes
     (so the logo turns dark at the very moment the ground turns white),
     while the first typeface hero comes up from below, growing as it rises,
     until its top edge rests at half the screen height ("OPから背景が白に
     なり、下から大きくなりながら書体Hero100vhがinして、50vh分見える感じ").

     The opening is a fixed overlay carrying its own copy of the wordmark
     (Logo.svelte, the same component and position as the Header's), above
     the Header. By the time the overlay's ground has faded the letters have
     become the same black as the Header's own mark, which is already sitting
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

     Heroes: one panel per typeface, a full screen tall (90vh on SP, at the
     user's request). Since 2026-11-05 (the user's request, after
     britishstandardtype.xyz/typefaces — "シンプルな背景とテキストのみ、書体
     セクションであることをもっと分かりやすく") a panel is a flat ground with the
     name set huge in the face itself, centred, and a caption bottom-left —
     no picture. Every name is set at one size, the words of a longer name
     stacked ("Quad" over "Sans"), so the panels read as one list. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { HomePanel } from '$lib/data/typefaces';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { initScroll, getLenis } from '$lib/scroll';
	import Logo from '$lib/components/Logo.svelte';

	interface Props {
		panels: HomePanel[];
	}

	let { panels }: Props = $props();

	// ── Panel motion ────────────────────────────────────────────────────────
	// Each panel's name moves only while the panel is on screen (`live`), and
	// not at all under reduced motion (the CSS drops the animations, and the
	// typewriter below is never started, so the name stays whole).

	/** Share of a panel that must be on screen for it to count as live — a
	 *  name sits at the middle, so it is in view well before this. */
	const LIVE_THRESHOLD = 0.4;
	/** The typewriter's pace, in ms: a letter typed, a letter backspaced, the
	 *  hold on the whole name, and the pause on the empty line. */
	const TYPE_MS = 130;
	const ERASE_MS = 55;
	const HOLD_MS = 2600;
	const EMPTY_MS = 700;

	const reducedMotion = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** Which panels are on screen, by key. */
	let live: Record<string, boolean> = $state({});
	/** How many letters of a typewriter panel are typed. Absent = all of them
	 *  (the server-rendered state, no script, reduced motion). */
	let typed: Record<string, number> = $state({});

	/** Reports whether the element is mostly on screen. */
	function inview(node: HTMLElement, onChange: (isLive: boolean) => void) {
		const io = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting), {
			threshold: LIVE_THRESHOLD
		});
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}

	/** The panel's letters in all, across its lines. */
	function letterCount(panel: HomePanel): number {
		return panel.lines.reduce((n, line) => n + line.length, 0);
	}

	/** Where a line's letters start in the panel's running count — the index
	 *  each letter's place in the typing comes from. */
	function lineStart(panel: HomePanel, line: number): number {
		return panel.lines.slice(0, line).reduce((n, l) => n + l.length, 0);
	}

	/** Types the name, holds, backspaces it, pauses, and again, until stopped.
	 *  Returns the stop. */
	function runTypewriter(key: string, total: number): () => void {
		let count = 0;
		let timer = 0;
		const show = (n: number) => {
			count = n;
			typed[key] = n;
		};
		const typeNext = () => {
			if (count < total) {
				show(count + 1);
				timer = window.setTimeout(typeNext, TYPE_MS);
			} else {
				timer = window.setTimeout(eraseNext, HOLD_MS);
			}
		};
		const eraseNext = () => {
			if (count > 0) {
				show(count - 1);
				timer = window.setTimeout(eraseNext, ERASE_MS);
			} else {
				timer = window.setTimeout(typeNext, EMPTY_MS);
			}
		};
		show(0);
		timer = window.setTimeout(typeNext, EMPTY_MS);
		return () => {
			window.clearTimeout(timer);
			// Off screen it waits empty, so it never shows whole for a moment on
			// the way back in.
			typed[key] = 0;
		};
	}

	$effect(() => {
		if (reducedMotion) return;
		const stops = panels
			.filter((p) => p.motion === 'typewriter' && live[p.key])
			.map((p) => runTypewriter(p.key, letterCount(p)));
		return () => stops.forEach((stop) => stop());
	});

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

	<div class="HomeHeroes" bind:this={heroesEl}>
		{#each panels as panel (panel.key)}
			<!-- The ground is a plain CSS background, which is what the Header
			     samples to pick its own colour — see Header.svelte. A name with
			     no page yet is a section, not a link. -->
			<svelte:element
				this={panel.href ? 'a' : 'section'}
				class="HomeHero HomeHero--{panel.motion}"
				class:is-live={live[panel.key]}
				href={panel.href}
				aria-label="{panel.name}, {panel.meta.join(', ')}"
				style="--panel-bg: {panel.bg}; --panel-fg: {panel.fg}; --panel-font: '{panel.fontFamily}'; --panel-weight: {panel.weight};"
				use:inview={(isLive) => (live[panel.key] = isLive)}
			>
				<!-- The caption says it all to a screen reader, so the big name is
				     for the eye only. Its letters are spans, for the motions that
				     work on them one by one (the weight swing, the typing). -->
				<p class="HomeHero__name" aria-hidden="true">
					{#each panel.lines as line, l (line)}
						<span class="HomeHero__line">
							{#each [...line] as ch, c (c)}
								{@const i = lineStart(panel, l) + c}
								{@const count = typed[panel.key] ?? Infinity}
								<span
									class="HomeHero__ch"
									class:is-typed={i < count}
									class:is-caret={count === 0 ? i === 0 : i === count - 1}
									class:is-before={count === 0}>{ch}</span
								>
							{/each}
						</span>
					{/each}
				</p>
				<p class="HomeHero__caption" aria-hidden="true">
					<span>{panel.name}</span>
					{#each panel.meta as part (part)}
						<span class="HomeHero__meta">{part}</span>
					{/each}
				</p>
			</svelte:element>
		{/each}
	</div>
</div>

<style>
	.HomeTop {
		/* Opening timeline (seconds from first paint). */
		--rise-at: 0.3s;
		--rise-dur: 1.2s;
		--rise-step: 60ms;
		/* How many letters of a word are up before the next word starts. */
		--word-lead: 3;
		/* The last letter starts rising at 1.08s (it was 1.56s, a word at a
		   time), so the lift, and what follows it, come 0.5s sooner. */
		--lift-at: 1.9s;
		--lift-dur: 0.8s;
		/* The ground turns white first, then the hero comes up into it. */
		--hero-at: 2.25s;
		--hero-dur: 1.6s;
		--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
		--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
		/* Heroes: full screen PC, 90vh SP; the lead holds the top 35vh on PC,
		   the top half on SP. */
		--hero-h: 100vh;
		/* No lead since 2026-11-11 (at the user's request — the page starts
		   on the typeface heroes): the first hero rises to the very top. */
		--lead-h: 0px;
		/* Where the heroes start their rise: just below the fold, whatever the
		   lead's height (the hero's top sits at --lead-h, so this is what is
		   left of the screen under it). */
		--hero-from: calc(100vh - var(--lead-h));
		/* The page's side inset (base.css --padding). */
		--edge: var(--padding);
	}

	/* ── Opening overlay ── */
	.Opening {
		position: fixed;
		inset: 0;
		/* Above the Header (1200), whose own mark it hands over to. */
		z-index: 1300;
		background: var(--black);
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
	   — 1.1 line heights clears the box entirely. --w is the letter's word,
	   --j its place in that word (Logo.svelte): a word starts --word-lead
	   letters after the one before it. */
	.Opening :global(.Logo__word path) {
		animation: letter-rise var(--rise-dur) var(--ease-out-expo) backwards;
		animation-delay: calc(
			var(--rise-at) + (var(--w) * var(--word-lead) + var(--j)) * var(--rise-step)
		);
	}

	@keyframes letter-rise {
		from {
			transform: translateY(calc(var(--logo-h) * 1.1 * 1px));
		}
	}

	/* Only the ground fades (to transparent, so the page and the rising hero
	   show through); the letters are not faded but recoloured, white to the
	   Header's black, over the same beat. */
	@keyframes opening-lift {
		to {
			background-color: rgba(255, 255, 255, 0);
			visibility: hidden;
		}
	}

	.Opening :global(.Logo__word) {
		color: var(--white);
		animation: logo-to-ink var(--lift-dur) ease var(--lift-at) forwards;
	}

	@keyframes logo-to-ink {
		to {
			color: var(--black);
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
			transform: translateY(var(--hero-from)) scale(0.8);
		}
	}

	/* --panel-bg / -fg / -font / -weight come from the panel's data. */
	.HomeHero {
		position: relative;
		display: block;
		height: var(--hero-h);
		background: var(--panel-bg);
		color: var(--panel-fg);
		text-decoration: none;
		overflow: hidden;
	}

	/* The name, centred, at one size for every panel: sized by the width of
	   the widest with a margin, and capped by the height so a two-line name
	   still sits well inside a short, wide screen. The widest is "HUMORIST" in
	   capitals and Regular since 2026-11-09 (5.28em; it was "Humorist" in
	   Light, 4.05em, at 20vw / 21vw), so the size came down to keep the same
	   share of the width: 81% (85% on a phone). */
	.HomeHero__name {
		--name-size: min(15.3vw, 34vh);
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: 0;
		font-family: var(--panel-font), var(--font-norma), sans-serif;
		font-size: var(--name-size);
		font-weight: var(--panel-weight);
		font-variation-settings: 'wght' var(--panel-weight);
		line-height: 1;
		letter-spacing: 0;
		text-align: center;
		color: var(--panel-fg);
	}

	/* base.css sets font-family and color straight on every div, a, span and
	   p, so none of it inherits: each element in the name and the caption
	   takes the panel's own again. (Left alone, the spans set the name in the
	   page's face, in black, and the panel's face is never even fetched.) */
	.HomeHero__line,
	.HomeHero__ch,
	.HomeHero__caption > span {
		font-family: inherit;
		color: inherit;
	}

	.HomeHero__line {
		display: block;
		white-space: nowrap;
	}

	/* ── Motion (see HomePanelMotion). Every animation below is paused until
	   its panel is live — on screen — and dropped under reduced motion. ── */

	/* wght: every letter swings Hair-ish to Black and back on the same loop,
	   all at the same time — no stagger (2026-11-09, at the user's request —
	   "staggerでずらさず、同じタイミングで"). The word's width breathes with
	   it, centred. */
	.HomeHero--wght .HomeHero__ch {
		animation: ch-weight 3.6s ease-in-out infinite;
		animation-play-state: paused;
	}

	@keyframes ch-weight {
		0%,
		100% {
			font-variation-settings: 'wght' 100;
		}
		50% {
			font-variation-settings: 'wght' 900;
		}
	}

	/* typewriter: the letters not typed yet keep their room (hidden, not
	   gone) so the centred name does not shift as it fills; the caret is a bar
	   after the last letter typed, or before the first while the line is empty.
	   It takes no room either. */
	.HomeHero--typewriter .HomeHero__ch {
		position: relative;
	}

	.HomeHero--typewriter .HomeHero__ch:not(.is-typed) {
		visibility: hidden;
	}

	.HomeHero--typewriter .HomeHero__ch.is-caret::after {
		content: '';
		position: absolute;
		left: 100%;
		bottom: 0.25em;
		width: 0.04em;
		height: 0.73em;
		margin-left: 0.05em;
		background: currentColor;
		visibility: visible;
		animation: caret-blink 1.05s steps(1) infinite;
		animation-play-state: paused;
	}

	.HomeHero--typewriter .HomeHero__ch.is-caret.is-before::after {
		left: 0;
		margin-left: -0.09em;
	}

	@keyframes caret-blink {
		50% {
			opacity: 0;
		}
	}

	.HomeHero.is-live .HomeHero__ch,
	.HomeHero.is-live .HomeHero__ch::after,
	.HomeHero.is-live .HomeHero__name {
		animation-play-state: running;
	}

	/* The caption, on the lead text's own grid: Ango 11px / 1.4 from the page
	   inset, its last line 30px above the panel's foot. */
	.HomeHero__caption {
		position: absolute;
		left: var(--edge);
		bottom: 30px;
		width: calc(100% - 2 * var(--edge));
		margin: 0;
		font-family: var(--font-ango), sans-serif;
		font-size: 11px;
		font-weight: 400;
		font-variation-settings: 'wght' 400;
		line-height: 1.4;
		letter-spacing: 0;
		color: var(--panel-fg);
	}

	.HomeHero__meta {
		margin-left: 0.8em;
		opacity: 0.6;
	}

	.HomeHero:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: -6px;
	}

	/* Settled (opening over or skipped): no overlay, everything at rest. */
	.HomeTop.is-settled .Opening {
		display: none;
	}

	.HomeTop.is-settled .HomeHeroes {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.Opening {
			display: none;
		}

		.HomeHeroes,
		.HomeHero__name,
		.HomeHero__ch,
		.HomeHero__ch::after {
			animation: none;
		}
	}

	@media (max-width: 767.98px) {
		.HomeTop {
			--hero-h: 90vh;
			/* Small viewport: the hero's top lands at the middle of what is
			   actually visible, URL bar and all. */
			--lead-h: 0px;
			--hero-from: 100svh;
		}

		.HomeHero__caption {
			bottom: 32px;
		}

		/* "HUMORIST" across the screen with the page inset either side. */
		.HomeHero__name {
			--name-size: 16.1vw;
		}
	}
</style>
