<script lang="ts">
	// August site header.
	// Mobile (<768px): "Menu" toggle. Open state is a light top panel (Figma
	//   188:10): Close + August.tf wordmark, a "Fonts" group of typeface links,
	//   and Buy / About / Contact.
	// Desktop (≥768px): inline nav links on the left, no toggle.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import { onScroll } from '$lib/scroll';
	import { TYPEFACES } from '$lib/data/typefaces';
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

	// Desktop inline nav (unchanged)
	const NAV: NavItem[] = [
		{ label: 'Fonts', href: '/fonts' },
		{ label: 'About', href: '/about' },
		{ label: 'Buy', href: '/buy' }
	];

	// Mobile panel: typeface shortcuts + page links
	const fonts = TYPEFACES.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);
	const PAGES: NavItem[] = [
		{ label: 'Buy', href: '/buy' },
		{ label: 'About', href: '/about' },
		{ label: 'Contact', href: '/contact' }
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
	<!-- Mobile-only Menu / Close toggle -->
	<button
		class="Header__toggle"
		type="button"
		onclick={toggle}
		aria-expanded={open}
		aria-controls="primary-nav"
	>
		{open ? 'Close' : 'Menu'}
	</button>

	<!-- Desktop-only inline nav -->
	<nav class="Header__nav" aria-label="Primary navigation">
		{#each NAV as item (item.href)}
			<a class="Header__nav-link" href={item.href}>{item.label}</a>
		{/each}
	</nav>

	<a class="Header__logo" href="/" onclick={close} aria-label="August Type Foundry — home">
		<Logo height={30} />
	</a>
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
				</ul>
			</div>

			<ul class="MenuPanel__pages">
				{#each PAGES as item (item.href)}
					<li><a href={item.href} onclick={close}>{item.label}</a></li>
				{/each}
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
		/* Chairman directive 2026-05-16: top 15px, sides 10px, bottom 10px */
		padding: 15px 10px 10px;
		z-index: 100;
		font-family: 'Steiner', sans-serif;
		mix-blend-mode: difference;
		color: #fff;
		pointer-events: none;
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

	.Header__nav-link {
		font-size: 16px;
		font-weight: var(--fw-ui);
		color: inherit;
		text-decoration: none;
		letter-spacing: 0;
		padding: 4px 0;
	}

	.Header__logo {
		font-size: 20px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		color: inherit;
		letter-spacing: 0;
		padding: 4px 8px;
	}

	/* SP: logo 25px (overrides the SVG's inline height) */
	@media (max-width: 767px) {
		.Header__logo :global(.Logo) {
			height: 25px !important;
		}
	}

	@media (min-width: 768px) {
		.Header__toggle {
			display: none;
		}

		.Header__nav {
			display: flex;
		}

		.Header__logo {
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
		/* top padding clears the header row so the nav sits below the logo */
		padding: 55px var(--gutter, 20px) 16px;
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
	.MenuPanel__pages a {
		font-size: 11px;
		line-height: 1.5;
		letter-spacing: 0;
		color: #000;
		text-decoration: none;
		white-space: nowrap;
		transition: opacity 0.15s ease;
	}

	.MenuPanel__list a:hover,
	.MenuPanel__pages a:hover {
		opacity: 0.55;
	}

	@media (prefers-reduced-motion: reduce) {
		.MenuPanel {
			transition: none;
		}
	}
</style>
