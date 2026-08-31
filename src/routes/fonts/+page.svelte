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
		content="August Type Foundry typeface catalogue — Norma and upcoming releases."
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

				<!-- Specimen: a museum-exhibition label set in the face itself,
				     rather than the typeface's own name (see typefaces.ts —
				     referenced from increments.cc's Vorkurs card). All three lines
				     share one size and one weight — no headline/caption hierarchy —
				     so the label reads as a single set piece of type, not a mini-
				     poster. Text is always black; the card's own colour (catalogBg)
				     only appears on hover, via --spec-bg below. Where specimenWeight
				     is set (Alfred — no drawings yet) it overrides the family's
				     default weight uniformly across all three lines, so the
				     placeholder reads as "one weight of Norma", not an attempt at
				     Norma's own real specimen. -->
				<div
					class="FontCard__specimen"
					style="--spec-bg: {tf.catalogBg}; font-family: '{tf.fontFamily}', sans-serif;"
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
		font-size: 15px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
	}

	.FontCard__sep {
		color: var(--color-text-mute);
		opacity: 0.6;
	}

	.FontCard__classification {
		font-family: 'Norma', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	/* Specimen block — fixed aspect so every card in the grid holds the same
	   proportions regardless of how much its specimen sets. Text is always
	   black: catalogBg is chosen light enough for that pairing (see
	   typefaces.ts) for when the hover rule below brings it in. */
	.FontCard__specimen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 10;
		background: transparent;
		color: #000;
		letter-spacing: 0;
		padding: clamp(20px, 4vw, 40px);
		font-variant-numeric: tabular-nums slashed-zero;
		transition: background-color 0.2s ease;
	}

	/* Swatch only on hover — see --spec-bg set inline above. At rest the
	   specimen sits directly on the page background (no colour, no border),
	   so the grid reads as plain type until a card is hovered. */
	.FontCard:hover .FontCard__specimen {
		background: var(--spec-bg);
	}

	/* Uniform museum-label type: all three lines share one size and one
	   weight (2026-08-29 — an earlier pass gave the dedicatee line its own
	   larger, bolder treatment; this reads instead as one continuous set
	   line, closer to a gallery wall label than a poster headline). The
	   three lines still carry distinct roles — a date/edition tag, the
	   dedicatee or institution, a short descriptor — the typography just no
	   longer distinguishes them. */
	.FontCard__spec-tag,
	.FontCard__spec-lead,
	.FontCard__spec-desc {
		display: block;
		text-align: center;
		font-size: clamp(20px, 3.2vw, 36px);
		line-height: 1.15;
	}

	.FontCard__spec-tag {
		margin-bottom: clamp(4px, 1vw, 10px);
	}

	.FontCard__spec-desc {
		margin-top: clamp(4px, 1vw, 10px);
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
		font-family: 'Norma', sans-serif;
		font-size: 13px;
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	.FontCard__view {
		font-family: 'Norma', sans-serif;
		font-size: 13px;
		letter-spacing: 0;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		padding: 8px 18px;
		white-space: nowrap;
	}
</style>
