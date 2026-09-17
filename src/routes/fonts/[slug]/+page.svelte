<!-- Typeface page. Top of the page redesigned 2026-09 per Figma node 12:127
     ("ogast", file UEy0lKKtgP8jN4x2DWZUOB): a full-width colour band with the
     typeface's classification headline set in the face itself, then the
     name, description and spec grid, then a three-block gallery — and the
     Type Tester follows straight after, at the user's request. The band's
     colours, headline and headline weight are the same `homeSection` data
     the home page's typeface section already uses (typefaces.ts), so the
     two never disagree.

     Figma's three gallery photos are borrowed mockup shots of unrelated
     type ("Aska"/"Saffron" proof sheets — checked during research) and no
     typeface here has application photography of its own yet, so the three
     blocks render as solid colour + real typographic content (the user's
     own fallback plan): a large glyph, the wght-sweep video where one
     exists (Norma) or the tagline set in the face's lightest weight, and
     the A–Z/a–z specimen proof. Real photography drops into the same three
     slots when it exists. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import TypeTester from '$lib/components/TypeTester/TypeTester.svelte';
	import GlyphSet from '$lib/components/fonts/GlyphSet.svelte';
	import GlyphShowcase from '$lib/components/fonts/GlyphShowcase.svelte';
	import { getPackage } from '$lib/data/pricing.js';
	import type { TypefaceSlug } from '$lib/data/pricing.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Gallery block A cycles A-Z instead of showing one fixed glyph (2026-09,
	// at the user's request — "1つ目のaとなってるのは、A-zまで切り替わる
	// アニメーションにして"). ALPHABET rather than tf.glyphOrder or similar:
	// this is a generic showcase of the face's caps, not tied to any
	// per-typeface data.
	const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
	const GALLERY_LETTER_INTERVAL = 900;
	let galleryLetterIndex = $state(0);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const id = setInterval(() => {
			galleryLetterIndex = (galleryLetterIndex + 1) % ALPHABET.length;
		}, GALLERY_LETTER_INTERVAL);
		return () => clearInterval(id);
	});

	// Use $derived so these stay reactive if data changes on navigation
	const tf = $derived(data.typeface);
	const isAvailable = $derived(tf.status === 'available');
	// Same "from" price as the /fonts catalogue's own fromPrice() — the
	// Individual tier's per-style rate, not the full-collection price.
	const fromPriceEur = $derived(
		getPackage(tf.slug as TypefaceSlug, `${tf.slug}-complete`)?.baseEur ?? null
	);
	// Elio only has 52 letters and no OpenType features drawn yet — Glyph
	// set / Beyond A-Z / OpenType below are swapped for a plain sample-text
	// block on its page (see the {#if isElio} further down).
	const isElio = $derived(tf.slug === 'elio');

	// Every visible typeface defines homeSection today; the fallback keeps a
	// typeface without one rendering sensibly rather than throwing.
	const hero = $derived(
		tf.homeSection ?? {
			panelBg: tf.theme.bg,
			panelFg: tf.theme.fg,
			blockBg: tf.theme.bg,
			blockFg: tf.theme.fg,
			glyph: 'a',
			headline: tf.classification,
			headlineWeight: 400
		}
	);
	const lightestWeight = $derived(tf.weights[0]?.axisValue ?? 300);

	// Checkout isn't open yet (2026-09, at the user's request — same "10月
	// より使用開始" note as the Header's Cart). Purchase License stays a
	// clickable button rather than a live link to /buy until then.
	let buyNoteVisible = $state(false);
	let buyNoteTimer: ReturnType<typeof setTimeout> | undefined;
	function showBuyNote() {
		buyNoteVisible = true;
		clearTimeout(buyNoteTimer);
		buyNoteTimer = setTimeout(() => (buyNoteVisible = false), 3200);
	}
</script>

<svelte:head>
	<title>{tf.name} — Ōgast</title>
	<meta name="description" content="{tf.tagline} {tf.classification}." />
</svelte:head>

<main
	class="FontDetail"
	style="--type-font: '{tf.fontFamily}'; --panel-bg: {hero.panelBg}; --panel-fg: {hero.panelFg}; --block-bg: {hero.blockBg}; --block-fg: {hero.blockFg};"
