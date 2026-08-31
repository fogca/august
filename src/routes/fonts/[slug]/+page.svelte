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
	// Elio only has 52 letters and no OpenType features drawn yet — Glyph
	// set / Beyond A-Z / OpenType below are swapped for a plain sample-text
	// block on its page (see the {#if isElio} further down). GlyphSet itself
	// still supports a narrower glyphs/weights prop set (see elioGlyphs.ts)
	// for whenever Elio wants its own glyph inspector back.
	const isElio = $derived(tf.slug === 'elio');


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

	</section>

	<!-- Body: oversized name, then description (left) and the spec table (right) -->
	<div class="FontDetail__body">
		{#if !isAvailable}
			<div class="FontDetail__info">
				<span class="FontDetail__badge">Coming Soon</span>
			</div>
		{/if}

		{#if tf.info}
			<!-- SP only: a shorter spec summary (Collection/Formats/Glyphs/
			     Supported languages — Information/Design/Release dropped) shown
			     above the name instead of down in .FontDetail__cols, where the
			     full .FontDetail__spec aside still renders for PC (see its own
			     SP display:none below). -->
			<dl class="FontDetail__spec-grid FontDetail__spec-grid--sp">
				<div class="FontDetail__spec-item">
					<dt>Collection</dt>
					<dd>{tf.info.collection}</dd>
				</div>
				<div class="FontDetail__spec-item">
					<dt>Formats</dt>
					<dd>{tf.info.formats}</dd>
				</div>
				<div class="FontDetail__spec-item">
					<dt>Glyphs</dt>
					<dd>{tf.info.glyphs}</dd>
				</div>
				<div class="FontDetail__spec-item">
					<dt>Supported languages</dt>
					<dd>{tf.info.languages}</dd>
				</div>
			</dl>
		{/if}

		<h1 class="FontDetail__name">{tf.name}</h1>

		<div class="FontDetail__cols">
			<div class="FontDetail__text">
				<p class="FontDetail__tagline">{tf.tagline}</p>
				<p class="FontDetail__description">{tf.description}</p>
				{#if tf.descriptionDa}
					<p class="FontDetail__description-da" lang="da">{tf.descriptionDa}</p>
				{/if}
			</div>

			{#if tf.info}
				<aside class="FontDetail__spec" aria-label="Information">
					<p class="FontDetail__spec-title">Information</p>
					<dl class="FontDetail__spec-grid">
						<div class="FontDetail__spec-item">
							<dt>Design</dt>
							<dd>{tf.info.design}</dd>
						</div>
						<div class="FontDetail__spec-item">
							<dt>Release</dt>
							<dd>{tf.info.release}</dd>
						</div>
						<div class="FontDetail__spec-item">
							<dt>Collection</dt>
							<dd>{tf.info.collection}</dd>
						</div>
						<div class="FontDetail__spec-item">
							<dt>Formats</dt>
							<dd>{tf.info.formats}</dd>
						</div>
						<div class="FontDetail__spec-item">
							<dt>Glyphs</dt>
							<dd>{tf.info.glyphs}</dd>
						</div>
						<div class="FontDetail__spec-item">
							<dt>Supported languages</dt>
							<dd>{tf.info.languages}</dd>
						</div>
					</dl>
				</aside>
			{/if}
		</div>
	</div>

	<TypeTester
		weights={tf.weights}
		fontFamily={tf.fontFamily}
		defaultTexts={tf.defaultTexts}
		defaultNotes={tf.defaultNotes}
		available={isAvailable}
	/>

	{#if isElio}
		<!-- Elio only has 52 letters and no OpenType features yet — the Glyph
		     set / Beyond A-Z / OpenType sections below would mostly show
		     .notdef/tofu or empty demos. A plain sample-text block instead,
		     using only characters actually in Elio's cmap (letters, comma,
		     period, hyphen, space — no digits/other punctuation drawn on
		     purpose here, keep it simple). -->
		<section class="ElioSample" aria-label="Sample text">
			<p class="ElioSample__label">Sample text</p>
			<p class="ElioSample__text" style="font-family: '{tf.fontFamily}', sans-serif;">
				Elio is a sibling to Norma, drawn in Hair so far. More weights follow soon.
				Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
				incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
				nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
				fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
				culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde
				omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
				rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
				beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
				aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui
				ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum
				quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi
				tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
			</p>
		</section>
	{:else}
		<!-- Full glyph set -->
		<GlyphSet fontFamily={tf.fontFamily} name={tf.name} title="Glyph set" weights={tf.weights} />

		<!-- Editorial showcase — currency / punctuation / symbols / fractions,
		     each set large on its own row. -->
		<GlyphShowcase fontFamily={tf.fontFamily} />

		<!-- OpenType features (live OFF → ON demos) — hidden 2026-08-31 at the
		     user's request (temporary, "一旦"). Re-add
		     <OpenTypeFeatures fontFamily={tf.fontFamily} /> here when ready. -->
	{/if}

	<!-- On-page buy block (the fixed CTA scrolls here) -->
	<section class="FontBuy" id="buy" aria-label="Buy {tf.name}">
		{#if isAvailable}
			<p class="FontBuy__eyebrow">License</p>
			<h2 class="FontBuy__heading">{tf.name}</h2>
			<p class="FontBuy__price">From €300 · perpetual license, pay once</p>
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
			<a class="FontBuy__cta" href="/contact">Stay tuned →</a>
		{/if}
	</section>
</main>

<!-- Fixed bottom purchase bar — hidden for now. The on-page buy block
     (#buy) is the only purchase entry point. To restore, bring back the
     scroll listener that drove `buybarVisible` along with this markup. -->

<style>
	.FontDetail {
		padding: 40px 0 40px;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
		font-size: clamp(40px, 9vw, 120px);
		line-height: 1.2;
		letter-spacing: 0;
		color: currentColor;
	}







	/* Hero text over media is plain white (via `.white` on the hero) — no inversion. */

	/* ── Body ── */
	.FontDetail__body {
		padding: 64px var(--padding) 40px;
		text-align: left;
	}

	/* Description left, spec table right — stacked on phones. */
	.FontDetail__cols {
		display: grid;
		gap: 40px;
		margin-top: 32px;
	}

	.FontDetail__text {
		max-width: 62ch;
	}

	@media (min-width: 768px) {
		.FontDetail__cols {
			grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
			gap: 64px;
			align-items: start;
		}
	}

	.FontDetail__spec-title {
		font-family: 'Norma', sans-serif;
		font-size: 14px;
		line-height: 1.5;
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin: 0 0 20px;
	}

	/* Two columns of label/value pairs, filled row-wise:
	   Design | Release / Collection | Formats / Glyphs | Languages */
	.FontDetail__spec-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 24px 32px;
		margin: 0;
	}

	.FontDetail__spec-item dt {
		font-family: 'Norma', sans-serif;
		font-size: 14px;
		line-height: 1.5;
		letter-spacing: 0;
		color: var(--color-text-mute);
	}

	.FontDetail__spec-item dd {
		font-family: 'Norma', sans-serif;
		font-size: 14px;
		line-height: 1.5;
		letter-spacing: 0;
		margin: 0;
	}

	/* SP-only spec summary shown above the name (see the template) — hidden
	   on PC, where the full .FontDetail__spec aside (Information/Design/
	   Release included) still renders in its usual place. */
	.FontDetail__spec-grid--sp {
		display: none;
	}

	@media (max-width: 767.98px) {
		.FontDetail__spec-grid--sp {
			display: grid;
			margin-bottom: 0;
		}

		.FontDetail__spec {
			display: none;
		}
	}

	.FontDetail__info {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.FontDetail__badge {
		font-family: 'Norma', sans-serif;
		font-size: 10px;
		letter-spacing: 0;
		color: var(--color-text-mute);
		border: 1px solid var(--color-line);
		padding: 2px 8px;
		opacity: 0.7;
	}

	/* The name is the specimen here: 120px on phones, 320px from tablet up. */
	.FontDetail__name {
		font-family: 'Norma', sans-serif;
		font-size: 72px;
		font-weight: var(--fw-base);
		line-height: 1;
		letter-spacing: 0;
		margin: 0;
	}

	/* SP: pinned to the bottom of the first view. The square hero above is
	   100vw tall (see .FontDetail__hero's own SP rule) and .FontDetail__body
	   adds 64px of padding-top before this element starts — this min-height
	   makes up the rest of 100dvh, so hero + padding + this always sum to
	   exactly one viewport and the name lands right at the fold. */
	@media (max-width: 767.98px) {
		.FontDetail__name {
			display: flex;
			align-items: flex-end;
			min-height: calc(100dvh - 100vw - 64px - 100px);
		}
	}

	@media (min-width: 768px) {
		.FontDetail__name {
			font-size: 320px;
		}
	}

	.FontDetail__tagline {
		font-family: 'Norma', sans-serif;
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
		color: var(--color-text);
		text-align: left;
		max-width: 64ch;
		margin: 0;
	}

	/* Japanese running translation — Tazugane Light, ~1.75px smaller than the
	   Latin. Latin runs inside JA use the page typeface (var(--type-font)).
	   font-family needs !important to beat the page-wide :global(*) font rule. */
	/* Danish runs in the typeface itself — no CJK fallback stack needed now that
	   the secondary language is Latin. Lighter and slightly smaller so it reads
	   as a translation under the English, not as a second headline. */
	/* One language at a time — [data-lang] lives on <html>, set by the header
	   switch (see lib/state/lang.svelte.ts). */
	:global([data-lang='da']) .FontDetail__description {
		display: none;
	}

	:global([data-lang='en']) .FontDetail__description-da {
		display: none;
	}

	.FontDetail .FontDetail__description-da {
		font-family: var(--type-font, 'Norma'), sans-serif !important;
		font-weight: 300;
		font-size: calc(var(--fs-p) - 1px);
		line-height: 1.7;
		opacity: 0.75;
		letter-spacing: 0;
		color: var(--color-text);
		text-align: left;
		max-width: 64ch;
		margin: 12px 0 0;
	}

	/* ── Elio: sample text in place of Glyph set / Beyond A-Z / OpenType ── */
	.ElioSample {
		padding: 40px var(--padding) 48px;
		border-top: 1px solid var(--color-line);
	}

	.ElioSample__label {
		font-family: 'Norma', sans-serif;
		font-size: var(--fs-h5);
		color: var(--color-text-mute);
		letter-spacing: 0;
		margin: 0 0 20px;
	}

	.ElioSample__text {
		font-size: clamp(20px, 3vw, 32px);
		line-height: 1.4;
		letter-spacing: 0;
		color: var(--color-text);
		max-width: 60ch;
		margin: 0;
	}

	/* ── On-page buy block ── */
	.FontBuy {
		padding: 96px var(--padding) 120px;
		border-top: 1px solid var(--color-line);
		max-width: 640px;
	}

	.FontBuy__eyebrow {
		font-family: 'Norma', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-mute);
		margin: 0 0 16px;
	}

	.FontBuy__heading {
		font-family: 'Norma', sans-serif;
		font-size: clamp(32px, 6vw, 56px);
		line-height: 1.05;
		letter-spacing: 0;
		margin: 0 0 12px;
	}

	.FontBuy__price {
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
		font-size: 12px;
		letter-spacing: 0;
		padding: 6px 14px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		color: var(--color-text);
	}

	.FontBuy__cta {
		display: inline-block;
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
	   hardcoded 'Norma'. */
	.FontDetail :global(*) {
		font-family: var(--type-font, 'Norma'), 'Norma', sans-serif !important;
	}
</style>
