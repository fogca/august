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

				<!-- Specimen: a boarding pass set in the face itself, rather than the
				     typeface's own name. Text is always black, whatever catalogBg
				     is, per the card design. The barcode is the one decorative,
				     non-type element — everything else here is the specimen. -->
				<div
					class="FontCard__specimen"
					style="background: {tf.catalogBg}; font-family: '{tf.fontFamily}', sans-serif;"
				>
					{#if tf.specimen}
						{@const s = tf.specimen}
						<div class="Ticket">
							<div class="Ticket__flight">
								<span class="Ticket__label">Flight</span>
								<span class="Ticket__flight-no">{s.flightNo}</span>
							</div>

							<div class="Ticket__route">
								<div class="Ticket__stop">
									<span class="Ticket__label">From</span>
									<span class="Ticket__code">{s.fromCode}</span>
									<span class="Ticket__city">{s.fromCity}</span>
								</div>
								<span class="Ticket__arrow" aria-hidden="true">→</span>
								<div class="Ticket__stop">
									<span class="Ticket__label">To</span>
									<span class="Ticket__code">{s.toCode}</span>
									<span class="Ticket__city">{s.toCity}</span>
								</div>
							</div>

							<div class="Ticket__grid">
								<div class="Ticket__cell">
									<span class="Ticket__label">Date</span>
									<span class="Ticket__value">{s.date}</span>
								</div>
								<div class="Ticket__cell">
									<span class="Ticket__label">Gate</span>
									<span class="Ticket__value">{s.gate}</span>
								</div>
								<div class="Ticket__cell">
									<span class="Ticket__label">Time</span>
									<span class="Ticket__value">{s.time}</span>
								</div>
								<div class="Ticket__cell">
									<span class="Ticket__label">Seat</span>
									<span class="Ticket__value">{s.seat}</span>
								</div>
							</div>

							<svg
								class="Ticket__barcode"
								viewBox="0 0 200 24"
								preserveAspectRatio="none"
								aria-hidden="true"
							>
								<rect fill="currentColor" x="0" y="0" width="2" height="24" />
								<rect fill="currentColor" x="4" y="0" width="1" height="24" />
								<rect fill="currentColor" x="7" y="0" width="3" height="24" />
								<rect fill="currentColor" x="12" y="0" width="1" height="24" />
								<rect fill="currentColor" x="15" y="0" width="2" height="24" />
								<rect fill="currentColor" x="19" y="0" width="1" height="24" />
								<rect fill="currentColor" x="22" y="0" width="4" height="24" />
								<rect fill="currentColor" x="28" y="0" width="1" height="24" />
								<rect fill="currentColor" x="31" y="0" width="2" height="24" />
								<rect fill="currentColor" x="35" y="0" width="1" height="24" />
								<rect fill="currentColor" x="38" y="0" width="1" height="24" />
								<rect fill="currentColor" x="41" y="0" width="3" height="24" />
								<rect fill="currentColor" x="46" y="0" width="2" height="24" />
								<rect fill="currentColor" x="50" y="0" width="1" height="24" />
								<rect fill="currentColor" x="53" y="0" width="1" height="24" />
								<rect fill="currentColor" x="56" y="0" width="4" height="24" />
								<rect fill="currentColor" x="62" y="0" width="1" height="24" />
								<rect fill="currentColor" x="65" y="0" width="2" height="24" />
								<rect fill="currentColor" x="69" y="0" width="1" height="24" />
								<rect fill="currentColor" x="72" y="0" width="3" height="24" />
								<rect fill="currentColor" x="77" y="0" width="1" height="24" />
								<rect fill="currentColor" x="80" y="0" width="1" height="24" />
								<rect fill="currentColor" x="83" y="0" width="2" height="24" />
								<rect fill="currentColor" x="87" y="0" width="4" height="24" />
								<rect fill="currentColor" x="93" y="0" width="1" height="24" />
								<rect fill="currentColor" x="96" y="0" width="1" height="24" />
								<rect fill="currentColor" x="99" y="0" width="2" height="24" />
								<rect fill="currentColor" x="103" y="0" width="1" height="24" />
								<rect fill="currentColor" x="106" y="0" width="3" height="24" />
								<rect fill="currentColor" x="111" y="0" width="1" height="24" />
								<rect fill="currentColor" x="114" y="0" width="2" height="24" />
								<rect fill="currentColor" x="118" y="0" width="1" height="24" />
								<rect fill="currentColor" x="121" y="0" width="1" height="24" />
								<rect fill="currentColor" x="124" y="0" width="4" height="24" />
								<rect fill="currentColor" x="130" y="0" width="2" height="24" />
								<rect fill="currentColor" x="134" y="0" width="1" height="24" />
								<rect fill="currentColor" x="137" y="0" width="1" height="24" />
								<rect fill="currentColor" x="140" y="0" width="3" height="24" />
								<rect fill="currentColor" x="145" y="0" width="1" height="24" />
								<rect fill="currentColor" x="148" y="0" width="2" height="24" />
								<rect fill="currentColor" x="152" y="0" width="1" height="24" />
								<rect fill="currentColor" x="155" y="0" width="4" height="24" />
								<rect fill="currentColor" x="161" y="0" width="1" height="24" />
								<rect fill="currentColor" x="164" y="0" width="1" height="24" />
								<rect fill="currentColor" x="167" y="0" width="2" height="24" />
								<rect fill="currentColor" x="171" y="0" width="3" height="24" />
								<rect fill="currentColor" x="176" y="0" width="1" height="24" />
								<rect fill="currentColor" x="179" y="0" width="2" height="24" />
								<rect fill="currentColor" x="183" y="0" width="1" height="24" />
								<rect fill="currentColor" x="186" y="0" width="1" height="24" />
								<rect fill="currentColor" x="189" y="0" width="4" height="24" />
								<rect fill="currentColor" x="195" y="0" width="2" height="24" />
							</svg>
						</div>
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
		align-items: center;
		justify-content: center;
		aspect-ratio: 16 / 10;
		color: #000;
		letter-spacing: 0;
		padding: clamp(20px, 4vw, 40px);
		font-variant-numeric: tabular-nums slashed-zero;
	}

	.FontCard__spec-lead {
		font-size: clamp(28px, 4.4vw, 52px);
		text-align: center;
	}

	/* ── The boarding pass itself ───────────────────────────────────────── */
	.Ticket {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: clamp(14px, 2.2vw, 22px);
	}

	.Ticket__label {
		display: block;
		font-size: clamp(9px, 1vw, 11px);
		font-weight: var(--fw-ui);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		opacity: 0.55;
		margin-bottom: 4px;
	}

	.Ticket__flight-no {
		display: block;
		font-size: clamp(14px, 1.6vw, 18px);
		font-weight: var(--fw-ui);
		font-variation-settings: 'wght' 650;
	}

	.Ticket__route {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: clamp(10px, 2vw, 20px);
	}

	.Ticket__stop {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.Ticket__stop:last-child {
		align-items: flex-end;
		text-align: right;
	}

	/* The airport code is the headline of the whole specimen — heavy weight,
	   large size, doing the same job the typeface's own name used to. */
	.Ticket__code {
		font-size: clamp(40px, 8vw, 84px);
		line-height: 0.9;
		font-variation-settings: 'wght' 750;
	}

	.Ticket__city {
		font-size: clamp(11px, 1.3vw, 15px);
		opacity: 0.7;
		margin-top: 2px;
	}

	.Ticket__arrow {
		font-size: clamp(16px, 2.2vw, 26px);
		opacity: 0.6;
		flex: none;
		align-self: center;
		padding-top: clamp(10px, 2vw, 20px);
	}

	.Ticket__grid {
		display: flex;
		gap: clamp(16px, 3vw, 32px);
		border-top: 1px solid currentColor;
		padding-top: clamp(10px, 1.6vw, 16px);
		opacity: 1;
	}

	.Ticket__cell {
		display: flex;
		flex-direction: column;
	}

	.Ticket__value {
		font-size: clamp(13px, 1.6vw, 18px);
		font-variation-settings: 'wght' 550;
	}

	/* Decorative only — not a type specimen, just the prop that says "this is
	   a boarding pass". Faint, so it reads as texture rather than content. */
	.Ticket__barcode {
		width: 100%;
		height: clamp(14px, 2.4vw, 22px);
		opacity: 0.55;
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
