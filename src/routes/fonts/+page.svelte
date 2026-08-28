<script lang="ts">
	import { TYPEFACES } from '$lib/data/typefaces.js';
	import { getPackage } from '$lib/data/pricing.js';
	import type { TypefaceSlug } from '$lib/data/pricing.js';

	// Sort by order (ascending) to guarantee display sequence
	const typefaces = TYPEFACES.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);

	// "From €X" for the ones that have a package priced — Tier-1 Desktop.
	// tf.slug is a plain string (typefaces.ts predates the narrower pricing
	// union); getPackage simply returns undefined for slugs it doesn't know,
	// so the cast is safe.
	function fromPrice(slug: string): string | null {
		const pkg = getPackage(slug as TypefaceSlug, `${slug}-complete`);
		return pkg ? `From €${pkg.baseEur}` : null;
	}
</script>

<svelte:head>
	<title>Fonts — August Type Foundry</title>
	<meta
		name="description"
		content="August Type Foundry typeface catalogue — Asger and upcoming releases."
	/>
</svelte:head>

<main class="Fonts">
	<header class="Fonts__head">
		<h1 class="Fonts__heading">Fonts</h1>
	</header>

	<!-- Grid referenced from increments.cc/fonts: two equal columns on desktop,
	     one on mobile, hairlines standing in for gaps (no real gutter — the
	     border is the gap). Each card carries its own catalogBg (§typefaces.ts)
	     so the grid reads as swatches, not a plain list. -->
	<div class="Fonts__grid" aria-label="Typeface catalogue">
		{#each typefaces as tf (tf.slug)}
			<a href="/fonts/{tf.slug}" class="FontCard" aria-label="View {tf.name}">
				<div class="FontCard__meta">
					<span class="FontCard__name">{tf.name}</span>
					<span class="FontCard__sep">•</span>
					<span class="FontCard__classification">{tf.classification}</span>
				</div>

				<!-- Specimen: a museum-label setting in the face itself, rather than
				     the typeface's own name (see typefaces.ts — referenced from
				     increments.cc's Vorkurs card). Text is always black, whatever
				     catalogBg is, per the card design. Where specimenWeight is set
				     (Alfred/Asta — no drawings yet) it overrides the tag/lead/desc
				     hierarchy uniformly, so the placeholder reads as "one weight of
				     Steiner", not an attempt at the same three-size hierarchy Asger's
				     real card uses. -->
				<div
					class="FontCard__specimen"
					style="background: {tf.catalogBg}; font-family: '{tf.fontFamily}', sans-serif;"
				>
					{#if tf.specimen}
						{@const wght = tf.specimenWeight ? `font-variation-settings: 'wght' ${tf.specimenWeight};` : ''}
						<span class="FontCard__spec-tag" style={wght}>{tf.specimen[0]}</span>
						<span class="FontCard__spec-lead" style={wght}>{tf.specimen[1]}</span>
						<span class="FontCard__spec-desc" style={wght}>{tf.specimen[2]}</span>
					{:else}
						<span class="FontCard__spec-lead">{tf.name}</span>
					{/if}
				</div>

				<div class="FontCard__foot">
					{#if tf.status === 'available'}
						<span class="FontCard__price">{fromPrice(tf.slug)}</span>
					{:else}
						<span class="FontCard__price">Coming soon</span>
					{/if}
					<span class="FontCard__view">View</span>
				</div>
			</a>
		{/each}
	</div>
</main>

<style>
	.Fonts {
		min-height: 100vh;
		min-height: 100dvh;
		padding-top: 96px;
		padding-bottom: 96px;
	}

	@media (min-width: 768px) {
		.Fonts {
			padding-top: 120px;
		}
	}

	.Fonts__head {
		padding-inline: var(--padding);
		margin-bottom: 48px;
	}

	.Fonts__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(36px, 6vw, 64px);
		letter-spacing: 0;
		line-height: 1.05;
		margin: 0;
	}

	/* 1 column on phones, 2 equal columns from tablet up — no grid-gap: the
	   border on each card stands in for it, same as the reference. */
	.Fonts__grid {
		display: grid;
		grid-template-columns: 1fr;
		border-top: 1px solid var(--color-line);
	}

	@media (min-width: 768px) {
		.Fonts__grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.FontCard {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: var(--color-text);
		border-bottom: 1px solid var(--color-line);
		padding-inline: var(--padding);
		transition: opacity 0.15s ease;
	}

	.FontCard:hover {
		opacity: 0.75;
	}

	/* Vertical hairline between the two desktop columns: right border on the
	   left card of every row (odd items in a 2-col grid). */
	@media (min-width: 768px) {
		.FontCard:nth-child(odd) {
			border-right: 1px solid var(--color-line);
		}
	}

	.FontCard__meta {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding-block: 20px;
	}

	.FontCard__name {
		font-family: 'Steiner', sans-serif;
		font-size: 15px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
	}

	.FontCard__sep {
		color: var(--color-text-mute);
		opacity: 0.6;
	}

	.FontCard__classification {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	/* Specimen block — the card's swatch of colour. Fixed aspect so every card
	   in the grid holds the same proportions regardless of how much its
	   specimen sets. Text is always black: catalogBg is chosen light enough
	   for that pairing (see typefaces.ts). */
	.FontCard__specimen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 10;
		color: #000;
		letter-spacing: 0;
		padding: clamp(20px, 4vw, 40px);
		font-variant-numeric: tabular-nums slashed-zero;
	}

	/* Museum-label hierarchy, referenced from increments.cc's Vorkurs card
	   ("1964–1969 / JOSEF ALBERS / New Works"): a small date/edition tag, the
	   dedicatee set large and bold — the actual headline of the card — and a
	   short descriptor beneath, smaller again. Three sizes, not one uniform
	   block: the middle line is what carries the specimen. */
	.FontCard__spec-tag,
	.FontCard__spec-lead,
	.FontCard__spec-desc {
		display: block;
		text-align: center;
	}

	.FontCard__spec-tag {
		font-size: clamp(13px, 1.6vw, 18px);
		opacity: 0.6;
		margin-bottom: clamp(6px, 1.2vw, 12px);
	}

	.FontCard__spec-lead {
		font-size: clamp(32px, 6vw, 64px);
		line-height: 1.05;
		font-variation-settings: 'wght' 650;
	}

	.FontCard__spec-desc {
		font-size: clamp(15px, 2.2vw, 24px);
		margin-top: clamp(6px, 1.2vw, 12px);
	}

	.FontCard__foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-block: 20px;
		margin-top: auto;
	}

	.FontCard__price {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	.FontCard__view {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		letter-spacing: 0;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		padding: 8px 18px;
		white-space: nowrap;
	}
</style>