>
	<!-- Colour band — the classification headline, set in the face itself
	     (Figma 12:127: 460/900 tall, headline centred). -->
	<section class="FontHero" aria-label="{tf.name} — {hero.headline}">
		<p
			class="FontHero__headline"
			style="font-variation-settings: 'wght' {hero.headlineWeight}; font-weight: {hero.headlineWeight};"
		>
			{hero.headline}
		</p>
	</section>

	<!-- Name, description (left) and the spec grid (right) -->
	<section class="FontIntro" aria-label="About {tf.name}">
		<p class="FontIntro__eyebrow">{tf.tagline}</p>
		<h1 class="FontIntro__name">{tf.name} Ōgast</h1>

		<div class="FontIntro__cols">
			<div class="FontIntro__text">
				<p class="FontIntro__description en">{tf.description}</p>
				{#if tf.descriptionFr}
					<p class="FontIntro__description fr" lang="fr">{tf.descriptionFr}</p>
				{/if}
			</div>

			{#if tf.info}
				<dl class="FontIntro__spec" aria-label="Information">
					<div class="FontIntro__spec-item">
						<dt>Collection</dt>
						<dd>{tf.info.collection}</dd>
					</div>
					<div class="FontIntro__spec-item">
						<dt>Formats</dt>
						<dd>{tf.info.formats}</dd>
					</div>
					<div class="FontIntro__spec-item">
						<dt>Glyphs</dt>
						<dd>{tf.info.glyphs}</dd>
					</div>
					<div class="FontIntro__spec-item">
						<dt>Supported languages</dt>
						<dd>{tf.info.languages}</dd>
					</div>
					{#if tf.info.note}
						<p class="FontIntro__spec-note">{tf.info.note}</p>
					{/if}
				</dl>
			{/if}
		</div>

		<!-- Three-block gallery (Figma: 306 / 489 / 489 wide, all 391 tall). -->
		<div class="FontGallery" aria-label="Specimens">
			<div class="FontGallery__block FontGallery__block--a">
				<!-- .FontDetail :global(*) already forces --type-font onto every
				     descendant (see this file's own font-family rule) — no need to
				     restate it here. -->
				{#key galleryLetterIndex}
					<span class="FontGallery__glyph FontGallery__glyph--cycle"
						>{ALPHABET[galleryLetterIndex]}</span
					>
				{/key}
			</div>
			<div class="FontGallery__block FontGallery__block--b" class:has-video={!!tf.heroVideo}>
				{#if tf.heroVideo}
					<video
						class="FontGallery__video"
						src={tf.heroVideo}
						muted
						loop
						autoplay
						playsinline
						preload="auto"
						disablepictureinpicture
						aria-label="{tf.name} variable weight axis specimen"
					></video>
				{:else}
					<p
						class="FontGallery__tagline"
						style="font-variation-settings: 'wght' {lightestWeight}; font-weight: {lightestWeight};"
					>
						{tf.tagline}
					</p>
				{/if}
			</div>
			<div class="FontGallery__block FontGallery__block--c">
				{#if tf.specimen}
					<p class="FontGallery__specimen">
						{#each tf.specimen as line (line)}
							<span class="FontGallery__specimen-line">{line}</span>
						{/each}
					</p>
				{:else}
					<span class="FontGallery__glyph">{tf.name}</span>
				{/if}
			</div>
		</div>
	</section>

	<!-- Type Tester — directly after the intro, per the user's 2026-09
	     request; the remaining sections keep their earlier order below.
	     (An "In Use" section used to sit directly below this — 4-5
	     application-photo slots — removed 2026-09 at the user's request;
	     tf.inUseImages in typefaces.ts is unused now but left in place.) -->
	<TypeTester
		weights={tf.weights}
		fontFamily={tf.fontFamily}
		defaultTexts={tf.defaultTexts}
		defaultNotes={tf.defaultNotes}
		available={isAvailable}
		defaultSizeDesktop={isElio ? 120 : tf.slug === 'norma' ? 36 : undefined}
		defaultSizeMobile={tf.slug === 'norma' ? 24 : undefined}
	/>

	<!-- Weights — the named axis stops, each set in its own weight. A quick
	     visual index of the range; GlyphSet (further down) is the deep,
	     interactive per-letter inspector across the same axis. -->
	<section class="FontWeights" aria-label="Weights">
		<p class="FontDetail__spec-title">Weights</p>
		<ul class="FontWeights__list">
			{#each tf.weights as w (w.id)}
				<li
					class="FontWeights__item"
					style="font-variation-settings: 'wght' {w.axisValue}; font-family: '{tf.fontFamily}', sans-serif;"
				>
					<!-- Norma's own weights are named by number (1-95, name x 10 =
					     wght) — that number is the name, not a word standing in for
					     it, so it's the only thing shown. Elio's smaller, newer axis
					     doesn't carry that convention, so it gets the more familiar
					     "number word" pairing instead. -->
					{#if isElio}
						<span class="FontWeights__label">{w.name} {w.label}</span>
					{:else}
						<span class="FontWeights__label">{w.name}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	{#if tf.inspiration}
		<!-- Inspiration — reference imagery + a short passage on a specific
		     design influence. Genuinely optional (see the field's own comment
		     in typefaces.ts) — skipped entirely rather than shown empty. -->
		<section class="FontInspiration" aria-label="Inspiration">
			<p class="FontDetail__spec-title">Inspiration</p>
			<div class="FontInspiration__row">
				{#each tf.inspiration.images as img, i (i)}
					<div class="FontInspiration__cell">
						{#if img.src}
							<img src={img.src} alt={img.alt} loading="lazy" />
						{:else}
							<span class="FontInspiration__placeholder">Reference photo</span>
						{/if}
					</div>
				{/each}
			</div>
			<p class="FontInspiration__text en">{tf.inspiration.paragraph}</p>
			{#if tf.inspiration.paragraphFr}
				<p class="FontInspiration__text fr" lang="fr">{tf.inspiration.paragraphFr}</p>
			{/if}
		</section>
	{/if}

	{#if isElio}
		<!-- Elio only has 52 letters and no OpenType features yet — the Glyph
		     set / specimen / OpenType sections below would mostly show
		     .notdef/tofu or empty demos. A plain sample-text block instead,
		     using only characters actually in Elio's cmap. -->
		<section class="ElioSample" aria-label="Sample text">
			<p class="ElioSample__label">Sample text</p>
			<p class="ElioSample__text" style="font-family: '{tf.fontFamily}', sans-serif;">
				Elio is a sibling to Norma, drawn in Hair so far. More weights follow soon. Lorem ipsum
				dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
				dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
				ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
				velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
				proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis
				unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
				aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta
				sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
				sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
				quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia
				non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
				voluptatem.
			</p>
		</section>
	{:else}
		<!-- Glyph set: full A-Z inspector -->
		<GlyphSet fontFamily={tf.fontFamily} name={tf.name} title="Glyph set" weights={tf.weights} />

		<!-- Specimen: currency / punctuation / symbols / fractions, each set
		     large on its own row. -->
		<GlyphShowcase fontFamily={tf.fontFamily} />

		<!-- OpenType features (live OFF → ON demos) — hidden 2026-08-31 at the
		     user's request (temporary, "一旦"). Re-add
		     <OpenTypeFeatures fontFamily={tf.fontFamily} /> here when ready. -->
	{/if}

	<!-- On-page buy block -->
	<section class="FontBuy" id="buy" aria-label="Buy {tf.name}">
		<div class="FontBuy__inner">
			{#if isAvailable}
				<p class="FontBuy__eyebrow">License</p>
				<h2 class="FontBuy__heading">{tf.name}</h2>
				<p class="FontBuy__price">
					{fromPriceEur !== null ? `From €${fromPriceEur}` : 'Price on request'} · pay once, every license
					included
				</p>
				<button type="button" class="FontBuy__cta" onclick={showBuyNote}>Purchase License →</button
				>
				<p class="FontBuy__note">
					{buyNoteVisible ? 'Available from October.' : '20 weights — Hairline to Ultra.'}
				</p>
			{:else}
				<p class="FontBuy__eyebrow">Coming Soon</p>
				<h2 class="FontBuy__heading">{tf.name}</h2>
				<p class="FontBuy__price">In development — released in due course.</p>
				<a class="FontBuy__cta" href="/contact">Stay tuned →</a>
			{/if}
		</div>
	</section>
</main>

<style>
	.FontDetail {
		/* The colour band starts at the very top; the fixed header overlays
		   it (and auto-inverts against it). */
		padding: 0 0 40px;
	}

	/* ── Colour band + classification headline (Figma 12:127: 460/900) ── */
	.FontHero {
		display: grid;
		place-items: center;
		height: clamp(300px, 51vh, 560px);
		height: clamp(300px, 51svh, 560px);
		background: var(--panel-bg);
		padding: 80px 20px 24px;
		overflow: hidden;
	}

	.FontHero__headline {
		font-size: clamp(40px, 6.1vw, 88px);
		line-height: 1.25;
		letter-spacing: 0;
		color: var(--panel-fg) !important;
		text-align: center;
		margin: 0;
	}

	@media (min-width: 768px) {
		.FontHero__headline {
			white-space: nowrap;
		}
	}

	/* ── Intro: eyebrow, name, description + spec, gallery ── */
	.FontIntro {
		padding: clamp(48px, 9.3vh, 84px) clamp(20px, 3.4vw, 49px) clamp(56px, 8.4vh, 76px)
			clamp(20px, 4.65vw, 67px);
	}

	.FontIntro__eyebrow {
		font-size: 12px;
		line-height: 1.3;
		letter-spacing: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
		opacity: 0.5;
		margin: 0 0 32px;
		max-width: 40ch;
	}

	.FontIntro__name {
		font-size: clamp(40px, 11vw, 72px);
		font-weight: 400;
		line-height: 1;
		letter-spacing: 0;
		margin: 0;
	}

	@media (min-width: 768px) {
		.FontIntro__name {
			font-size: 72px;
		}
	}

	.FontIntro__cols {
		display: grid;
		gap: 40px;
		margin-top: 34px;
	}

	@media (min-width: 768px) {
		.FontIntro__cols {
			/* 67->685 copy, 913->1391 spec, at the 1440 design width. */
			grid-template-columns: 618fr 228fr 478fr;
			gap: 0;
			align-items: start;
		}

		.FontIntro__spec {
			grid-column: 3;
		}
	}

	.FontIntro__description {
		font-size: 14px;
		line-height: 1.4;
		letter-spacing: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
		max-width: 64ch;
		margin: 0;
	}

	/* One language at a time — [data-lang] lives on <html>, set by the header
	   switch (see lib/state/lang.svelte.ts). Translations are hidden by
	   default and shown only on an exact match, so the DE/ES codes (no copy
	   of their own yet) fall through to the English. */
	:global([data-lang='fr']) .FontDetail .en {
		display: none;
	}

	.FontDetail .fr {
		display: none;
	}

	:global([data-lang='fr']) .FontDetail .fr {
		display: block;
	}

	.FontIntro__spec {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 40px 24px;
		margin: 0;
	}

	.FontIntro__spec-item dt {
		font-size: 12px;
		line-height: 1.25;
		letter-spacing: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
		opacity: 0.5;
		margin: 0 0 4px;
	}

	.FontIntro__spec-item dd {
		font-size: 16px;
		line-height: 1.25;
		letter-spacing: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
		margin: 0;
	}

	/* Small caveat under the grid — e.g. Elio's "still in development" note. */
	.FontIntro__spec-note {
		grid-column: 1 / -1;
		font-size: 11px;
		line-height: 1.5;
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin: -16px 0 0;
	}

	/* ── Gallery — three blocks standing in for specimen photography ── */
	.FontGallery {
		display: grid;
		gap: 16px;
		margin-top: clamp(40px, 7vh, 64px);
	}

	@media (min-width: 768px) {
		.FontGallery {
			grid-template-columns: 306.5fr 488.75fr 488.75fr;
			gap: 20px;
		}
	}

	/* A / B / A colour rhythm: the outer two blocks take the band's own
	   colour pair, the middle one the block pair (or the video's own black)
	   — Norma reads red / black / red, Elio lime / blue / lime. */
	.FontGallery__block {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: var(--panel-bg);
		color: var(--panel-fg);
		aspect-ratio: 488.75 / 391;
	}

	.FontGallery__block--a {
		aspect-ratio: 306.5 / 391;
	}

	@media (max-width: 767.98px) {
		.FontGallery__block--a {
			aspect-ratio: 4 / 3;
		}
	}

	.FontGallery__block--b {
		background: var(--block-bg);
		color: var(--block-fg);
	}

	.FontGallery__block--b.has-video {
		background: #000;
	}

	.FontGallery__video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* base.css sets color directly on span/p, which beats inheriting from the
	   block — assert it (same gotcha as the home page's typeface sections). */
	.FontGallery__glyph {
		font-size: clamp(120px, 16vw, 220px);
		line-height: 1;
		color: var(--panel-fg);
	}

	/* Block A cycles A-Z instead of one fixed glyph (2026-09, at the user's
	   request). {#key} re-mounts this span on every letter change, which is
	   what re-triggers the animation each time — same idiom as the home
	   page's own TypefaceFooterBar__lines fade. */
	@keyframes gallery-glyph-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.FontGallery__glyph--cycle {
		display: inline-block;
		animation: gallery-glyph-fade 0.3s ease both;
	}

	.FontGallery__tagline {
		font-size: clamp(28px, 3.4vw, 48px);
		line-height: 1.15;
		letter-spacing: 0;
		text-align: center;
		color: var(--block-fg);
		margin: 0;
		padding: 0 8%;
	}

	.FontGallery__specimen {
		text-align: center;
		margin: 0;
		padding: 0 6%;
	}

	.FontGallery__specimen-line {
		display: block;
		/* 2026-09, at the user's request — "3つ目のfsを64pxにして". */
		font-size: 64px;
		line-height: 1.3;
		letter-spacing: 0;
		color: var(--panel-fg);
	}

	/* ── Shared section title ── */
	.FontDetail__spec-title {
		font-family: 'Norma', sans-serif;
		font-size: 14px;
		line-height: 1.5;
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin: 0 0 20px;
	}

	/* ── Weights — the named axis stops, each set in its own weight ──
	   More subdued than the first pass (2026-09, at the user's request —
	   "各書体ページのweight表示はもう少し控えめにして"): smaller, lower
	   opacity, so this reads as a reference list rather than another
	   display headline competing with the gallery above it. Two columns
	   from the base breakpoint up, not just desktop (2026-09, "Normaの
	   wightsは1-95までと長いので折り返して2カラムとかで対応") — Norma's
	   twenty weights made this the tallest section on the page at one
	   column on SP. */
	.FontWeights {
		padding: 40px var(--padding) 48px;
	}

	.FontWeights__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		column-gap: 24px;
	}

	.FontWeights__item {
		display: block;
		padding: 6px 0;
		font-size: clamp(18px, 6vw, 24px);
		line-height: 1.25;
		letter-spacing: 0;
		opacity: 0.7;
	}

	@media (min-width: 600px) {
		.FontWeights__list {
			column-gap: 48px;
		}
	}

	@media (min-width: 768px) {
		.FontWeights__item {
			padding: 8px 0;
			font-size: clamp(20px, 2.6vw, 28px);
		}
	}

	/* ── Inspiration — reference imagery + a short passage ── */
	.FontInspiration {
		padding: 40px var(--padding) 48px;
		border-top: 1px solid var(--color-line);
	}

	.FontInspiration__row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		margin-bottom: 32px;
		max-width: 720px;
	}

	@media (min-width: 768px) {
		.FontInspiration__row {
			grid-template-columns: repeat(3, 1fr);
			gap: 16px;
		}
	}

	.FontInspiration__cell {
		aspect-ratio: 4 / 3;
		background: var(--color-bg-gray, #f3f3f3);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.FontInspiration__cell img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Moved here from the removed In Use section (2026-09) — this was the
	   only other place it was used. */
	.FontInspiration__placeholder {
		font-family: 'Norma', sans-serif;
		font-size: 11px;
		letter-spacing: 0;
		color: var(--color-text-mute);
		opacity: 0.6;
		text-align: center;
		padding: 0 12px;
	}

	.FontInspiration__text {
		font-size: 16px;
		line-height: 1.6;
		letter-spacing: 0;
		color: var(--color-text);
		max-width: 64ch;
		margin: 0;
	}

	.FontInspiration .FontInspiration__text.fr {
		font-weight: 300;
		font-size: 15px;
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
	}

	.FontBuy__inner {
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
		border: 0;
		cursor: pointer;
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

	/* All page content (not header/footer) uses the typeface's own font —
	   the page is its own specimen. `--type-font` is set on .FontDetail;
	   !important overrides the components' hardcoded 'Norma'. */
	.FontDetail :global(*) {
		font-family: var(--type-font, 'Norma'), 'Norma', sans-serif !important;
	}
</style>
