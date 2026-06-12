<script lang="ts">
	import { TYPEFACES } from '$lib/data/typefaces.js';

	// Sort by order (ascending) to guarantee display sequence
	const typefaces = TYPEFACES.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);
</script>

<svelte:head>
	<title>Fonts — August Type Foundry</title>
	<meta
		name="description"
		content="August Type Foundry typeface catalogue — Steiner and upcoming releases."
	/>
</svelte:head>

<main class="Fonts">
	<div class="Fonts__inner">
		<header class="Fonts__head">
			<h1 class="Fonts__heading">Fonts</h1>
			<p class="Fonts__sub">All typefaces from August Type Foundry.</p>
		</header>

		<ul class="Fonts__list" aria-label="Typeface catalogue">
			{#each typefaces as tf (tf.slug)}
				<li class="FontCard">
					<a href="/fonts/{tf.slug}" class="FontCard__link" aria-label="View {tf.name}">
						<!-- Specimen: typeface name rendered in its own font -->
						<div class="FontCard__specimen" style="font-family: '{tf.fontFamily}', sans-serif;">
							{tf.name}
						</div>

						<div class="FontCard__meta">
							<span class="FontCard__classification">{tf.classification}</span>

							{#if tf.status === 'in-development'}
								<span class="FontCard__badge" aria-label="Status: in development">
									In development
								</span>
							{/if}
						</div>

						{#if tf.status === 'available'}
							<div class="FontCard__cta">
								<span class="FontCard__buy">Buy →</span>
							</div>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</main>

<style>
	.Fonts {
		min-height: 100vh;
		padding-top: 96px;
		padding-bottom: 96px;
		padding-inline: var(--padding);
	}

	@media (min-width: 768px) {
		.Fonts {
			padding-top: 120px;
		}
	}

	.Fonts__inner {
		max-width: 960px;
		margin: 0 auto;
	}

	.Fonts__head {
		margin-bottom: 64px;
	}

	.Fonts__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(36px, 6vw, 64px);
		letter-spacing: 0;
		line-height: 1.05;
		margin: 0 0 12px;
	}

	.Fonts__sub {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		line-height: 1.5;
		margin: 0;
	}

	/* Catalogue list — full-width stacked cards */
	.Fonts__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	/* Card */
	.FontCard {
		border-top: 1px solid var(--color-line);
	}

	.FontCard:last-child {
		border-bottom: 1px solid var(--color-line);
	}

	.FontCard__link {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		padding-block: 32px;
		text-decoration: none;
		color: inherit;
		transition: opacity 0.15s ease;
	}

	.FontCard__link:hover {
		opacity: 0.7;
	}

	@media (min-width: 768px) {
		.FontCard__link {
			grid-template-columns: 1fr auto;
			grid-template-rows: auto auto;
			align-items: center;
			padding-block: 40px;
		}
	}

	/* Large specimen text */
	.FontCard__specimen {
		font-size: clamp(48px, 10vw, 120px);
		line-height: 0.95;
		letter-spacing: 0;
		grid-column: 1;
	}

	/* Meta row: classification + badge */
	.FontCard__meta {
		display: flex;
		align-items: center;
		gap: 12px;
		grid-column: 1;
	}

	.FontCard__classification {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	.FontCard__badge {
		font-family: 'Steiner', sans-serif;
		font-size: 10px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		color: var(--color-text-mute);
		border: 1px solid var(--color-line);
		padding: 2px 8px;
		opacity: 0.7;
	}

	/* Buy CTA — desktop: right column, mobile: below meta */
	.FontCard__cta {
		grid-column: 1;
	}

	@media (min-width: 768px) {
		.FontCard__cta {
			grid-column: 2;
			grid-row: 1 / 3;
			align-self: center;
		}
	}

	.FontCard__buy {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		white-space: nowrap;
	}
</style>
