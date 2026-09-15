<script lang="ts">
	// Ôgast site header.
	// Mobile (<768px): "Menu" toggle. Open state is a light top panel (Figma
	//   188:10): Close + Ôgast wordmark, a "Fonts" group of typeface links,
	//   and page links.
	// Desktop (≥768px): inline nav links on the left, no toggle.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { onScroll } from '$lib/scroll';
	import { TYPEFACES } from '$lib/data/typefaces';
	import { lang, LANG_OPTIONS, HEADER_LANG_CODES } from '$lib/state/lang.svelte';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { slide, fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let open = $state(false);

	// On the home page the header starts hidden (translated up) and reveals
	// on whichever comes first: the user scrolling, or the logo intro
	// animation reaching its own reveal beat (homeIntro.headerReady — see
	// that file's own comment). Other pages always show it; homeIntro is
	// ANDed with isHome below, so its value is inert everywhere else.
	let scrolled = $state(false);
	const isHome = $derived(page.url.pathname === '/');
	const hiddenTop = $derived(isHome && !scrolled && !open && !homeIntro.headerReady);

	onMount(() => {
		const update = () => {
			scrolled = window.scrollY > 8;
		};
		update();
		return onScroll(update);
	});

	type NavItem = { label: string; href: string };

	// Explicit buttons rather than one cycling toggle — clearer with more
	// than two, and each is self-describing (its own aria-label +
	// aria-pressed) without a separate sr-only announcement span. The header
	// shows only a subset (EN/FR/ES, at the user's choice) — Footer.svelte
	// shows the full LANG_OPTIONS list.
	const LANGS = LANG_OPTIONS.filter((l) => HEADER_LANG_CODES.includes(l.code));

	// Desktop inline nav. License -> /licensing, not /license — that shorter
	// URL is a stable redirect to /legal/eula baked into the shipped fonts'
	// own OpenType nameID 13/14 metadata (see Footer.svelte's LEGAL array).
	const NAV: NavItem[] = [
		{ label: 'Fonts', href: '/fonts' },
		{ label: 'Custom', href: '/custom' },
		{ label: 'License', href: '/licensing' },
		{ label: 'About', href: '/about' },
		{ label: 'Contact', href: '/contact' }
	];

	// Mobile panel: typeface shortcuts + page links
	const fonts = TYPEFACES.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);
	// Announced but not yet released: shown in the menu for completeness, dimmed
	// and inert. Meant for typefaces that stay out of TYPEFACES' visible set on
	// purpose, so /fonts and /fonts/[slug] keep 404-ing until there is a real
	// page to link to. Alfred and Asta were re-shown in TYPEFACES on 2026-08-29
	// (temporary, at the user's request) and so come through `fonts` above now —
	// left out here to avoid listing each of them twice. Put them back if
	// `hidden` in typefaces.ts is reverted to true.
	const UPCOMING: string[] = [];
	// Mirrors the desktop nav (the Fonts group above stands in for its "Fonts"
	// link, and the language switch is appended after these).
	const PAGES: NavItem[] = [
		{ label: 'Custom', href: '/custom' },
		{ label: 'License', href: '/licensing' },
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
	<!-- Rebrand trial (2026-09) — settled on "Ôgast" (circumflex), mark alone,
	     no "Type Family" suffix. Easy to revert to "August Type Family" or
	     flip back to the macron "Ōgast" variant if needed. -->
	<a class="Header__logo" href="/" onclick={close} aria-label="Ôgast — home"> Ôgast </a>

	<!-- Desktop-only inline nav -->
	<nav class="Header__nav" aria-label="Primary navigation">
		{#each NAV as item (item.href)}
			<a class="Header__nav-link" href={item.href}>{item.label}</a>
		{/each}
	</nav>

	<!-- Desktop-only right-hand group — language switch + the Figma end-state
	     header's Cart pairing (node 1:654) — one flex group so .Header's
	     three-way split (logo / nav / right) still works via plain
	     justify-content:space-between on .Header. -->
	<div class="Header__right">
		<!-- Three direct options rather than one cycling toggle — see the
		     LANGS note above. -->
		<div class="Header__langs" role="group" aria-label="Language">
			{#each LANGS as l (l.code)}
				<button
					type="button"
					class="Header__nav-link Header__lang"
					class:is-active={lang.current === l.code}
					onclick={() => lang.set(l.code)}
					aria-pressed={lang.current === l.code}
					aria-label={l.name}
				>
					{l.label}
				</button>
			{/each}
		</div>

		<!-- Inert (aria-disabled span, not a link) — there is no persistent
		     cart anywhere in this codebase (/buy is a direct Stripe
		     checkout), so this is the same "visually present, not wired up"
		     treatment already used elsewhere for not-yet-real features (e.g.
		     Alfred's "Coming Soon" on the home page). "Account" is hidden for
		     now, at the user's request (2026-09) — no account system exists
		     yet either. -->
		<div class="Header__cart" aria-hidden="true">
			<span class="Header__nav-link" aria-disabled="true">Cart (0)</span>
		</div>
	</div>

	<!-- Mobile-only: Menu/Close toggles the panel. Sits on the right; the logo
	     (above) takes the left. -->
	<div class="Header__actions">
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
				{#each LANGS as l (l.code)}
					<li>
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
					</li>
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
		/* Grid, not flex — the outer two columns are equal-width (1fr each),
		   so the centre nav sits at the true horizontal centre of the header
		   regardless of how wide the logo or the right-hand group are. A
		   flex row with justify-content:space-between only guarantees even
		   GAPS between items, not a centred middle one — logo/right widths
		   differ (especially now Cart-only vs Account+Cart), which was
		   visibly shifting the centre nav off-centre. */
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		/* No background — sits transparently over whatever's beneath it.
		   viewport-fit=cover lets this bar reach the true screen edge, so the
		   notch/Dynamic Island safe area is added on top of the 16px. */
		padding: calc(16px + env(safe-area-inset-top, 0px)) var(--padding) 12px;
		/* Kept high (not 1) so the fixed bar stays above z-indexed content sections. */
		z-index: 100;
		font-family: 'Norma', sans-serif;
		/* Auto-inverting text: no background (see the note above) plus
		   mix-blend-mode:difference on a white foreground reads as black
		   against a light backdrop (|255-255|=0) and white against a dark one
		   (|255-0|=255) — the header adapts to whatever scrolls under it
		   instead of needing a fixed color per section. */
		mix-blend-mode: difference;
		color: #fff;
		pointer-events: auto;
		transform: translateY(0);
		transition: transform 0.5s cubic-bezier(0.65, 0, 0.35, 1);
	}

	.Header > * {
		pointer-events: auto;
	}

	/* base.css's universal `div,...{color:var(--color-text)}` reset otherwise
	   sets every plain <div> inside the header to black — breaking the
	   mix-blend-mode:difference trick above for anything inside one, since a
	   BLACK source is difference-blend's identity element (|0-X|=X for any
	   backdrop X), i.e. invisible against literally any background. This bit
	   the mobile Menu toggle (.Header__actions) and the desktop right-hand
	   group (.Header__right/.Header__langs/.Header__cart) — both invisible
	   sitewide until this rule, found while adding the Account/Cart pairing.
	   .Header__nav-link's own color:inherit (on the <a>/<button>/<span>
	   leaves) only works if every ancestor div in between keeps inheriting
	   too, hence one blanket rule here rather than patching each div. */
	.Header div {
		color: inherit;
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

	/* Mobile-only: Menu/Close toggle, on the right. Desktop hides this in
	   favour of .Header__nav. Same grid column as .Header__right (the
	   desktop right-hand group) — only one of the two is ever visible at a
	   given breakpoint, so sharing column 3 is safe. */
	.Header__actions {
		grid-column: 3;
		justify-self: end;
		display: flex;
		align-items: center;
		gap: 4px;
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

	/* Wraps .Header__langs + .Header__cart into .Header's third (right-hand)
	   flex slot — hidden on mobile like its two children, shown as one flex
	   row on desktop below. */
	.Header__right {
		display: none;
		align-items: center;
	}

	/* Language switch group: its own flex group inside .Header__right.
	   Tighter gap than .Header__nav's 20px — three short codes read as one
	   switcher, not as three more nav items. */
	.Header__langs {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	/* Inactive options recede; the current language reads at full strength.
	   Each button's own aria-label/aria-pressed already announces its state,
	   so no separate sr-only span is needed here (unlike the old single
	   cycling toggle, which had one). */
	.Header__lang {
		opacity: 0.4;
		transition: opacity 0.15s ease;
	}

	.Header__lang:hover {
		opacity: 0.7;
	}

	.Header__lang.is-active {
		opacity: 1;
	}

	/* Inert (see the template comment) — half-strength, no pointer affordance.
	   Visibility comes from the .Header__right parent (mobile/desktop), not
	   from this rule. */
	.Header__cart {
		display: flex;
		gap: 20px;
		align-items: center;
		/* Separates the cart pairing from the language switch beside it. */
		margin-left: 20px;
	}

	.Header__cart .Header__nav-link {
		opacity: 0.4;
		cursor: default;
		pointer-events: none;
		user-select: none;
	}

	.Header__nav-link {
		font-size: 13px;
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

	/* Plain typed text now, same treatment as .Header__nav-link — not the
	   Logo.svelte wordmark (still used as-is elsewhere: Footer, home hero),
	   and no longer signal red — just inherits the header's own black.
	   Always column 1 (left), on every breakpoint. */
	.Header__logo {
		grid-column: 1;
		justify-self: start;
		font-size: 12px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		color: inherit;
		letter-spacing: 0;
		padding: 4px 8px;
	}

	/* SP: tighter header padding (PC's own padding lives below, in the
	   >=768px block) */
	@media (max-width: 767px) {
		.Header {
			padding: calc(12px + env(safe-area-inset-top, 0px)) 10px 8px;
		}
	}

	@media (min-width: 768px) {
		.Header {
			padding: 8px 20px;
		}

		.Header__actions {
			display: none;
		}

		/* Three-way split — logo (col 1) / nav (col 2) / right, langs+cart
		   (col 3) — see .Header's own grid-template-columns comment above
		   for why this is grid-column, not flex order. */
		.Header__logo {
			padding: 4px 0;
			/* Kept matching .Header__nav-link's size (PC only — mobile's logo
			   has no nav-link beside it to stay paired with). */
			font-size: 13px;
		}

		.Header__nav {
			display: flex;
			grid-column: 2;
		}

		.Header__right {
			display: flex;
			grid-column: 3;
			justify-self: end;
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
		font-family: 'Norma', sans-serif;
		/* top padding clears the (now solid, taller) header row so the nav sits below it;
		   add the same safe-area-inset-top the header itself carries */
		padding: calc(74px + env(safe-area-inset-top, 0px)) var(--gutter, 20px) 16px;
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
		flex-wrap: wrap;
		gap: 14px;
	}

	.MenuPanel__list a,
	.MenuPanel__pages a,
	.MenuPanel__lang {
		font-size: 16px;
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
		/* Inactive options recede; the current language reads at full
		   strength — same convention as the desktop .Header__lang group. */
		opacity: 0.4;
	}

	.MenuPanel__lang.is-active {
		opacity: 1;
	}

	/* Unreleased faces: same slot, half-strength, and never interactive. */
	.MenuPanel__soon {
		font-size: 16px;
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
