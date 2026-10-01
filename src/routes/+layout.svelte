<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import PageTransition from '$lib/stock/PageTransition.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { initScroll, destroyScroll, getLenis, refreshTriggers } from '$lib/scroll';
	import { lang } from '$lib/state/lang.svelte';
	import { homeIntro } from '$lib/state/homeIntro.svelte';

	let { children } = $props();

	// Bootstrap during component init — child components that create scroll
	// triggers await the same handshake via getScrollTrigger(), so ordering
	// is guaranteed regardless of mount order.
	if (browser) initScroll();

	// Sync the store from the session (app.html's inline script already set
	// <html data-lang> pre-paint — this reconciles the store so the Header's
	// label matches). Runs during init, not onMount, so it settles before the
	// first render.
	if (browser) lang.restore();

	// Mirror the chosen language onto <html data-lang>; the show/hide CSS on
	// bilingual pages keys off that attribute.
	$effect(() => {
		if (browser) document.documentElement.dataset.lang = lang.current;
	});

	// Page theme (2026-10 redesign): white for the home page, blue on peach
	// everywhere else — see base.css's html[data-theme] rule. The server sets
	// it for the first paint (hooks.server.ts); this keeps it in step on
	// client-side navigation. Runs once the new page has rendered, by which
	// time the transition panel already covers the old one.
	const themeFor = (path: string) => (path === '/' ? 'home' : 'page');
	$effect(() => {
		if (browser) document.documentElement.dataset.theme = themeFor(page.url.pathname);
	});

	// The transition panel the new page fades in over — matched to that
	// page's own background so the hand-off doesn't flash a third colour.
	// Read from base.css's own tokens rather than repeated here.
	const PANEL_TOKENS = { home: '--white', page: '--brand-peach' } as const;
	const panelColorFor = (path: string) =>
		getComputedStyle(document.documentElement)
			.getPropertyValue(PANEL_TOKENS[themeFor(path)])
			.trim();

	onMount(() => destroyScroll);

	// New page content means new layout heights — recompute trigger positions.
	afterNavigate(() => refreshTriggers());

	// Any in-app navigation (never fired for the initial load): from here on
	// the home page's opening is skipped — see HomeTop.svelte.
	onNavigate(() => {
		homeIntro.inApp = true;
	});

	// PWA wiring -- injectRegister:'auto' (vite.config.ts) only patches a
	// static index.html, which doesn't exist here (this app is SSR'd fresh
	// per request, not prerendered), so neither the manifest <link> nor the
	// service worker registration ever reaches a real page without doing
	// both by hand, client-side only: virtual:pwa-info's `pwaInfo` is
	// `undefined` during SSR by the plugin's own design, so this can't run
	// at the top level or in a $derived -- it has to wait for onMount.
	// (Same fix as the sibling OTIF/Mokuseki projects, where this was
	// traced to two bugs: this missing wiring, and a navigateFallback that
	// broke offline navigation outright -- avoided here from the start via
	// workbox.navigateFallback: undefined above.)
	let webManifestLink = $state('');
	onMount(() => {
		import('virtual:pwa-info').then(({ pwaInfo }) => {
			if (pwaInfo) webManifestLink = pwaInfo.webManifest.linkTag;
		});
		// registerType:'autoUpdate' means updates apply silently on the next
		// load -- no "new version available" prompt UI to wire up, so the
		// plain vanilla register is enough (not the Svelte-store-returning
		// virtual:pwa-register/svelte, which exists for building that prompt).
		import('virtual:pwa-register').then(({ registerSW }) => {
			registerSW({ immediate: true });
		});
	});
</script>

<svelte:head>
	<!-- Empty until onMount resolves virtual:pwa-info (SSR-safe: see PWA wiring above). -->
	{@html webManifestLink}
</svelte:head>

<Header />

<PageTransition
	panelColor={panelColorFor}
	onPanelUp={() => getLenis()?.stop()}
	onComplete={() => getLenis()?.start()}
>
	<!-- Room for the Header's large top-of-page wordmark (base.css
	     --masthead-h). The home page lays out its own top around it. -->
	{#if page.url.pathname !== '/'}
		<div class="Masthead" aria-hidden="true"></div>
	{/if}
	{@render children()}
	<Footer />
</PageTransition>

<style>
	.Masthead {
		height: var(--masthead-h);
	}
</style>
