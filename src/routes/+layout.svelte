<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import PageTransition from '$lib/stock/PageTransition.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { initScroll, destroyScroll, getLenis, refreshTriggers } from '$lib/scroll';

	let { children } = $props();

	// Bootstrap during component init — child components that create scroll
	// triggers await the same handshake via getScrollTrigger(), so ordering
	// is guaranteed regardless of mount order.
	if (browser) initScroll();

	onMount(() => destroyScroll);

	// New page content means new layout heights — recompute trigger positions.
	afterNavigate(() => refreshTriggers());
</script>

<Header />

<PageTransition onPanelUp={() => getLenis()?.stop()} onComplete={() => getLenis()?.start()}>
	{@render children()}
	<Footer />
</PageTransition>
