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
</script>

<Header />

<PageTransition onPanelUp={() => getLenis()?.stop()} onComplete={() => getLenis()?.start()}>
	{@render children()}
	<Footer />
</PageTransition>
