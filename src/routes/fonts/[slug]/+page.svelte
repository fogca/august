<!-- Typeface page. Top of the page redone 2026-10-30, at the user's request, after
     Kontrapunkt Type's typeface pages (type.kontrapunkt.com): the name, with
     the "APGR" prefix dropped, as wide as the page; a rule; then the spec lines
     (two columns) and the description (the wider column); a fixed pill at the
     bottom of the screen. The colour band with the classification headline
     that stood here (Figma node 12:127, "ogast", file UEy0lKKtgP8jN4x2DWZUOB)
     is gone — the classification is a spec line now. What follows (the
     gallery, Type Tester, weights …) is unchanged. A placeholder (Maxica, GQ
     Sans: no face to show yet) stops after the description. The gallery
     tiles still take their colours from the `homeSection` data the home
     page's typeface section uses (typefaces.ts), so the two never disagree.

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
	import { dragScroll } from '$lib/actions/dragScroll';
	import { fitText } from '$lib/actions/fitText';
	import TypeTester from '$lib/components/TypeTester/TypeTester.svelte';
	import GlyphSet from '$lib/components/fonts/GlyphSet.svelte';
	import GlyphShowcase from '$lib/components/fonts/GlyphShowcase.svelte';
	import GlyphOverview from '$lib/components/fonts/GlyphOverview.svelte';
	import FontInformation from '$lib/components/fonts/FontInformation.svelte';
	import { getPackage } from '$lib/data/pricing.js';
	import type { TypefaceSlug } from '$lib/data/pricing.js';
	import { displayName } from '$lib/data/typefaces.js';
	import type { GalleryItem } from '$lib/data/typefaces.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Gallery block A cycles through the glyphs instead of showing one fixed
	// one (2026-09, at the user's request — "1つ目のaとなってるのは、A-zまで
	// 切り替わるアニメーションにして"), and since 2026-10 runs on past the caps
	// into lowercase and then the figures ("大文字のあと小文字・数字と続いて
	// ほしい"): A-Z, a-z, 0-9, then round again. GLYPHS rather than
	// tf.glyphOrder or similar: this is a generic showcase of the basic
	// Latin set, not tied to any per-typeface data (every face here ships all
	// 62).
	const range = (from: string, to: string) =>
		Array.from({ length: to.charCodeAt(0) - from.charCodeAt(0) + 1 }, (_, i) =>
			String.fromCharCode(from.charCodeAt(0) + i)
		);
	const GLYPHS = [...range('A', 'Z'), ...range('a', 'z'), ...range('0', '9')];
	// A hard, fast cut (2026-10, at the user's request — "ふわっとfadeをかける
	// のではなく、無骨に早めに切り替わる"): 160ms a glyph, so the full 62 take
	// about 10s. It was 900ms with a 0.3s fade-in.
	const GALLERY_LETTER_INTERVAL = 160;
	let galleryLetterIndex = $state(0);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const id = setInterval(() => {
			galleryLetterIndex = (galleryLetterIndex + 1) % GLYPHS.length;
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
	// Humorist (Ango) only has 52 letters and no OpenType features drawn yet —
	// Glyph set / Beyond A-Z / OpenType below are swapped for a plain
	// sample-text block on its page (see the {#if isHumorist} further down).
	const isHumorist = $derived(tf.slug === 'apgr-humorist');

	// The big name at the top: the prefix dropped, set at the face's own
	// display weight (400 where it has none).
	const nameWeight = $derived(tf.specimenWeight ?? 400);

	// The spec lines, in two columns. Only what the data holds: a line with
	// nothing behind it is left out, never filled in. Styles are upright only
	// (no italics are drawn).
	const specColumns = $derived.by(() => {
		const a: [string, string][] = [['Name', tf.name]];
		if (tf.category) a.push(['Classification', tf.category]);
		if (!tf.placeholder) a.push(['Styles', `${tf.weights.length} upright`]);
		a.push(['Status', isAvailable ? 'Available' : 'In development']);
		const b: [string, string][] = [];
		if (tf.info) {
			b.push(['Designer', tf.info.design]);
			b.push(['Release', tf.info.release]);
			b.push(['Formats', tf.info.formats]);
			b.push(['Glyphs', tf.info.glyphs]);
			b.push(['Languages', tf.info.languages]);
		}
		return [a, b];
	});

	// Information section, first column: label over value. Only what the data
	// holds (the same facts as the spec lines up top).
	const informationDetails = $derived.by(() => {
		const d: [string, string][] = [];
		if (tf.info) d.push(['Design', tf.info.design]);
		if (tf.category) d.push(['Classification', tf.category]);
		d.push(['Weights', String(tf.weights.length)]);
		if (tf.info) {
			d.push(['Glyphs', tf.info.glyphs]);
			d.push(['Formats', tf.info.formats]);
			d.push(['Release', tf.info.release]);
		}
		return d;
	});

	// The fixed pill hands over to the buy block at the foot of the page once
	// that is on screen, so the two are never seen together.
	let buyEl: HTMLElement | undefined = $state();
	let buyInView = $state(false);

	onMount(() => {
		if (!buyEl || typeof IntersectionObserver === 'undefined') return;
		const io = new IntersectionObserver(([entry]) => (buyInView = entry.isIntersecting));
		io.observe(buyEl);
		return () => io.disconnect();
	});

	// Every visible typeface defines homeSection today; the fallback keeps a
	// typeface without one rendering sensibly rather than throwing.
	const hero = $derived(
		tf.homeSection ?? {
			panelBg: tf.theme.bg,
			panelFg: tf.theme.fg,
			blockBg: tf.theme.bg,
			blockFg: tf.theme.fg,
			galleryBg: undefined,
			galleryFg: undefined,
			glyph: 'a',
			headline: tf.classification,
			headlineWeight: 400
		}
	);
	const lightestWeight = $derived(tf.weights[0]?.axisValue ?? 300);

	// The gallery, left to right — the typeface's own list, else the default
	// three (glyphs, then the video or the tagline, then the specimen).
	const galleryItems = $derived<GalleryItem[]>(
		tf.gallery ?? [
			{ kind: 'glyphs' },
			tf.heroVideo ? { kind: 'video' } : { kind: 'tagline' },
			{ kind: 'specimen' }
		]
	);
	const firstImageIndex = $derived(galleryItems.findIndex((g) => g.kind === 'image'));

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
	<title>{tf.name} — Apres Guerre</title>
	<meta name="description" content="{tf.tagline} {tf.classification}." />
</svelte:head>

<main
	class="FontDetail"
	style="--type-font: '{tf.fontFamily}'; --panel-bg: {hero.panelBg}; --panel-fg: {hero.panelFg}; --block-bg: {hero.blockBg}; --block-fg: {hero.blockFg}; --tile-bg: {hero.galleryBg ?? hero.panelBg}; --tile-fg: {hero.galleryFg ?? hero.panelFg};"
>
	<!-- The name, prefix dropped, as wide as the page (see fitText). The h1
	     says the full name to a screen reader. -->
	<section class="FontTitle" aria-label="{tf.name}">
		<h1 class="FontTitle__name" aria-label={tf.name}>
			<span
				class="FontTitle__text"
				use:fitText={tf.slug}
				style="font-variation-settings: 'wght' {nameWeight}; font-weight: {nameWeight};"
				>{displayName(tf)}</span
			>
		</h1>
	</section>

	<!-- Spec lines (two columns) and the description, under a rule -->
	<section class="FontIntro" aria-label="About {tf.name}">
		<div class="FontIntro__cols">
			{#if !tf.placeholder}
				<!-- Styles, each set in itself at its own weight (Kontrapunkt Type's
				     "KP Duo Sans Light, Italic ..." list), top left; upright only. -->
				<ul class="FontStyles" aria-label="Styles">
					{#each tf.weights as w (w.id)}
						<li
							class="FontStyles__item"
							style="font-variation-settings: 'wght' {w.axisValue}; font-weight: {w.axisValue};"
						>
							{tf.name} {w.label}
						</li>
					{/each}
				</ul>
			{/if}

			<div class="FontIntro__text">
				{#if !tf.placeholder}
					<p class="FontIntro__tagline">{tf.tagline}</p>
				{/if}
				<p class="FontIntro__description en">{tf.description}</p>
				{#if tf.descriptionFr}
					<p class="FontIntro__description fr" lang="fr">{tf.descriptionFr}</p>
				{/if}

				<!-- The spec lines, under the description -->
				<div class="FontSpecs">
					{#each specColumns as column, ci (ci)}
						<dl class="FontSpec" aria-label="Information">
							{#each column as [label, value] (label)}
								<div class="FontSpec__line">
									<dt>{label}:</dt>
									<dd>{value}</dd>
								</div>
							{/each}
							{#if ci === 1 && tf.info?.note}
								<p class="FontSpec__note">{tf.info.note}</p>
							{/if}
						</dl>
					{/each}
				</div>
			</div>
		</div>

		{#if !tf.placeholder}

		<!-- The gallery: one strip, scrolling sideways when its items don't fit
		     (Figma: three tiles, 306 / 489 / 489 wide, all 391 tall — that is
		     what an untouched typeface still gets). It has to be reachable from
		     the keyboard (focusable, then arrow keys scroll it), hence the
		     tabindex on a non-interactive group. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			class="FontGallery"
			role="group"
			aria-label="{tf.name} — scroll sideways for more"
			tabindex="0"
			use:dragScroll
		>
			{#each galleryItems as item, i (i)}
				{#if item.kind === 'glyphs'}
					<div class="FontGallery__block FontGallery__block--glyphs">
						<!-- .FontDetail :global(*) already forces --type-font onto every
						     descendant (see this file's own font-family rule) — no need to
						     restate it here. -->
						<span class="FontGallery__glyph FontGallery__glyph--cycle"
							>{GLYPHS[galleryLetterIndex]}</span
						>
					</div>
				{:else if item.kind === 'image'}
					<!-- Only the first picture is lazy: one clipped by the sideways
					     scroller never counts as near the viewport, so a lazy later
					     one would stay blank until it was already swiped into view.
					     The rest load up front at low priority. -->
					<img
						class="FontGallery__image"
						src={item.src}
						alt={item.alt}
						width={item.width}
						height={item.height}
						draggable="false"
						loading={i === firstImageIndex ? 'lazy' : 'eager'}
						fetchpriority={i === firstImageIndex ? undefined : 'low'}
						decoding="async"
					/>
				{:else if item.kind === 'video' && tf.heroVideo}
					<div class="FontGallery__block FontGallery__block--wide FontGallery__block--b has-video">
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
					</div>
				{:else if item.kind === 'tagline'}
					<div class="FontGallery__block FontGallery__block--wide FontGallery__block--b">
						<p
							class="FontGallery__tagline"
							style="font-variation-settings: 'wght' {lightestWeight}; font-weight: {lightestWeight};"
						>
							{tf.tagline}
						</p>
					</div>
				{:else if item.kind === 'specimen'}
					<div class="FontGallery__block FontGallery__block--wide FontGallery__block--c">
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
				{/if}
			{/each}
		</div>
		{/if}
	</section>

	{#if !tf.placeholder}
	<!-- Type Tester — directly after the intro, per the user's 2026-09
	     request; the remaining sections keep their earlier order below.
	     (An "In Use" section used to sit directly below this — 4-5
	     application-photo slots — removed 2026-09 at the user's request;
	     tf.inUseImages in typefaces.ts is unused now but left in place.) -->
	<TypeTester
		weights={tf.weights}
		fontFamily={tf.fontFamily}
		name={tf.name}
		defaultTexts={tf.defaultTexts}
		defaultNotes={tf.defaultNotes}
		available={isAvailable}
		defaultSizeDesktop={isHumorist ? 160 : tf.slug === 'norma' ? 36 : undefined}
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
					     it, so it's the only thing shown. Humorist's smaller, newer axis
					     doesn't carry that convention, so it gets the more familiar
					     "number word" pairing instead. -->
					{#if isHumorist}
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

	{#if isHumorist}
		<!-- Humorist (Ango) only has 52 letters and no OpenType features yet —
		     the Glyph set / specimen / OpenType sections below would mostly
		     show .notdef/tofu or empty demos. A plain sample-text block
		     instead, using only characters actually in its cmap. -->
		<section class="AngoSample" aria-label="Sample text">
			<p class="AngoSample__label">Sample text</p>
			<p class="AngoSample__text" style="font-family: '{tf.fontFamily}', sans-serif;">
				APGR Humorist is a sibling to Norma, drawn in Hair so far. More weights follow soon. Lorem ipsum
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

	<!-- The lower half after Kontrapunkt Type's typeface pages (2026-10-31, at
	     the user's request): Glyph Overview, then Information. (Its OpenType
	     Features cards are not here: the font has no substitution features to
	     toggle, only kerning and mark positioning.) -->
	{#if tf.overview}
		<GlyphOverview
			name={tf.name}
			weights={tf.weights}
			groups={tf.overview.groups}
			metrics={tf.overview.metrics}
		/>
	{/if}

	{#if tf.information}
		<FontInformation
			details={informationDetails}
			features={tf.information.features}
			languages={tf.information.languages}
		/>
	{/if}
	{/if}

	<!-- On-page buy block -->
	<section class="FontBuy" id="buy" aria-label="Buy {tf.name}" bind:this={buyEl}>
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

	<!-- Fixed at the foot of the screen, centred (Kontrapunkt Type's "Buy KP Duo
	     Sans"); it steps aside once the buy block itself is in view. -->
	<a
		class="FontPill"
		class:is-hidden={buyInView}
		href="#buy"
		aria-hidden={buyInView}
		tabindex={buyInView ? -1 : undefined}
	>
		{isAvailable ? `Buy ${tf.name}` : 'Coming soon'}
	</a>
</main>

<style>
	.FontDetail {
		/* The name starts at the top, under the fixed header. */
		padding: 0 0 40px;
		/* Black text on this page (2026-10, at the user's request — "各書体の
		   ページ情報やタイプテスターなどは、ブラックテキストに"). The site
		   chrome (the wordmark) stays brand blue. (Since 2026-10-31 every page's
		   text is black, so this scope no longer differs from the theme.) These
		   are the tokens the page and its components read, so one scope
		   covers the intro, the Type Tester, the glyph set and the rest. */
		--color-text: #000000;
		--color-text-mute: rgba(0, 0, 0, 0.55);
		--color-line: rgba(0, 0, 0, 0.15);
	}

	/* ── The name, as wide as the page (fitText) ──
	   Kontrapunkt Type's typeface pages open the same way: the name at the
	   full width, a rule, then the particulars. <main> already starts below
	   the masthead's wordmark; the side padding is the page's own inset (the
	   wordmark's margin, base.css --padding). */
	.FontTitle {
		padding: 12px var(--padding) 24px;
	}

	/* font-size 0 so the heading's own strut adds no space around the line:
	   the word (an inline-block, which sets its own size) is all that is in it. */
	.FontTitle__name {
		margin: 0;
		font-size: 0;
		line-height: 0;
	}

	.FontTitle__text {
		display: inline-block;
		white-space: nowrap;
		/* What shows until fitText has measured (and with no JS): about the
		   width of a short word at the page's width. */
		font-size: clamp(72px, 22vw, 360px);
		line-height: 0.8;
		letter-spacing: 0;
	}

	/* ── Intro: spec lines, description, gallery ── */
	.FontIntro {
		padding: 0 var(--padding) clamp(56px, 8.4vh, 76px);
	}

	/* The rule, then the styles (top left, across the first two columns) and the
	   description with the spec lines under it (right), at 1 : 1 : 2
	   (Kontrapunkt's own proportions). One column on a phone. */
	.FontIntro__cols {
		display: grid;
		gap: 28px;
		padding-top: 18px;
		border-top: 1px solid var(--color-text);
	}

	@media (min-width: 768px) {
		.FontIntro__cols {
			grid-template-columns: 1fr 1fr 2fr;
			gap: 10px 24px;
			align-items: start;
		}

		.FontStyles {
			grid-column: 1 / 3;
		}

		.FontIntro__text {
			grid-column: 3;
		}
	}

	/* Each style set in itself at its own weight, tight, as Kontrapunkt's list. */
	.FontStyles {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.FontStyles__item {
		font-size: clamp(22px, 2.8vw, 40px);
		line-height: 1.15;
		letter-spacing: 0;
		color: var(--color-text);
	}

	/* The spec lines under the description: two columns from the tablet up. */
	.FontSpecs {
		display: grid;
		gap: 28px 24px;
		margin-top: 40px;
	}

	@media (min-width: 768px) {
		.FontSpecs {
			grid-template-columns: 1fr 1fr;
		}
	}

	.FontIntro__tagline {
		font-size: 12px;
		line-height: 1.3;
		letter-spacing: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
		opacity: 0.5;
		margin: 0 0 12px;
	}

	.FontIntro__description {
		font-size: clamp(16px, 1.4vw, 20px);
		line-height: 1.4;
		letter-spacing: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
		max-width: none;
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

	/* "Label: value", one line each. */
	.FontSpec {
		display: grid;
		gap: 3px;
		align-content: start;
		margin: 0;
	}

	.FontSpec__line {
		display: flex;
		gap: 0.45em;
		font-size: 15px;
		line-height: 1.4;
		letter-spacing: 0;
	}

	.FontSpec__line dt,
	.FontSpec__line dd {
		margin: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
	}

	.FontSpec__line dt {
		flex: none;
		opacity: 0.5;
	}

	/* Small caveat under the spec lines — a typeface still in development. */
	.FontSpec__note {
		font-size: 11px;
		line-height: 1.5;
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin: 8px 0 0;
	}

	/* ── The pill, fixed at the foot of the screen ── */
	.FontPill {
		position: fixed;
		left: 50%;
		bottom: calc(20px + env(safe-area-inset-bottom, 0px));
		transform: translateX(-50%);
		z-index: 1000;
		padding: 8px 16px;
		border-radius: 999px;
		background: #000;
		color: #fff;
		font-size: 16px;
		line-height: 1.2;
		letter-spacing: 0;
		white-space: nowrap;
		text-decoration: none;
		transition: opacity 0.25s ease;
	}

	.FontPill.is-hidden {
		opacity: 0;
		pointer-events: none;
	}

	/* ── Gallery — one strip of tiles and pictures, scrolling sideways ── */
	/* 10px gaps and 80px above (2026-10, the user's own values).
	   The whole gallery is the scroller (2026-10-11, at the user's request —
	   "全体でスクロールできるように"): every item is --gallery-h tall, the tiles
	   keep their own proportions, a picture's width follows its own (never
	   cropped), and what doesn't fit scrolls sideways.
	   --gallery-h is the height the Figma three-tile row has at this width
	   (391 tall for 306.5 + 488.75 + 488.75 wide, less the two gaps), so a
	   typeface with just those three tiles fills the row exactly, as before.
	   It is a container-query length, resolved on the items against this
	   element (see container-type). */
	.FontGallery {
		--gallery-gap: 10px;
		--gallery-h: calc((100cqw - 2 * var(--gallery-gap)) * 391 / 1284);
		container-type: inline-size;
		display: flex;
		align-items: flex-start;
		gap: var(--gallery-gap);
		margin-top: 80px;
		/* Runs out to the screen's own edges (2026-10-11, at the user's request
		   — "画像の右端が切れちゃってるので、右端までしっかり表示して"): cut off
		   at the 40px page margin, a picture partway through the strip read as
		   chopped short. The margin comes back as padding, so the first item
		   still starts on it, and the last item stops short
		   of the edge by it. (cqw below is the container's content box, so the
		   padding does not change --gallery-h.) FontIntro's side padding is
		   the same --padding, which is what the negative margin undoes. */
		margin-inline: calc(-1 * var(--padding));
		padding-inline: var(--padding);
		scroll-padding-inline: var(--padding);
		overflow-x: auto;
		overflow-y: hidden;
		/* A trackpad swipe past either end stays in the strip rather than
		   turning into a browser back/forward. */
		overscroll-behavior-x: contain;
		/* No scroll-snap: it pulled a mouse drag back to the nearest item the
		   moment it was released, and the strip is free scrolling by design
		   (items of every width, dragged anywhere). */
		/* Thin and in the page's ink, so that a mouse user, who has no
		   sideways wheel, can see that there is more and drag it. */
		scrollbar-width: thin;
		scrollbar-color: var(--color-text) transparent;
	}

	/* On a phone one wide tile fills the width, and the glyph tile is a
	   square — so the next item always peeks in from the right. */
	@media (max-width: 767.98px) {
		.FontGallery {
			--gallery-h: calc(100cqw * 391 / 488.75);
		}
	}

	.FontGallery > * {
		flex: none;
		height: var(--gallery-h);
	}

	/* Dragging with the mouse (see dragScroll): a grab cursor while there is
	   something to pull, and no text selection or ghost image to get in the
	   way of it. The attribute and the class are set at runtime by the
	   action, which Svelte can't see — hence :global on those parts. */
	.FontGallery:global([data-scrollable]),
	.FontGallery:global([data-scrollable]) :global(*) {
		cursor: grab;
	}

	.FontGallery:global(.is-dragging),
	.FontGallery:global(.is-dragging) :global(*) {
		cursor: grabbing;
	}

	.FontGallery:global([data-scrollable]) {
		user-select: none;
		-webkit-user-select: none;
	}

	/* The typographic tiles. Colour rhythm: the glyph and specimen take the
	   tile pair (--tile-*; the panel's unless the typeface sets
	   galleryBg/galleryFg), the video/tagline tile the block pair (or the
	   video's own black) — Norma reads red / black / red, Ango white /
	   pictures / white. */
	.FontGallery__block {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: var(--tile-bg);
		color: var(--tile-fg);
		aspect-ratio: 488.75 / 391;
	}

	.FontGallery__block--glyphs {
		aspect-ratio: 306.5 / 391;
	}

	@media (max-width: 767.98px) {
		.FontGallery__block--glyphs {
			aspect-ratio: 1 / 1;
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

	/* A picture: the strip's height, its own width, never cropped. */
	.FontGallery__image {
		display: block;
		/* base.css gives every img width:100% + cover — both undone here. */
		width: auto;
		max-width: none;
		object-fit: contain;
		-webkit-user-drag: none;
	}

	/* base.css sets color directly on span/p, which beats inheriting from the
	   block — assert it (same gotcha as the home page's typeface sections). */
	.FontGallery__glyph {
		font-size: clamp(120px, 16vw, 220px);
		line-height: 1;
		color: var(--tile-fg);
	}

	/* Block A cycles A-Z instead of one fixed glyph (2026-09, at the user's
	   request). The letter is swapped in place with no transition at all —
	   a hard cut, on purpose (see GALLERY_LETTER_INTERVAL). */
	.FontGallery__glyph--cycle {
		display: inline-block;
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
		color: var(--tile-fg);
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

	/* ── Ango: sample text in place of Glyph set / Beyond A-Z / OpenType ── */
	.AngoSample {
		padding: 40px var(--padding) 48px;
		border-top: 1px solid var(--color-line);
	}

	.AngoSample__label {
		font-family: 'Norma', sans-serif;
		font-size: var(--fs-h5);
		color: var(--color-text-mute);
		letter-spacing: 0;
		margin: 0 0 20px;
	}

	.AngoSample__text {
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
