<script lang="ts">
	// Editorial glyph showcase — a handful of categories (currency, punctuation,
	// symbols, fractions), each set large on its own row, rather than GlyphSet's
	// dense reference grid. Black/white, matching OpenTypeFeatures directly
	// below it; the two read as one continuous dark block.
	interface Category {
		label: string;
		glyphs: string;
	}

	interface Props {
		fontFamily: string;
		title?: string;
		categories?: Category[];
	}

	const DEFAULT_CATEGORIES: Category[] = [
		{ label: 'Currency', glyphs: '$ € £ ¥' },
		{ label: 'Punctuation', glyphs: '. , : ; … ! ? — – ( ) [ ] / \\ |' },
		{ label: 'Symbols', glyphs: '& @ # * % § ¶ © ® ™' },
		{ label: 'Fractions', glyphs: '½ ⅓ ⅔ ¼ ¾ ⅛ ⅜ ⅝ ⅞' }
	];

	let { fontFamily, title = 'Beyond A–Z', categories = DEFAULT_CATEGORIES }: Props = $props();
</script>

<section class="GlyphShowcase" aria-label={title}>
	<p class="GlyphShowcase__label">{title}</p>

	<div class="GlyphShowcase__rows">
		{#each categories as cat (cat.label)}
			<div class="GlyphShowcase__row">
				<span class="GlyphShowcase__cat">{cat.label}</span>
				<span class="GlyphShowcase__glyphs" style="font-family: '{fontFamily}', sans-serif;">
					{cat.glyphs}
				</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.GlyphShowcase {
		background: #000;
		color: #fff;
		padding: 80px var(--padding) 60px;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
	}

	.GlyphShowcase__label {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h5);
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 0;
		margin: 0 0 40px;
	}

	.GlyphShowcase__rows {
		display: flex;
		flex-direction: column;
	}

	.GlyphShowcase__row {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
	}

	.GlyphShowcase__row:last-child {
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
	}

	.GlyphShowcase__cat {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h6);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.5);
	}

	.GlyphShowcase__glyphs {
		font-size: clamp(28px, 6vw, 56px);
		line-height: 1.3;
		letter-spacing: 0.04em;
		color: #fff;
		/* Long punctuation/symbol rows wrap on phones rather than overflowing. */
		overflow-wrap: break-word;
	}

	@media (min-width: 768px) {
		.GlyphShowcase__row {
			flex-direction: row;
			align-items: baseline;
			gap: 32px;
		}

		.GlyphShowcase__cat {
			flex-shrink: 0;
			width: 140px;
		}
	}
</style>
