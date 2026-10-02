<script lang="ts">
	// Apres Guerre site header (2026-10 redesign, Figma "II-ii").
	//
	// Two states, on every page:
	// - Top of the page: the large wordmark alone (Logo.svelte — PC one line,
	//   SP two), the same artwork and position as the home page's opening.
	// - Scrolled (Figma 3:671): the wordmark shrinks into a small centred
	//   lockup over a Japanese subline, nav on the left, Cart on the right,
	//   on a bar in the page's own background colour.
	//
	// The shrink moves the large wordmark's two words themselves (one
	// transform each, scale about their top-left) onto two invisible "slot"
	// boxes laid out in CSS at the compact geometry — so both layouts live in
	// CSS and this script only measures the difference. That is also how SP's
	// stacked words come back onto one line.
	//
	// SP (<768px): the compact bar holds the menu toggle (left), the lockup
	// (centre) and Cart (right); the menu panel carries the page links, the
	// typefaces and the language switch. PC's header has no language switch
	// (per the frame) — the Footer carries one on every page.
	import { onMount } from 'svelte';
	import { onScroll } from '$lib/scroll';
	import { TYPEFACES } from '$lib/data/typefaces';
	import { SITE_NAV } from '$lib/data/nav';
	import { lang, LANG_OPTIONS } from '$lib/state/lang.svelte';
	import { headerTone } from '$lib/state/headerTone.svelte';
	import { slide, fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Logo from '$lib/components/Logo.svelte';

	/** Scroll distance (px) past which the header switches to its compact state. */
	const COMPACT_AFTER = 8;
	/** How long the Cart's "not yet" note stays up. */
	const CART_NOTE_MS = 3200;

	let open = $state(false);
	let scrolled = $state(false);
	let focusInside = $state(false);
	/** Transitions switch on only after the first measured layout, so a page
	 *  loaded mid-scroll doesn't animate its logo shrinking on arrival. */
	let ready = $state(false);
	/** Set once on mount (see .is-prescrolled in the styles). */
	let hydrated = $state(false);
	const compact = $derived(scrolled || open || focusInside);

	let wordEls: HTMLElement[] = $state([]);
	let slotEls: HTMLElement[] = [];

	const fonts = TYPEFACES.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);
	// The panel's own "Fonts" group stands in for that one link.
	const PAGES = SITE_NAV.filter((item) => item.href !== '/fonts');

	/** Untransformed box of an absolutely positioned element, in its
	 *  containing block's px. Computed styles rather than offset* (integer-
	 *  rounded) or getBoundingClientRect (includes the transform). */
	function box(el: HTMLElement) {
		const cs = getComputedStyle(el);
		return { x: parseFloat(cs.left), y: parseFloat(cs.top), w: parseFloat(cs.width) };
	}

	/** Point each word's compact transform at its slot. */
	function measure() {
		wordEls.forEach((word, i) => {
			const slot = slotEls[i];
			if (!word || !slot) return;
			const from = box(word);
			const to = box(slot);
			if (!from.w) return;
			word.style.setProperty('--tx', `${to.x - from.x}px`);
			word.style.setProperty('--ty', `${to.y - from.y}px`);
			word.style.setProperty('--k', `${to.w / from.w}`);
		});
	}

	/** Measure, then arm transitions two frames later (one frame paints the
	 *  measured state). Also used on resize, which can swap the words' base
	 *  geometry outright (crossing the SP breakpoint) — animating from the
	 *  stale transform would fly them across the page. */
	let armRaf = 0;
	function measureThenArm() {
		ready = false;
		cancelAnimationFrame(armRaf);
		armRaf = requestAnimationFrame(() => {
			measure();
			armRaf = requestAnimationFrame(() => {
				armRaf = requestAnimationFrame(() => (ready = true));
			});
		});
	}

	onMount(() => {
		const update = () => {
			scrolled = window.scrollY > COMPACT_AFTER;
			// Back at the top, a focus left behind in the header (a keyboard
			// user who has tabbed on into the page) no longer holds it compact.
			if (!scrolled && !headerHasFocus()) focusInside = false;
		};
		update();
		measure();
		hydrated = true;
		measureThenArm();

		let raf = 0;
		const onResize = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(measureThenArm);
		};
		window.addEventListener('resize', onResize, { passive: true });
		const offScroll = onScroll(update);
		return () => {
			offScroll();
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(raf);
			cancelAnimationFrame(armRaf);
		};
	});

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	// Cart/checkout isn't live yet: clicking reveals this note instead of
	// doing nothing (2026-09, at the user's request).
	let cartNoteVisible = $state(false);
	let cartNoteTimer: ReturnType<typeof setTimeout> | undefined;
	function showCartNote() {
		cartNoteVisible = true;
		clearTimeout(cartNoteTimer);
		cartNoteTimer = setTimeout(() => (cartNoteVisible = false), CART_NOTE_MS);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) close();
	}

	let headerEl: HTMLElement | undefined = $state();
	const headerHasFocus = () => !!headerEl?.contains(document.activeElement);

	// Keyboard users tabbing in at the top of a page reach the nav too: focus
	// anywhere inside opens the compact state, where it is visible (and brings
	// the header back if a hero had sent it away). Keyboard focus only — a
	// click also focuses a button in most browsers, and that must not pin the
	// header compact once the reader scrolls back to the top.
	function onFocusIn(e: FocusEvent) {
		if ((e.target as Element).matches(':focus-visible')) focusInside = true;
	}
	function onFocusOut(e: FocusEvent) {
		const next = e.relatedTarget as Node | null;
		if (!next || !(e.currentTarget as HTMLElement).contains(next)) focusInside = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<header
	class="Header"
	class:is-compact={compact}
	class:is-open={open}
	class:is-ready={ready}
	class:is-hydrated={hydrated}
	class:is-on-dark={headerTone.onDark && !open}
	bind:this={headerEl}
	onfocusin={onFocusIn}
	onfocusout={onFocusOut}
>
	<div class="Header__bar" aria-hidden="true"></div>

	<a class="Header__logo" href="/" onclick={close} aria-label="Apres Guerre — home">
		<Logo bind:wordEls />
		<!-- Where the two words land in the compact state (see measure()). -->
		<span class="Header__slot Header__slot--apres" bind:this={slotEls[0]}></span>
		<span class="Header__slot Header__slot--guerre" bind:this={slotEls[1]}></span>
		<span class="Header__sub" lang="ja">アプレゲール タイプファウンダリ ジャパン</span>
		<!-- Focus ring around the compact lockup — the link's own box is
		     zero-height, and an outline on the scaled words would shrink too. -->
		<span class="Header__ring" aria-hidden="true"></span>
	</a>

	<nav class="Header__nav" aria-label="Primary navigation">
		{#each SITE_NAV as item (item.href)}
			<a class="Header__link" href={item.href}>{item.label}</a>
		{/each}
	</nav>

	<!-- The frame pairs "Account" with Cart; Account stays out until there
	     is an account system behind it (2026-09, at the user's request). -->
	<div class="Header__cart">
		<button type="button" class="Header__link" onclick={showCartNote}>Cart (0)</button>
		{#if cartNoteVisible}
			<p class="Header__cart-note" role="status" transition:fade={{ duration: 150 }}>
				Available from October
			</p>
		{/if}
	</div>

	<button
		class="Header__toggle"
		type="button"
		onclick={toggle}
		aria-expanded={open}
		aria-controls="primary-nav"
		aria-label={open ? 'Close menu' : 'Open menu'}
	>
		<span class="Header__toggle-icon" class:is-open={open} aria-hidden="true">
			<span class="Header__toggle-bar"></span>
			<span class="Header__toggle-bar"></span>
		</span>
	</button>
</header>

{#if open}
	<button
		class="MenuBackdrop"
		type="button"
		aria-label="Close menu"
		onclick={close}
		transition:fade={{ duration: 200 }}
	></button>

	<div
		class="MenuPanel"
		id="primary-nav"
		in:slide={{ duration: 600, easing: cubicOut }}
		out:slide={{ duration: 420, easing: cubicOut }}
	>
		<div class="MenuPanel__nav" in:fly={{ y: 10, duration: 520, delay: 160, easing: cubicOut }}>
			<div class="MenuPanel__fonts">
				<span class="MenuPanel__label">Fonts</span>
				<ul class="MenuPanel__list">
					{#each fonts as f (f.slug)}
						<li><a href="/fonts/{f.slug}" onclick={close}>{f.name}</a></li>
					{/each}
				</ul>
			</div>

			<ul class="MenuPanel__pages">
				{#each PAGES as item (item.href)}
					<li><a href={item.href} onclick={close}>{item.label}</a></li>
				{/each}
			</ul>

			<!-- Moved here from the collapsed bar, which now holds the lockup. -->
			<div class="MenuPanel__langs" role="group" aria-label="Language">
				{#each LANG_OPTIONS as l (l.code)}
					<button
						type="button"
						class="MenuPanel__lang"
						class:is-active={lang.current === l.code}
						onclick={() => lang.set(l.code)}
						aria-pressed={lang.current === l.code}
						aria-label={l.name}
					>
						{l.label}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.Header {
		/* Compact lockup geometry — PC per Figma 3:671 (1440 frame). The bar
		   height is the shared base.css token, so sticky page UI can clear it. */
		--bar-h: var(--header-bar-h);
		--lockup-w: 273.3px;
		--lockup-top: 28px;
		--sub-top: 71px;
		--sub-fs: 12px;
		--edge: 40px;
		--row-top: 33px;
		/* Vertical centre of the lockup's wordmark (the toggle's row). */
		--row-mid: calc(var(--lockup-top) + var(--lockup-w) * 156 / 1360 / 2);
		--safe-top: env(safe-area-inset-top, 0px);
		--ease: cubic-bezier(0.65, 0, 0.35, 1);

		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		/* Zero-height: every part is absolutely placed, so the header never
		   blocks clicks on the page beyond what it actually draws. */
		height: 0;
		z-index: 100;
		color: var(--brand-blue);
		/* The Logo's words follow whatever colour the header has (see
		   Logo.svelte --logo-color). */
		--logo-color: currentColor;
		transition: color 0.3s ease;
	}

	/* base.css re-asserts its own colour on div/span/a/button/p — keep the
	   whole header on one colour. */
	.Header :global(*) {
		color: inherit;
	}

	/* Over a dark full-bleed section (the home page's typeface heroes,
	   Contact) the header turns light instead of leaving — see
	   headerTone.svelte.ts. */
	.Header.is-on-dark {
		color: var(--brand-paper);
	}

	.Header__bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: calc(var(--bar-h) + var(--safe-top));
		background: var(--color-bg);
		opacity: 0;
		pointer-events: none;
	}

	/* No fill on the home page (2026-10, at the user's request — "Headerの
	   背景白塗りは不要"): it overlays the sections as they scroll by. Every
	   other page keeps the bar, in the page's own colour, so body text
	   doesn't run under the nav. */
	:global(html[data-theme='home']) .Header__bar {
		background: transparent;
	}

	.Header__logo {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 0;
		display: block;
	}

	/* The two words: identity at the top of the page, onto their slots once
	   compact (--tx/--ty/--k set by measure()). */
	.Header__logo :global(.Logo__word) {
		transform: translate(0, 0) scale(1);
	}

	.Header.is-compact .Header__logo :global(.Logo__word) {
		transform: translate(var(--tx, 0), var(--ty, 0)) scale(var(--k, 1));
	}

	/* The link's own box is zero-height (a stray full-width line if
	   outlined); the ring goes around the compact lockup instead — focus
	   always compacts the header. */
	.Header__logo:focus-visible {
		outline: none;
	}

	.Header__ring {
		position: absolute;
		top: calc(var(--lockup-top) + var(--safe-top) - 6px);
		left: calc(50% - var(--lockup-w) / 2 - 8px);
		width: calc(var(--lockup-w) + 16px);
		height: calc(var(--lockup-w) * 156 / 1360 + 12px);
		outline: 1px solid currentColor;
		opacity: 0;
		pointer-events: none;
	}

	.Header__logo:focus-visible .Header__ring {
		opacity: 1;
	}

	/* A page that loads already scrolled (a restored position) would show
	   the large top-of-page mark over its content until hydration measures
	   and compacts it. app.html's pre-hydration script flags that case. */
	:global(html.is-prescrolled) .Header:not(.is-hydrated) .Header__logo :global(.Logo__word) {
		visibility: hidden;
	}

	.Header__slot {
		position: absolute;
		top: calc(var(--lockup-top) + var(--safe-top));
		height: calc(var(--lockup-w) * 156 / 1360);
		visibility: hidden;
		pointer-events: none;
	}

	/* Same x ranges as Logo.svelte's words, at the lockup's width. */
	.Header__slot--apres {
		left: calc(50% - var(--lockup-w) / 2);
		width: calc(var(--lockup-w) * 564.78 / 1360);
	}

	.Header__slot--guerre {
		left: calc(50% - var(--lockup-w) / 2 + var(--lockup-w) * 612.92 / 1360);
		width: calc(var(--lockup-w) * 747.08 / 1360);
	}

	/* FOT-TsukuGo Pro B in the frame — not available as a webfont, so the
	   nearest system gothic at a matching bold stands in. */
	.Header__sub {
		position: absolute;
		top: calc(var(--sub-top) + var(--safe-top));
		left: 50%;
		transform: translateX(-50%);
		font-family:
			'FOT-TsukuGo Pro', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo',
			sans-serif;
		font-size: var(--sub-fs);
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: 0;
		white-space: nowrap;
	}

	.Header__nav,
	.Header__cart {
		position: absolute;
		top: calc(var(--row-top) + var(--safe-top));
		display: flex;
		align-items: center;
	}

	.Header__nav {
		left: var(--edge);
		/* Five spaces between items in the frame (Elio 12px). */
		gap: 14px;
		font-size: 12px;
	}

	.Header__cart {
		right: var(--edge);
		font-size: 12px;
	}

	.Header__link {
		font-family: var(--font-elio), sans-serif;
		font-size: inherit;
		font-weight: 400;
		font-variation-settings: 'wght' 400;
		line-height: 1.25;
		letter-spacing: 0;
		text-decoration: none;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.Header__link:hover {
		opacity: 0.6;
	}

	.Header__cart-note {
		position: absolute;
		top: 100%;
		right: 0;
		margin: 8px 0 0;
		padding: 6px 10px;
		font-size: 11px;
		line-height: 1.3;
		white-space: nowrap;
		background: var(--brand-blue);
		color: #ffffff !important;
	}

	/* Everything but the wordmark only exists in the compact state. Faded
	   rather than display:none so keyboard focus can still reach it — and
	   focus inside the header is itself one of the things that compacts it. */
	.Header__sub,
	.Header__nav,
	.Header__cart,
	.Header__toggle {
		opacity: 0;
		pointer-events: none;
	}

	.Header.is-compact .Header__bar,
	.Header.is-compact .Header__sub,
	.Header.is-compact .Header__nav,
	.Header.is-compact .Header__cart,
	.Header.is-compact .Header__toggle {
		opacity: 1;
	}

	.Header.is-compact .Header__bar,
	.Header.is-compact .Header__nav,
	.Header.is-compact .Header__cart,
	.Header.is-compact .Header__toggle {
		pointer-events: auto;
	}

	.Header.is-ready .Header__logo :global(.Logo__word) {
		transition: transform 0.8s var(--ease);
	}

	.Header.is-ready .Header__bar {
		transition: opacity 0.5s ease;
	}

	/* Out quickly, in after the words have mostly arrived. */
	.Header.is-ready .Header__sub,
	.Header.is-ready .Header__nav,
	.Header.is-ready .Header__cart,
	.Header.is-ready .Header__toggle {
		transition: opacity 0.25s ease;
	}

	.Header.is-ready.is-compact .Header__sub,
	.Header.is-ready.is-compact .Header__nav,
	.Header.is-ready.is-compact .Header__cart,
	.Header.is-ready.is-compact .Header__toggle {
		transition: opacity 0.5s ease 0.35s;
	}

	/* Menu toggle — below 960px only. */
	.Header__toggle {
		display: none;
	}

	/* ── SP lockup sizes ── */
	@media (max-width: 767.98px) {
		.Header {
			--lockup-w: 180px;
			--lockup-top: 16px;
			--sub-top: 42px;
			--sub-fs: 9px;
			--edge: 20px;
		}
	}

	/* ── Below 960px: menu toggle instead of the inline nav ── the PC nav
	   (≈239px from x=40) runs into the centred 273px lockup under ~830px,
	   and is tight until ~910px, so tablets in portrait get the SP menu. */
	@media (max-width: 959.98px) {
		.Header__nav {
			display: none;
		}

		.Header__cart {
			top: calc(var(--row-mid) + var(--safe-top));
			transform: translateY(-50%);
		}

		.Header__toggle {
			position: absolute;
			left: calc(var(--edge) - 4px);
			top: calc(var(--row-mid) + var(--safe-top));
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 4px;
			background: transparent;
			border: 0;
			cursor: pointer;
		}

		.Header__toggle-icon {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 25px;
			gap: 6px;
		}

		.Header__toggle-bar {
			display: block;
			width: 100%;
			height: 1px;
			background: currentColor;
			transition:
				transform 0.25s ease,
				opacity 0.2s ease;
		}

		/* Half of (gap + bar) — both bars pivot about the shared centre line. */
		.Header__toggle-icon.is-open .Header__toggle-bar:first-child {
			transform: translateY(3.5px) rotate(45deg);
		}

		.Header__toggle-icon.is-open .Header__toggle-bar:last-child {
			transform: translateY(-3.5px) rotate(-45deg);
		}
	}

	/* ── SP menu panel ── */
	.MenuBackdrop {
		position: fixed;
		inset: 0;
		z-index: 90;
		border: 0;
		padding: 0;
		background: rgba(0, 0, 0, 0.2);
		cursor: default;
	}

	.MenuPanel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		/* 50vh (2026-09, at the user's request); overflow is a safety net
		   for a short landscape phone. */
		height: 50vh;
		overflow-y: auto;
		/* Under the header (z 100), whose compact bar sits on top. */
		z-index: 95;
		background: var(--color-bg);
		padding: calc(var(--header-bar-h) + 18px + env(safe-area-inset-top, 0px)) 20px 16px;
	}

	.MenuPanel :global(*) {
		color: var(--brand-blue);
	}

	.MenuPanel__nav {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 20px;
	}

	.MenuPanel__label {
		display: block;
		font-size: 12px;
		line-height: 1.5;
		letter-spacing: 0;
		opacity: 0.5;
		margin-bottom: 4px;
	}

	.MenuPanel__list,
	.MenuPanel__pages,
	.MenuPanel__langs {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
	}

	.MenuPanel__list a,
	.MenuPanel__pages a {
		font-family: var(--font-elio), sans-serif;
		font-size: 16px;
		line-height: 1.5;
		letter-spacing: 0;
		text-decoration: none;
		white-space: nowrap;
		transition: opacity 0.15s ease;
	}

	.MenuPanel__list a:hover,
	.MenuPanel__pages a:hover {
		opacity: 0.55;
	}

	.MenuPanel__lang {
		font-family: var(--font-elio), sans-serif;
		font-size: 13px;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		opacity: 0.45;
		transition: opacity 0.15s ease;
	}

	.MenuPanel__lang.is-active {
		opacity: 1;
	}
</style>
