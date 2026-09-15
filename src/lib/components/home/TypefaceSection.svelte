<!-- Home page "typeface section" — one full-bleed 100vh/100svh intro per
     typeface (Figma nodes 3:699 "Norma" / 3:733 "Elio" for PC, 7:887 / 7:906
     for SP, file UEy0lKKtgP8jN4x2DWZUOB). Replaces the old Hero/Elio/Alfred
     blocks that used to live directly in +page.svelte.

     Layout: a white sidebar (name/tagline/spec/Discover) beside a large
     colour panel holding a giant classification headline set in the
     typeface's OWN font (self-referential specimen, e.g. Norma's own page
     reads "Natural Humanist Sans" in Norma itself) — then, below the panel,
     two blocks that stand in for real specimen photography. Neither Norma
     nor Elio has real application photography shot yet (see typefaces.ts's
     own documented placeholder conventions for inUseImages/inspiration), and
     Figma's own two photo blocks turned out to be borrowed mockup photos of
     unrelated, unrelated third-party specimens ("Aska", "Saffron" — checked
     during Figma research, not this project's own type at all) — so rather
     than ship someone else's type as if it were ours, these render as solid
     colour + real typographic content instead (the user's own fallback plan
     for exactly this situation). The one exception is Norma, which already
     has a real asset — its existing wght-sweep video — used in block A in
     place of a synthetic glyph tile.

     PC keeps two blocks side by side (402:676 ratio, per Figma); SP shows
     only block A, matching Figma's own single-photo mobile simplification. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Typeface } from '$lib/data/typefaces';
	import Arrow from '$lib/components/Arrow.svelte';

	interface Props {
		typeface: Typeface;
	}
	let { typeface }: Props = $props();

	// Narrowed once here — the component is only ever rendered for typefaces
	// that define homeSection (see +page.svelte's filter), but the field is
	// optional on the shared Typeface type.
	const hs = $derived(typeface.homeSection!);

	let videoEl: HTMLVideoElement | undefined = $state();
	onMount(() => {
		if (!browser) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			videoEl?.pause();
		}
	});
</script>

<section
	class="TypefaceSection"
	style="--panel-bg: {hs.panelBg}; --panel-fg: {hs.panelFg}; --block-bg: {hs.blockBg}; --block-fg: {hs.blockFg};"
