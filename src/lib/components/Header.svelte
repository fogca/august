<script lang="ts">
	// Ōgast site header.
	// Mobile (<768px): right-hand group is a language pulldown, an inert
	//   Cart(0), and a two-bar Menu icon that becomes an X when open
	//   (2026-09, at the user's request — was a single "Menu"/"Close" text
	//   toggle before, with no language switch of its own in the collapsed
	//   bar; picking a language used to only be possible from inside the
	//   open panel). Open state is a light top panel (Figma 188:10): Close +
	//   Ōgast wordmark, a "Fonts" group of typeface links, and page links —
	//   its own language buttons were removed once the collapsed bar grew
	//   one of its own, rather than offering the same switch twice.
	// Desktop (≥768px): inline nav links on the left, no toggle.
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { onScroll } from '$lib/scroll';
	import { TYPEFACES } from '$lib/data/typefaces';
	import { SITE_NAV } from '$lib/data/nav';
	import { lang, LANG_OPTIONS, type Lang } from '$lib/state/lang.svelte';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { headerSolid } from '$lib/state/headerSolid.svelte';
	import { slide, fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Logo from '$lib/components/Logo.svelte';

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

	// Explicit buttons rather than one cycling toggle — clearer with more
	// than two, and each is self-describing (its own aria-label +
	// aria-pressed) without a separate sr-only announcement span. Header and
	// Footer show the exact same four codes now (2026-09, at the user's
	// request, "Headerも共通で" — DA and CH were both dropped, and Header no
	// longer shows a smaller subset of Footer's own list).
	const LANGS = LANG_OPTIONS;

	// Desktop inline nav — the shared list verbatim (see $lib/data/nav.ts).
	const NAV = SITE_NAV;

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
	// Mirrors the desktop nav minus Fonts — the mobile panel's own "Fonts"
	// group (above) already stands in for that one link.
	const PAGES = SITE_NAV.filter((item) => item.href !== '/fonts');

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

<header
	class="Header"
	class:is-open={open}
	class:is-hidden-top={hiddenTop}
	class:is-solid={headerSolid.active}
>
	<!-- The real wordmark (Logo.svelte) rather than plain text (2026-09, at
	     the user's request) — the same artwork IntroHero.svelte animates on
	     the home page, at rest. label='' — this link's own aria-label
	     already names it. -->
	<a class="Header__logo" href="/" onclick={close} aria-label="Ōgast — home">
		<Logo height={14} label="" />
	</a>

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
		     yet either. Mobile carries the same inert Cart — see
		     .Header__actions below. -->
		<div class="Header__cart" aria-hidden="true">
			<span class="Header__nav-link" aria-disabled="true">Cart (0)</span>
		</div>
	</div>

	<!-- Mobile-only: language pulldown, inert Cart(0), Menu/Close icon toggle
	     — in that order. Sits on the right; the logo (above) takes the left.
	     A native <select> for the language switch (not the desktop's row of
	     buttons — no room for three separate targets here): it already comes
	     with its own accessible, touch-friendly picker UI on every mobile
	     browser, so there's nothing bespoke to build. -->
	<div class="Header__actions">
		<select
			class="Header__lang-select"
			aria-label="Language"
			value={lang.current}
			onchange={(e) => lang.set(e.currentTarget.value as Lang)}
		>
			{#each LANGS as l (l.code)}
				<option value={l.code}>{l.label}</option>
			{/each}
		</select>

		<div class="Header__cart" aria-hidden="true">
			<span class="Header__nav-link" aria-disabled="true">Cart (0)</span>
		</div>

		<button
			class="Header__toggle"
			type="button"
			onclick={toggle}
			aria-expanded={open}
			aria-controls="primary-nav"
			aria-label={open ? 'Close menu' : 'Open menu'}
		>
			<!-- Two bars (w:25px, gap:6px, per the user's own spec) that rotate
			     into an X when the panel is open — the icon equivalent of the
			     old text swap between "Menu" and "Close". -->
			<span class="Header__toggle-icon" class:is-open={open} aria-hidden="true">
				<span class="Header__toggle-bar"></span>
				<span class="Header__toggle-bar"></span>
			</span>
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

			<!-- Language switching lives in the collapsed header's own pulldown
			     now (see .Header__actions) — not repeated here as a second
			     set of controls for the same thing. -->
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

	/* Same opt-out, asked for by a section rather than by the menu: over the
	   home page's raining-glyph canvas the backdrop changes per PIXEL, so a
	   difference blend tears the wordmark into black and white fragments many
	   times a second. Driven by $lib/state/headerSolid.svelte.ts. The menu's own
	   is-open wins over this one (it is declared first but with equal
	   specificity, so order matters — keep this AFTER it only for the solid
	   colour, and let is-open re-assert black below). */
	.Header.is-solid {
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
		/* Three distinct controls now (language / Cart / Menu icon), not one
		   button — wider than the old 4px so they read as separate targets. */
		gap: 16px;
	}

	/* This group's own Cart doesn't need .Header__cart's desktop spacing
	   (that assumed it followed the button row of .Header__langs) —
	   .Header__actions' own gap already separates every child evenly. */
	.Header__actions .Header__cart {
		margin-left: 0;
	}

	/* Language pulldown — a plain, unstyled-chrome <select> (appearance:none)
	   rather than the desktop's row of three buttons: no room here for three
	   separate tap targets, and a native select already comes with its own
	   accessible picker UI on every mobile browser. base.css's universal
	   reset doesn't list `select` among the tags it forces a colour onto, so
	   `color: inherit` here is just normal inheritance from the button —
	   not a fix for that reset the way the icon bars below need (see that
	   rule's own comment). */
	.Header__lang-select {
		appearance: none;
		-webkit-appearance: none;
		background: transparent;
		border: 0;
		color: inherit;
		font: inherit;
		font-size: 13px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		padding: 4px 0;
		cursor: pointer;
	}

	/* The dropdown's own OPTIONS render in a native, OS-drawn popover outside
	   this page's mix-blend-mode:difference context — that context is what
	   normally makes the trigger's own text legible against light or dark
	   (see .Header's own comment on the technique), so it can't be relied on
	   here. Fixed colour instead, same as any ordinary popover UI. */
	.Header__lang-select option {
		color: #000;
		background: #fff;
	}

	.Header__toggle {
		background: transparent;
		border: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		color: inherit;
	}

	/* Two bars, per the user's own spec (w:25px, gap:6px) — base.css's own
	   universal `span { color: ... }` reset re-asserts on EVERY span
	   individually (inheritance doesn't skip it), so both this wrapper and
	   the bars themselves need their own explicit `color: inherit` — one
	   level's fix doesn't carry down to the next. Rotates into an X when
	   open, the icon equivalent of the old text swap between "Menu"/"Close". */
	.Header__toggle-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 25px;
		gap: 6px;
		color: inherit;
	}

	.Header__toggle-bar {
		display: block;
		width: 100%;
		height: 1px;
		background: currentColor;
		color: inherit;
		transition:
			transform 0.25s ease,
			opacity 0.2s ease;
	}

	/* Half of (gap + bar thickness) = 3.5px — moves each bar to the shared
	   centre line it needs to pivot around to form a clean X. */
	.Header__toggle-icon.is-open .Header__toggle-bar:first-child {
		transform: translateY(3.5px) rotate(45deg);
	}

	.Header__toggle-icon.is-open .Header__toggle-bar:last-child {
		transform: translateY(-3.5px) rotate(-45deg);
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

	/* The Logo wordmark (SVG, currentColor) — inherits the header's own
	   colour/blend-mode chain same as .Header__nav-link used to. Always
	   column 1 (left), on every breakpoint. */
	.Header__logo {
		grid-column: 1;
		justify-self: start;
		display: flex;
		align-items: center;
		color: inherit;
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
	.MenuPanel__pages a {
		font-size: 16px;
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
