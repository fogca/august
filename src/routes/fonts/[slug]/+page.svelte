<script lang="ts">
	import { onMount } from 'svelte';
	import { onScroll, scrollToEl } from '$lib/scroll';
	import TypeTester from '$lib/components/TypeTester/TypeTester.svelte';
	import GlyphSpecimen from '$lib/components/fonts/GlyphSpecimen.svelte';
	import GlyphSet from '$lib/components/fonts/GlyphSet.svelte';
	import OpenTypeFeatures from '$lib/components/fonts/OpenTypeFeatures.svelte';
	import ImageGallery from '$lib/components/fonts/ImageGallery.svelte';
	import type { GalleryItem } from '$lib/components/fonts/ImageGallery.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Use $derived so these stay reactive if data changes on navigation
	const tf = $derived(data.typeface);
	const isAvailable = $derived(tf.status === 'available');

	// Fixed buy bar: hidden (translated down) at the top of the page; slides up
	// once scrolling starts; and slides back down before the footer (when main ends).
	let buybarVisible = $state(false);
	let mainEl: HTMLElement;
	onMount(() => {
		const update = () => {
			const scrolled = window.scrollY > 8;
			const atFooter = mainEl ? mainEl.getBoundingClientRect().bottom <= window.innerHeight : false;
			buybarVisible = scrolled && !atFooter;
		};
		update();
		return onScroll(update);
	});

	// Placeholder gallery items until real exports are dropped in (image-driven:
	// add `src` to each to show the export).
	const inUseItems: GalleryItem[] = [{}, {}, {}, {}];
	const otherItems: GalleryItem[] = [{}, {}, {}];

	// Smooth-scroll the fixed CTA to the on-page buy block.
	function scrollToBuy() {
		scrollToEl('#buy');
	}
</script>

<svelte:head>
	<title>{tf.name} — August Type Foundry</title>
	<meta name="description" content="{tf.tagline} {tf.classification}." />
</svelte:head>

