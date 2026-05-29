<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import PageTransition from '$lib/stock/PageTransition.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();

	// We want Lenis + GSAP ScrollTrigger wired up BEFORE any child component's
	// onMount runs (Svelte mounts children before parents, so onMount in this
	// layout would be too late for ScrollVideo's ScrollTrigger.create call).
	// Running the bootstrap during component instantiation guarantees the
	// Lenis<->ScrollTrigger handshake is in place when triggers are created.
	let lenis: import('lenis').default | null = null;
	let tickerFn: ((time: number) => void) | null = null;

	if (browser) {
		bootstrapScroll();
	}

	async function bootstrapScroll() {
		const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
			import('lenis'),
			import('gsap'),
			import('gsap/ScrollTrigger')
		]);

		gsap.registerPlugin(ScrollTrigger);

		lenis = new Lenis();
		lenis.on('scroll', ScrollTrigger.update);

		tickerFn = (time: number) => lenis?.raf(time * 1000);
		gsap.ticker.add(tickerFn);
		gsap.ticker.lagSmoothing(0);

		// Expose for in-component debugging (read by ScrollVideo when debug=true)
		(window as Window & { __lenisInstance?: unknown }).__lenisInstance = lenis;

		// Refresh in case any trigger was created before this point
		ScrollTrigger.refresh();
		console.log('[layout] Lenis + ScrollTrigger ready');
	}

	onMount(() => {
		return () => {
			if (tickerFn) {
				import('gsap').then(({ gsap }) => gsap.ticker.remove(tickerFn!));
			}
			lenis?.destroy();
			lenis = null;
		};
	});
</script>

<Header />

<PageTransition onPanelUp={() => lenis?.stop()} onComplete={() => lenis?.start()}>
	{@render children()}
	<Footer />
</PageTransition>

<style>
	/* Override Stock PageTransition's `will-change: transform` so it doesn't
	   become the containing block for `position: fixed` descendants — required
	   for GSAP ScrollTrigger `pin: true` to anchor to the viewport correctly.
	   `!important` is needed because PageTransition's own scoped `.page-wrapper`
	   rule (added class = higher specificity) otherwise wins over this :global one. */
	:global(.page-wrapper) {
		will-change: auto !important;
	}
</style>
