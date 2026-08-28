<script lang="ts">
	import TypeTester from '$lib/components/TypeTester/TypeTester.svelte';
	import GlyphSet from '$lib/components/fonts/GlyphSet.svelte';
	import GlyphShowcase from '$lib/components/fonts/GlyphShowcase.svelte';
	import OpenTypeFeatures from '$lib/components/fonts/OpenTypeFeatures.svelte';
	import GlyphCycle from '$lib/components/fonts/GlyphCycle.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Use $derived so these stay reactive if data changes on navigation
	const tf = $derived(data.typeface);
	const isAvailable = $derived(tf.status === 'available');


</script>

<svelte:head>
	<title>{tf.name} — August Type Foundry</title>
	<meta name="description" content="{tf.tagline} {tf.classification}." />
</svelte:head>

<main class="FontDetail" style="--type-font: '{tf.fontFamily}';">
	<!-- 100vh top-view hero: full-screen media + centered wordmark + meta -->
	<section
		class="FontDetail__hero"
		class:has-media={!!(tf.heroGlyphCycle || tf.heroVideo || tf.thumbnail)}
		class:white={!!(tf.heroGlyphCycle || tf.heroVideo || tf.thumbnail)}
		style="background: {tf.theme.bg}; color: {tf.theme.fg};"
	>
		<div class="FontDetail__hero-bg">
			{#if tf.heroGlyphCycle}
				<GlyphCycle />
			{:else if tf.heroVideo}
				<video
					class="FontDetail__hero-media FontDetail__hero-video"
					src={tf.heroVideo}
					muted
					loop
					autoplay
					playsinline
					preload="auto"
					disablepictureinpicture
				></video>
			{:else if tf.thumbnail}
				<img class="FontDetail__hero-media" src={tf.thumbnail} alt={tf.imageCredit ?? ''} />
			{:else}
				<div class="FontDetail__hero-placeholder" aria-hidden="true">
					<span class="FontDetail__hero-placeholder-name">{tf.name}</span>
				</div>
			{/if}
		</div>

		{#if tf.imageCredit && !tf.heroGlyphCycle}
			<!-- Photo credit / colophon — museum-label style, top-right -->
			<p class="FontDetail__hero-credit">{tf.imageCredit}</p>
		{/if}

		{#if !tf.heroGlyphCycle && !tf.heroVideo}
			<!-- The cycling alphabet and the wght-sweep video are both centrepieces
			     on their own; a wordmark on top of either would just collide. -->
			<div class="FontDetail__hero-center">
				<span class="FontDetail__hero-name">{tf.name}</span>
			</div>
		{/if}

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
		{#if !isAvailable}
			<div class="FontDetail__info">
				<span class="FontDetail__badge">Coming Soon</span>
			</div>
		{/if}
		<h1 class="FontDetail__name">{tf.name}</h1>
		<p class="FontDetail__tagline">{tf.tagline}</p>
		<p class="FontDetail__description">{tf.description}</p>
		{#if tf.descriptionDa}
			<p class="FontDetail__description-da" lang="da">{tf.descriptionDa}</p>
		{/if}
	</div>

	<TypeTester
		weights={tf.weights}
		fontFamily={tf.fontFamily}
		defaultTexts={tf.defaultTexts}
		available={isAvailable}
	/>

	<!-- Full glyph set -->
	<GlyphSet fontFamily={tf.fontFamily} title="Glyph set" />

	<!-- Editorial showcase — currency / punctuation / symbols / fractions,
	     each set large on its own row. Flows directly into OpenType Features
	     below (same black ground, no seam). -->
	<GlyphShowcase fontFamily={tf.fontFamily} />

	<!-- OpenType features (live OFF → ON demos) -->
	<OpenTypeFeatures fontFamily={tf.fontFamily} />

	<!-- On-page buy block (the fixed CTA scrolls here) -->
	<section class="FontBuy" id="buy" aria-label="Buy {tf.name}">
		{#if isAvailable}
			<p class="FontBuy__eyebrow">License</p>
			<h2 class="FontBuy__heading">{tf.name}</h2>
			<p class="FontBuy__price">From €420 · perpetual license, pay once</p>
			<ul class="FontBuy__licenses">
				<li>Desktop</li>
				<li>Web</li>
				<li>App</li>
				<li>Books</li>
			</ul>
			<a class="FontBuy__cta" href="/buy?font={tf.slug}">Configure licenses &amp; buy →</a>
			<p class="FontBuy__note">
				20 weights — Hairline to Ultra. Educational licences −30%.
			</p>
		{:else}
			<p class="FontBuy__eyebrow">Coming Soon</p>
			<h2 class="FontBuy__heading">{tf.name}</h2>
			<p class="FontBuy__price">In development — released in due course.</p>
			<a class="FontBuy__cta" href="/contact">Get notified →</a>
		{/if}
	</section>
</main>

<!-- Fixed bottom purchase bar — hidden for now. The on-page buy block
     (#buy) is the only purchase entry point. To restore, bring back the
     scroll listener that drove `buybarVisible` along with this markup. -->

<style>
	.FontDetail {
		/* was 72px to clear the fixed buy bar, which is hidden for now */
		padding-bottom: 0;
	}

	/* ── 100vh top hero ── */
	.FontDetail__hero {
		position: relative;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
	}

	/* SP: square (1:1), not full viewport height — height driven by width. */
	@media (max-width: 767.98px) {
		.FontDetail__hero {
			height: 100vw;
		}
	}

	/* PC: a 60vh band rather than a full screen, so the name and the body copy
	   below it are already in view on landing. */
	@media (min-width: 768px) {
		.FontDetail__hero {
			height: 60vh;
			height: 60dvh;
		}
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

	/* Zoomed in past a plain cover-fit — the "a" row reads as a few large
	   glyphs rather than a smaller repeating strip, matching how large the
	   same video plays on the home page. */
	.FontDetail__hero-video {
		transform: scale(1.6);
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

	/* Photo credit — small, muted, top-right (museum-label style).
	   Compact on mobile, roomier on desktop. */
	.FontDetail__hero-credit {
		position: absolute;
		top: 0;
		right: 0;
		padding: 56px var(--gutter) 0;
		max-width: 168px;
		text-align: right;
		font-family: 'Steiner', sans-serif;
		font-size: 9px;
		line-height: 1.45;
		letter-spacing: 0;
		color: currentColor;
		opacity: 0.55;
		margin: 0;
		z-index: 2;
	}

	@media (min-width: 768px) {
		.FontDetail__hero-credit {
			padding-top: 64px;
			max-width: 280px;
			font-size: 10px;
			line-height: 1.5;
			opacity: 0.6;
		}
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

	/* PC: a flat 30px inset — same specificity as the rule above, so it has to
	   come after it to win. */
	@media (min-width: 768px) {
		.FontDetail__hero-foot {
			padding: 30px;
		}
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
		margin-inline: auto;
		text-align: center;
	}

	.FontDetail__info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 16px;
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
		font-size: 48px;
		font-weight: var(--fw-base);
		line-height: 1.05;
		letter-spacing: 0;
		margin: 0 0 16px;
	}

	.FontDetail__tagline {
		font-family: 'Steiner', sans-serif;
		font-size: 18px;
		line-height: 1.4;
		letter-spacing: 0;
		/* max-width narrower than .FontDetail__body makes this its own box —
		   text-align:center on the parent only centers text INSIDE that box,
		   not the box itself, so without margin-inline:auto it sits flush left
		   (visibly off-centre under the h1 above it). */
		margin: 0 auto 16px;
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
		color: var(--color-text);
		text-align: center;
		max-width: 64ch;
		/* Same fix as .FontDetail__tagline — margin-inline:auto centres the box
		   itself, not just the text inside it. */
		margin: 0 auto;
	}

	/* Japanese running translation — Tazugane Light, ~1.75px smaller than the
	   Latin. Latin runs inside JA use the page typeface (var(--type-font)).
	   font-family needs !important to beat the page-wide :global(*) font rule. */
	/* Danish runs in the typeface itself — no CJK fallback stack needed now that
	   the secondary language is Latin. Lighter and slightly smaller so it reads
	   as a translation under the English, not as a second headline. */
	.FontDetail .FontDetail__description-da {
		font-family: var(--type-font, 'Steiner'), sans-serif !important;
		font-weight: 300;
		font-size: calc(var(--fs-p) - 1px);
		line-height: 1.7;
		opacity: 0.75;
		letter-spacing: 0;
		color: var(--color-text);
		text-align: center;
		max-width: 64ch;
		/* Same centred-box fix as .FontDetail__description above it. */
		margin: 12px auto 0;
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

	/* The fixed bottom purchase bar was removed here along with its markup.
	   Restore both from git history if it comes back. */

	/* All page content (not header/footer) uses the typeface's own font.
	   `--type-font` is set on .FontDetail; !important overrides the components'
	   hardcoded 'Steiner'. */
	.FontDetail :global(*) {
		font-family: var(--type-font, 'Steiner'), 'Steiner', sans-serif !important;
	}
</style>