<main class="FontDetail" bind:this={mainEl} style="--type-font: '{tf.fontFamily}';">
	<!-- 100vh top-view hero: full-screen media + centered wordmark + meta -->
	<section
		class="FontDetail__hero"
		class:has-media={!!(tf.heroVideo || tf.thumbnail)}
		class:white={!!(tf.heroVideo || tf.thumbnail)}
		style="background: {tf.theme.bg}; color: {tf.theme.fg};"
	>
		<div class="FontDetail__hero-bg">
			{#if tf.heroVideo}
				<video
					class="FontDetail__hero-media"
					src={tf.heroVideo}
					muted
					loop
					autoplay
					playsinline
					preload="auto"
					disablepictureinpicture
				></video>
			{:else if tf.thumbnail}
				<img class="FontDetail__hero-media" src={tf.thumbnail} alt="" />
			{:else}
				<div class="FontDetail__hero-placeholder" aria-hidden="true">
					<span class="FontDetail__hero-placeholder-name">{tf.name}</span>
				</div>
			{/if}
		</div>

		<nav class="FontDetail__nav" aria-label="Breadcrumb">
			<a href="/fonts" class="FontDetail__back">← Fonts</a>
		</nav>

		<div class="FontDetail__hero-center">
			<span class="FontDetail__hero-name">{tf.name}</span>
		</div>

		<div class="FontDetail__hero-foot">
			<p class="FontDetail__hero-label">{tf.hero.label}</p>
			<div class="FontDetail__hero-meta">
				<span>{tf.hero.vol}</span>
				<span>{tf.name}</span>
				<span class="FontDetail__hero-sub">{tf.hero.subtitle}</span>
				<span class="FontDetail__hero-debut">{tf.hero.debut}</span>
			</div>
		</div>
	</section>

	<!-- Body: name + tagline + description (normal scroll) -->
	<div class="FontDetail__body">
		<div class="FontDetail__info">
			<p class="FontDetail__classification">{tf.classification}</p>
			{#if !isAvailable}
				<span class="FontDetail__badge">In development</span>
			{/if}
		</div>
		<h1 class="FontDetail__name">{tf.name}</h1>
		<p class="FontDetail__tagline">{tf.tagline}</p>
		<p class="FontDetail__description">{tf.description}</p>
	</div>

	<TypeTester
		weights={tf.weights}
		fontFamily={tf.fontFamily}
		defaultTexts={tf.defaultTexts}
		available={isAvailable}
	/>

	<!-- A–Z / a–z / symbols — three large specimen rows -->
	<GlyphSpecimen fontFamily={tf.fontFamily} />

	<!-- Full glyph set -->
	<GlyphSet fontFamily={tf.fontFamily} title="Glyph set" />

	<!-- OpenType features (live OFF → ON demos) -->
	<OpenTypeFeatures fontFamily={tf.fontFamily} />

	<!-- In use -->
	<ImageGallery title="In Use" items={inUseItems} columns={2} ratio="16 / 10" />

	<!-- Other images -->
	<ImageGallery title="Other" items={otherItems} columns={3} ratio="4 / 5" />

	<!-- On-page buy block (the fixed CTA scrolls here) -->
	<section class="FontBuy" id="buy" aria-label="Buy {tf.name}">
		{#if isAvailable}
			<p class="FontBuy__eyebrow">License</p>
			<h2 class="FontBuy__heading">{tf.name}</h2>
			<p class="FontBuy__price">From €360 · perpetual license, pay once</p>
			<ul class="FontBuy__licenses">
				<li>Desktop</li>
				<li>Web</li>
				<li>App</li>
				<li>Books</li>
			</ul>
			<a class="FontBuy__cta" href="/buy?font={tf.slug}">Configure licenses &amp; buy →</a>
			<p class="FontBuy__note">
				12-weight variable family. Bundle multiple license types and save 17%.
			</p>
		{:else}
			<p class="FontBuy__eyebrow">In development</p>
			<h2 class="FontBuy__heading">{tf.name}</h2>
			<p class="FontBuy__price">Coming {tf.hero.debut}</p>
			<a class="FontBuy__cta" href="/contact">Get notified →</a>
		{/if}
	</section>
</main>

<!-- Fixed bottom purchase bar — hidden at the top, slides up once scrolling -->
<div class="FontDetail__buybar white" class:is-visible={buybarVisible}>
	<span class="FontDetail__buybar-label">{tf.name} · {tf.classification}</span>
	<button type="button" class="FontDetail__buybar-cta" onclick={scrollToBuy}>
		{isAvailable ? 'Buy — from €360' : 'Coming…'}
	</button>
</div>

<style>
	.FontDetail {
		/* padding-bottom leaves room for the fixed buy bar */
		padding-bottom: 72px;
	}

	/* ── 100vh top hero ── */
	.FontDetail__hero {
		position: relative;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
	}

	.FontDetail__hero-bg {
		position: absolute;
		inset: 0;
	}

	.FontDetail__hero-media {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.FontDetail__hero-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.FontDetail__hero-placeholder-name {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(80px, 22vw, 360px);
		line-height: 1;
		letter-spacing: 0;
		color: currentColor;
		opacity: 0.1;
		user-select: none;
	}

	.FontDetail__nav {
		position: absolute;
		top: 0;
		left: 0;
		padding: 64px var(--gutter) 0;
		z-index: 2;
	}

	.FontDetail__back {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		color: currentColor;
		text-decoration: none;
		letter-spacing: 0;
		opacity: 0.85;
	}

	.FontDetail__hero-center {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 1;
	}

	.FontDetail__hero-name {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(40px, 9vw, 120px);
		line-height: 1.2;
		letter-spacing: 0;
		color: currentColor;
	}

	.FontDetail__hero-foot {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: var(--gutter);
		display: flex;
		flex-direction: column;
		gap: 8px;
		z-index: 2;
	}

	.FontDetail__hero-label {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.5;
		letter-spacing: 0;
		opacity: 0.9;
		margin: 0;
	}

	.FontDetail__hero-meta {
		display: flex;
		gap: 14px;
		align-items: baseline;
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.4;
		letter-spacing: 0;
	}

	.FontDetail__hero-sub {
		opacity: 0.75;
	}

	.FontDetail__hero-debut {
		margin-left: auto;
	}

	/* Hero text over media is plain white (via `.white` on the hero) — no inversion. */

	/* ── Body ── */
	.FontDetail__body {
		padding: 64px var(--padding) 40px;
		max-width: 720px;
	}

	.FontDetail__info {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.FontDetail__classification {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		color: var(--color-text-mute);
		letter-spacing: 0;
		margin: 0;
	}

	.FontDetail__badge {
		font-family: 'Steiner', sans-serif;
		font-size: 10px;
		letter-spacing: 0;
		color: var(--color-text-mute);
		border: 1px solid var(--color-line);
		padding: 2px 8px;
		opacity: 0.7;
	}

	.FontDetail__name {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(36px, 7vw, 72px);
		line-height: 1.05;
		letter-spacing: 0;
		margin: 0 0 16px;
	}

	.FontDetail__tagline {
		font-family: 'Steiner', sans-serif;
		font-size: 18px;
		line-height: 1.4;
		letter-spacing: 0;
		margin: 0 0 16px;
		max-width: 56ch;
	}

	@media (min-width: 768px) {
		.FontDetail__tagline {
			font-size: 22px;
		}
	}

	.FontDetail__description {
		/* size/line-height from base p (12px) */
		letter-spacing: 0;
		color: var(--color-text-mute);
		max-width: 64ch;
		margin: 0;
	}

	/* ── On-page buy block ── */
	.FontBuy {
		padding: 96px var(--padding) 0;
		border-top: 1px solid var(--color-line);
		max-width: 640px;
	}

	.FontBuy__eyebrow {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-mute);
		margin: 0 0 16px;
	}

	.FontBuy__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(32px, 6vw, 56px);
		line-height: 1.05;
		letter-spacing: 0;
		margin: 0 0 12px;
	}

	.FontBuy__price {
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		letter-spacing: 0;
		margin: 0 0 24px;
	}

	.FontBuy__licenses {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		list-style: none;
		padding: 0;
		margin: 0 0 32px;
	}

	.FontBuy__licenses li {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		letter-spacing: 0;
		padding: 6px 14px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		color: var(--color-text);
	}

	.FontBuy__cta {
		display: inline-block;
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		text-decoration: none;
		color: var(--color-bg);
		background: var(--color-text);
		padding: 14px 28px;
		transition: opacity 0.15s ease;
	}

	.FontBuy__cta:hover {
		opacity: 0.85;
	}

	.FontBuy__note {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		line-height: 1.5;
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin: 20px 0 0;
		max-width: 48ch;
	}

	/* ── Fixed bottom purchase bar ── */
	.FontDetail__buybar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 60;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 0 var(--gutter);
		background: var(--color-text);
		color: var(--color-bg);
		/* hidden below the fold until scrolling starts */
		transform: translateY(100%);
		transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
	}

	.FontDetail__buybar.is-visible {
		transform: translateY(0);
	}

	.FontDetail__buybar-label {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		letter-spacing: 0;
		opacity: 0.85;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.FontDetail__buybar-cta {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		color: var(--color-bg);
		background: transparent;
		border: 0;
		cursor: pointer;
		padding: 0;
		white-space: nowrap;
		transition: opacity 0.15s ease;
	}

	.FontDetail__buybar-cta:hover {
		opacity: 0.7;
	}

	/* All page content (not header/footer) uses the typeface's own font.
	   `--type-font` is set on .FontDetail; !important overrides the components'
	   hardcoded 'Steiner'. */
	.FontDetail :global(*) {
		font-family: var(--type-font, 'Steiner'), 'Steiner', sans-serif !important;
	}
</style>
