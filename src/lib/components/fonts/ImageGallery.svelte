<script lang="ts">
	// Reusable image section for the typeface pages — used for OpenType Features,
	// In Use, and Other images. Each item renders its image when `src` is present;
	// otherwise a labelled placeholder tile so the section's layout is visible
	// before the exports are dropped in.
	export interface GalleryItem {
		src?: string;
		alt?: string;
		caption?: string;
	}

	interface Props {
		title: string;
		items: GalleryItem[];
		/** Columns at desktop width (default 2). */
		columns?: number;
		/** Tile aspect ratio, e.g. '16 / 10' (default '16 / 10'). */
		ratio?: string;
	}

	let { title, items, columns = 2, ratio = '16 / 10' }: Props = $props();
</script>

<section class="Gallery" aria-label={title} style="--cols: {columns}; --ratio: {ratio};">
	<p class="Gallery__label">{title}</p>

	<div class="Gallery__grid">
		{#each items as item, i (i)}
			<figure class="Gallery__item">
				{#if item.src}
					<img class="Gallery__img" src={item.src} alt={item.alt ?? item.caption ?? ''} />
				{:else}
					<div class="Gallery__placeholder" aria-hidden="true">
						<span>{item.caption ?? 'Image'}</span>
					</div>
				{/if}
				{#if item.caption}
					<figcaption class="Gallery__caption">{item.caption}</figcaption>
				{/if}
			</figure>
		{/each}
	</div>
</section>

<style>
	.Gallery {
		padding: 80px var(--padding);
		border-top: 1px solid var(--color-line);
	}

	.Gallery__label {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h5);
		color: var(--color-text-mute);
		letter-spacing: 0;
		margin: 0 0 32px;
	}

	.Gallery__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	@media (min-width: 768px) {
		.Gallery__grid {
			grid-template-columns: repeat(var(--cols), 1fr);
			gap: 24px;
		}
	}

	.Gallery__item {
		margin: 0;
	}

	.Gallery__img {
		width: 100%;
		height: auto;
		display: block;
	}

	.Gallery__placeholder {
		aspect-ratio: var(--ratio);
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-gray);
		border: 1px dashed var(--color-line);
	}

	.Gallery__placeholder span {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-mute);
	}

	.Gallery__caption {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin-top: 10px;
	}
</style>
