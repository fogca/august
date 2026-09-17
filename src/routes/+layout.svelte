<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import PageTransition from '$lib/stock/PageTransition.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { initScroll, destroyScroll, getLenis, refreshTriggers } from '$lib/scroll';
	import { lang } from '$lib/state/lang.svelte';

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

	onMount(() => destroyScroll);

	// New page content means new layout heights — recompute trigger positions.
	afterNavigate(() => refreshTriggers());

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

<PageTransition onPanelUp={() => getLenis()?.stop()} onComplete={() => getLenis()?.start()}>
	{@render children()}
	<Footer />
</PageTransition>