>
	<!-- PC only — name/tagline/spec/Discover, always on a white ground -->
	<div class="TypefaceSection__sidebar">
		<p class="TypefaceSection__name">{typeface.name} Ôgast</p>
		<p class="TypefaceSection__tagline">{typeface.tagline}</p>
		<p class="TypefaceSection__meta">
			{typeface.weights.length} weights · {typeface.info?.languages ?? '—'} languages supported
		</p>
		<a class="TypefaceSection__cta" href="/fonts/{typeface.slug}">
			<span class="CtaLabel">Discover</span>
			<Arrow size={9} />
		</a>
	</div>

	<div class="TypefaceSection__panel">
		<p
			class="TypefaceSection__headline"
			style="font-family: '{typeface.fontFamily}', sans-serif; font-variation-settings: 'wght' {hs.headlineWeight}; font-weight: {hs.headlineWeight};"
		>
			{hs.headline}
		</p>
	</div>

	<div class="TypefaceSection__blocks">
		<div class="TypefaceSection__blockA">
			{#if typeface.heroVideo}
				<video
					bind:this={videoEl}
					class="TypefaceSection__video"
					src={typeface.heroVideo}
					autoplay
					loop
					muted
					playsinline
					aria-label="{typeface.name} variable weight axis specimen"
				></video>
			{:else}
				<span
					class="TypefaceSection__glyph"
					style="font-family: '{typeface.fontFamily}', sans-serif;">{hs.glyph}</span
				>
			{/if}
		</div>
		<div class="TypefaceSection__blockB">
			{#if typeface.specimen}
				<div
					class="TypefaceSection__specimen"
					style="font-family: '{typeface.fontFamily}', sans-serif;"
				>
					{#each typeface.specimen as line (line)}
						<span class="TypefaceSection__specimen-line">{line}</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- SP only — compact footer bar: name/tagline left, coloured arrow CTA right -->
	<a class="TypefaceSection__footer" href="/fonts/{typeface.slug}">
		<div class="TypefaceSection__footer-text">
			<p class="TypefaceSection__footer-name">{typeface.name} Ôgast</p>
			<p class="TypefaceSection__footer-tagline">{typeface.tagline}</p>
		</div>
		<div class="TypefaceSection__footer-cta">
			<Arrow size={11} />
		</div>
	</a>
</section>

<style>
	.TypefaceSection {
		/* base.css's global `section { padding-left/right: var(--padding) }`
		   reset would otherwise inset this whole full-bleed section from
		   both edges (visible as a stray white margin down the left of the
		   sidebar AND the right of the panel/blocks) — this is a 100vw
		   section by design, not one of the site's inset content sections. */
		padding-left: 0;
		padding-right: 0;
		display: grid;
		grid-template-columns: 362fr 1078fr;
		grid-template-rows: 453fr 447fr;
		grid-template-areas: 'sidebar panel' 'sidebar blocks';
		height: 100vh;
		height: 100svh;
		background: #ffffff;
	}

	/* --- Sidebar (PC only) --- */
	.TypefaceSection__sidebar {
		grid-area: sidebar;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8px;
		padding-inline: clamp(24px, 3.4vw, 49px);
	}

	.TypefaceSection__name {
		font-family: 'Norma', sans-serif;
		font-size: clamp(22px, 2.2vw, 32px);
		line-height: 1.25;
		font-weight: 400;
		color: #000000;
		margin: 0;
	}

	.TypefaceSection__tagline {
		font-family: 'Norma', sans-serif;
		font-size: clamp(13px, 1.1vw, 16px);
		line-height: 1.25;
		font-weight: var(--fw-light);
		color: #000000;
		margin: 8px 0 0;
	}

	.TypefaceSection__meta {
		font-family: 'Norma', sans-serif;
		font-size: clamp(11px, 0.85vw, 12px);
		line-height: 1.25;
		font-weight: var(--fw-light);
		color: #000000;
		opacity: 0.6;
		margin: 20px 0 0;
	}

	.CtaLabel {
		display: inline-block;
		transform: translateY(1.5px);
	}

	.TypefaceSection__cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 28px;
		font-family: 'Norma', sans-serif;
		font-size: 14px;
		font-weight: var(--fw-ui);
		color: #000000;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.TypefaceSection__cta:hover {
		opacity: 0.6;
	}

	/* --- Panel: giant self-referential headline --- */
	.TypefaceSection__panel {
		grid-area: panel;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--panel-bg);
		overflow: hidden;
	}

	.TypefaceSection__headline {
		font-size: clamp(40px, 6.1vw, 88px);
		line-height: 1.25;
		color: var(--panel-fg);
		text-align: center;
		white-space: nowrap;
		margin: 0;
		padding-inline: 16px;
	}

	/* --- Blocks: two concept tiles standing in for real specimen photography --- */
	.TypefaceSection__blocks {
		grid-area: blocks;
		display: grid;
		grid-template-columns: 402fr 676fr;
	}

	.TypefaceSection__blockA,
	.TypefaceSection__blockB {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: var(--block-bg);
	}

	.TypefaceSection__video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.TypefaceSection__glyph {
		font-size: clamp(96px, 13vw, 190px);
		line-height: 1;
		color: var(--block-fg);
	}

	.TypefaceSection__specimen {
		text-align: center;
		color: var(--block-fg);
	}

	.TypefaceSection__specimen-line {
		display: block;
		font-size: clamp(16px, 2.6vw, 30px);
		line-height: 1.3;
		/* base.css's tag-selector reset sets color directly on span, which
		   beats inheriting from the wrapping .TypefaceSection__specimen div
		   above — same gotcha as .Elio__abc-line elsewhere in this codebase. */
		color: var(--block-fg);
	}

	/* --- Footer (SP only) --- */
	.TypefaceSection__footer {
		display: none;
	}

	@media (max-width: 767.98px) {
		.TypefaceSection {
			grid-template-columns: 1fr;
			grid-template-rows: 358fr 304fr 58fr;
			grid-template-areas: 'panel' 'blocks' 'footer';
		}

		.TypefaceSection__sidebar,
		.TypefaceSection__cta {
			display: none;
		}

		.TypefaceSection__headline {
			font-size: 64px;
			line-height: 1;
			white-space: normal;
			max-width: 90%;
		}

		.TypefaceSection__blocks {
			grid-template-columns: 1fr;
		}

		/* SP shows only block A, matching Figma's own single-photo mobile
		   simplification (see file header comment). */
		.TypefaceSection__blockB {
			display: none;
		}

		.TypefaceSection__glyph {
			font-size: 140px;
		}

		.TypefaceSection__footer {
			grid-area: footer;
			display: flex;
			align-items: stretch;
			text-decoration: none;
		}

		.TypefaceSection__footer-text {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			gap: 1px;
			padding-left: 15px;
			min-width: 0;
			background: #f1f0ef;
		}

		.TypefaceSection__footer-name {
			font-family: 'Norma', sans-serif;
			font-size: 16px;
			line-height: 1.25;
			color: #000000;
			margin: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.TypefaceSection__footer-tagline {
			font-family: 'Norma', sans-serif;
			font-size: 10px;
			line-height: 1.25;
			font-weight: var(--fw-light);
			color: #000000;
			opacity: 0.6;
			margin: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.TypefaceSection__footer-cta {
			flex-shrink: 0;
			width: 79px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: var(--panel-bg);
			color: var(--panel-fg);
		}
	}
</style>
