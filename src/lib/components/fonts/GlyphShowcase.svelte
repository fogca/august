<script lang="ts">
	// Editorial glyph showcase — a handful of categories (currency, punctuation,
	// symbols, fractions), each framed in its own 21:9 box with the glyphs set
	// large and centred, rather than GlyphSet's dense reference grid. Black/
	// white, matching OpenTypeFeatures directly below it; the two read as one
	// continuous dark block.
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
		{ label: 'Currency', glyphs: '¤ $ € £ ¥ ¢ ₩ ₽ ₺ ₱' },
		{ label: 'Punctuation', glyphs: '. , : ; … ! ? — – ( ) [ ] / \\ |' },
		{ label: 'Symbols', glyphs: '& @ # * % § ¶ © ® ™' },
		{ label: 'Fractions', glyphs: '½ ⅓ ⅔ ¼ ¾ ⅛ ⅜ ⅝ ⅞' }
	];

	let { fontFamily, title = 'Beyond A–Z', categories = DEFAULT_CATEGORIES }: Props = $props();
</script>

<section class="GlyphShowcase" aria-label={title}>
	<p class="GlyphShowcase__label">{title}</p>

	<div class="GlyphShowcase__grid">
		{#each categories as cat (cat.label)}
			<div class="GlyphShowcase__box">
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
		/* Same red as Buy/Footer (base.css :root token), not the OpenTypeFeatures
		   black it flows into below — a deliberate seam between the two now. */
		background: var(--color-signal);
		color: #fff;
		padding: 80px var(--padding) 60px;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
	}

	.GlyphShowcase__label {
		font-family: 'Norma', sans-serif;
		font-size: var(--fs-h5);
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 0;
		margin: 0 0 40px;
	}

	.GlyphShowcase__grid {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	/* Framed box, not a divider line — width matches the section's own inset
	   (unchanged), height follows it at 21:9. */
	.GlyphShowcase__box {
		position: relative;
		aspect-ratio: 21 / 9;
		border: 1px solid rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px 48px;
	}

	.GlyphShowcase__cat {
		position: absolute;
		top: 16px;
		left: 20px;
		font-family: 'Norma', sans-serif;
		font-size: var(--fs-h6);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.5);
	}

	.GlyphShowcase__glyphs {
		font-size: clamp(32px, 7vw, 80px);
		line-height: 1.2;
		letter-spacing: 0.04em;
		text-align: center;
		color: #fff;
		/* Long punctuation/symbol rows wrap inside the box rather than
		   overflowing it. */
		overflow-wrap: break-word;
	}
</style>
