<script lang="ts">
	// August Type Foundry site header.
	// Mobile (<768px): "Menu" toggle. Open state is a light top panel (Figma
	//   188:10): Close + August Type Foundry wordmark, a "Fonts" group of typeface links,
	//   and Buy / About / Contact.
	// Desktop (≥768px): inline nav links on the left, no toggle.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import { onScroll } from '$lib/scroll';
	import { TYPEFACES } from '$lib/data/typefaces';
	import { lang } from '$lib/state/lang.svelte';
	import { slide, fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let open = $state(false);

	// On the home page the header starts hidden (translated up) and slides in
	// once the user scrolls. Other pages always show it.
	let scrolled = $state(false);
	const isHome = $derived(page.url.pathname === '/');
	const hiddenTop = $derived(isHome && !scrolled && !open);

	onMount(() => {
		const update = () => {
			scrolled = window.scrollY > 8;
		};
		update();
		return onScroll(update);
	});

	type NavItem = { label: string; href: string };

	// Desktop inline nav. "Custom" jumps to the bespoke section on the home
	// page — there is no standalone route for it yet.
	const NAV: NavItem[] = [
		{ label: 'Fonts', href: '/fonts' },
		{ label: 'Custom', href: '/#custom' },
		{ label: 'Buy', href: '/buy' }
	];

	// Mobile panel: typeface shortcuts + page links
	const fonts = TYPEFACES.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);
	// Announced but not yet released: shown in the menu for completeness, dimmed
	// and inert. They stay out of TYPEFACES' visible set on purpose so /fonts and
	// /fonts/[slug] keep 404-ing until there is a real page to link to.
	const UPCOMING: string[] = ['Alfred', 'Asta'];
	// Mirrors the desktop nav (the Fonts group above stands in for its "Fonts"
	// link, and the language switch is appended after these).
	const PAGES: NavItem[] = [
		{ label: 'Custom', href: '/#custom' },
		{ label: 'Buy', href: '/buy' }
	];

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	// Escape closes the mobile panel
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<header class="Header" class:is-open={open} class:is-hidden-top={hiddenTop}>
	<a class="Header__logo" href="/" onclick={close} aria-label="August Type Foundry — home">
		<Logo height={25} />
	</a>

	<!-- Desktop-only inline nav -->
	<nav class="Header__nav" aria-label="Primary navigation">
		{#each NAV as item (item.href)}
			<a class="Header__nav-link" href={item.href}>{item.label}</a>
		{/each}
		<!-- Language switch. Shows the language currently displayed; the choice
		     is kept for the browsing session, so it survives navigation. -->
		<button
			type="button"
			class="Header__nav-link Header__lang"
			onclick={() => lang.toggle()}
			aria-label={lang.current === 'en' ? 'Switch to Danish' : 'Switch to English'}
		>
			{lang.current === 'en' ? 'EN' : 'DA'}
		</button>
		<!-- The EN/DA label alone doesn't announce what changed. -->
		<span class="Header__sr" aria-live="polite">
			{lang.current === 'en' ? 'English' : 'Dansk'}
		</span>
	</nav>

	<!-- Mobile-only: Buy stays one tap away even with the menu closed, Menu/Close
	     toggles the panel. Grouped together on the right; the logo (above)
	     takes the left. -->
	<div class="Header__actions">
		<a class="Header__buy" href="/buy" onclick={close}>Buy</a>
		<button
			class="Header__toggle"
			type="button"
			onclick={toggle}
			aria-expanded={open}
			aria-controls="primary-nav"
		>
			{open ? 'Close' : 'Menu'}
		</button>
	</div>
</header>

{#if open}
	<!-- Tap-outside backdrop -->
	<button
		class="MenuBackdrop"
		type="button"
		aria-label="Close menu"
		onclick={close}
		transition:fade={{ duration: 200 }}
	></button>

	<!-- Light panel (Figma 188:10). Opens from the top; the existing header logo +
	     Close toggle sit on top of this panel (turned black); the nav drops in below. -->
	<div class="MenuPanel" id="primary-nav" transition:slide={{ duration: 420, easing: cubicOut }}>
		<div class="MenuPanel__nav" in:fly={{ y: 10, duration: 520, delay: 160, easing: cubicOut }}>
			<div class="MenuPanel__fonts">
				<span class="MenuPanel__label">Fonts</span>
				<ul class="MenuPanel__list">
					{#each fonts as f (f.slug)}
						<li><a href="/fonts/{f.slug}" onclick={close}>{f.name}</a></li>
					{/each}
					{#each UPCOMING as name (name)}
						<li><span class="MenuPanel__soon" aria-disabled="true">{name}</span></li>
					{/each}
				</ul>
			</div>

			<ul class="MenuPanel__pages">
				{#each PAGES as item (item.href)}
					<li><a href={item.href} onclick={close}>{item.label}</a></li>
				{/each}
				<li>
					<button
						type="button"
						class="MenuPanel__lang"
						onclick={() => lang.toggle()}
						aria-label={lang.current === 'en' ? 'Switch to Danish' : 'Switch to English'}
					>
						{lang.current === 'en' ? 'EN' : 'DA'}
					</button>
				</li>
			</ul>
		</div>
	</div>
{/if}

<style>
	.Header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* Solid white header bar with a hairline rule (replaces the blend-mode overlay).
		   viewport-fit=cover lets this bar reach the true screen edge, so the
		   notch/Dynamic Island safe area is added on top of the 16px. */
		padding: calc(16px + env(safe-area-inset-top, 0px)) 20px 12px;
		/* Kept high (not 1) so the fixed bar stays above z-indexed content sections. */
		z-index: 100;
		font-family: 'Steiner', sans-serif;
		background-color: #fff;
		mix-blend-mode: normal;
		color: #000;
		border-bottom: 0.5px solid rgba(0, 0, 0, 0.25);
		pointer-events: auto;
		transform: translateY(0);
		transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
	}

	.Header > * {
		pointer-events: auto;
	}

	/* Home page at the very top: hide the header above the fold; it slides in on scroll */
	.Header.is-hidden-top {
		transform: translateY(-100%);
	}

	/* When the mobile panel is open, the header sits on top of the light panel —
	   drop the blend and paint it solid black (same logo, just black). */
	.Header.is-open {
		mix-blend-mode: normal;
		color: #000;
	}


	/* Mobile-only group: Buy + Menu/Close, together on the right. Desktop
	   hides the whole group in favour of .Header__nav. */
	.Header__actions {
		order: 2;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.Header__buy {
		font-size: 14px;
		font-weight: var(--fw-ui);
		color: inherit;
		text-decoration: none;
		letter-spacing: 0;
		padding: 4px 8px;
	}

	.Header__toggle {
		background: transparent;
		border: 0;
		cursor: pointer;
		font: inherit;
		font-size: 14px;
		font-weight: var(--fw-ui);
		color: inherit;
		letter-spacing: 0;
		padding: 4px 8px;
	}

	/* Inline nav: hidden on mobile, shown on desktop */
	.Header__nav {
		display: none;
		gap: 20px;
		align-items: center;
	}

	.Header__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.Header__nav-link {
		font-size: 16px;
		font-weight: var(--fw-ui);
		color: inherit;
		text-decoration: none;
		/* the lang switch is a <button>: strip the UA chrome so it matches the
		   links beside it */
		font-family: inherit;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		letter-spacing: 0;
		padding: 4px 0;
	}

	.Header__logo {
		/* Mobile: logo leads on the left; .Header__actions (order: 2) takes the
		   right. Desktop below flips this — nav leads, logo trails. */
		order: 1;
		font-size: 20px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		/* Signal red, not the header's black/inverted text — wins over .is-open too. */
		color: var(--color-signal, #e0231c);
		letter-spacing: 0;
		padding: 4px 8px;
	}

	/* SP: logo 25px (overrides the SVG's inline height); tighter header padding */
	@media (max-width: 767px) {
		.Header {
			padding: calc(12px + env(safe-area-inset-top, 0px)) 10px 8px;
		}

		.Header__logo :global(.Logo) {
			height: 22px !important;
		}
	}

	@media (min-width: 768px) {
		.Header__actions {
			display: none;
		}

		.Header__nav {
			display: flex;
			order: 1;
		}

		.Header__logo {
			order: 2;
			font-size: 22px;
			padding: 4px 0;
		}
	}

	/* ── Mobile menu (Figma 188:10) ── */
	.MenuBackdrop {
		position: fixed;
		inset: 0;
		z-index: 90;
		border: 0;
		padding: 0;
		/* slight dim over everything below the menu */
		background: rgba(0, 0, 0, 0.2);
		cursor: default;
	}

	.MenuPanel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		/* below the header (z 100) so the existing logo + Close show on top */
		z-index: 95;
		background: #ffffff;
		color: #000;
		font-family: 'Steiner', sans-serif;
		/* top padding clears the (now solid, taller) header row so the nav sits below it;
		   add the same safe-area-inset-top the header itself carries */
		padding: calc(74px + env(safe-area-inset-top, 0px)) var(--gutter, 20px) 16px;
	}

	.MenuPanel__nav {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 16px;
	}

	.MenuPanel__label {
		display: block;
		font-size: 11px;
		line-height: 1.5;
		letter-spacing: 0;
		color: #000;
		opacity: 0.3;
		margin-bottom: 4px;
	}

	.MenuPanel__list,
	.MenuPanel__pages {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 14px;
	}

	.MenuPanel__list a,
	.MenuPanel__pages a,
	.MenuPanel__lang {
		font-size: 11px;
		line-height: 1.5;
		letter-spacing: 0;
		color: #000;
		text-decoration: none;
		white-space: nowrap;
		transition: opacity 0.15s ease;
	}

	.MenuPanel__list a:hover,
	.MenuPanel__pages a:hover,
	.MenuPanel__lang:hover {
		opacity: 0.55;
	}

	/* a <button> among links — drop the UA chrome so it sits on the same line */
	.MenuPanel__lang {
		font-family: inherit;
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
	}

	/* Unreleased faces: same slot, half-strength, and never interactive. */
	.MenuPanel__soon {
		font-size: 11px;
		line-height: 1.5;
		letter-spacing: 0;
		color: #000;
		opacity: 0.4;
		white-space: nowrap;
		cursor: default;
		pointer-events: none;
		user-select: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.MenuPanel {
			transition: none;
		}
	}
</style>
