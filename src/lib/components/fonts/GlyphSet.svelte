<script lang="ts">
	// Full glyph set (全グリフ). Image-driven: if a full-set image is supplied it
	// is shown; otherwise a responsive grid of glyph tiles is rendered live in the
	// webfont as a stand-in until the export is dropped in.
	interface Props {
		fontFamily: string;
		image?: string;
		title?: string;
	}

	let { fontFamily, image, title = 'Character set' }: Props = $props();

	// Per the Glyph Roster in Projects/brands/August/md/specification.md.
	// Displayable characters of Tier 1 (basic Latin), Tier 2 standalone Unicode
	// (fractions, ordinals), Tier 3 (Western-European diacritics) and the common
	// Tier 4 Central-European diacritics — ~280 glyphs. OpenType-feature glyphs
	// (small caps, alternate figures, ligatures, stylistic sets) live in the
	// OpenType Features section instead.
	const CHARSET =
		// Tier 1 — basic Latin
		'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
		'abcdefghijklmnopqrstuvwxyz' +
		'0123456789' +
		// Tier 1 — punctuation & symbols
		'.,:;…!?·•-–—_(){}[]/\\|' +
		'&@#*%§¶©®™' +
		'“”‘’„‚' +
		"\"'" +
		'«»‹›' +
		// Tier 1 — currency & math
		'$€£¥' +
		'+−×÷=±' +
		// Tier 2 — fractions & ordinals (standalone Unicode)
		'½⅓⅔¼¾⅛⅜⅝⅞' +
		'ªº' +
		// Tier 3 — Western-European diacritics
		'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØŒÙÚÛÜÝŸÞß' +
		'àáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿþ' +
		'¡¿' +
		// Tier 4 — Central-European diacritics (Latin Extended-A)
		'ĀĂĄĆĈĊČĎĐĒĖĘĚĞĠĪĮİĶĹĻĽŁŃŅŇŌŐŔŖŘŚŜŞŠŢŤŪŮŰŲŴŶŹŻŽ' +
		'āăąćĉċčďđēėęěğġīįıķĺļľłńņňōőŕŗřśŝşšţťūůűųŵŷźżž';

	const glyphs = $derived([...CHARSET]);
</script>

<section class="GlyphSet" aria-label={title}>
	<p class="GlyphSet__label">{title}</p>

	{#if image}
		<img class="GlyphSet__img" src={image} alt={title} />
	{:else}
		<div class="GlyphSet__grid" style="font-family: '{fontFamily}', sans-serif;">
			{#each glyphs as g, i (i)}
				<span class="GlyphSet__cell">{g}</span>
			{/each}
		</div>
	{/if}
</section>

<style>
	.GlyphSet {
		padding: 40px var(--padding) 48px;
		border-top: 1px solid var(--color-line);
	}

	.GlyphSet__label {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h5);
		color: var(--color-text-mute);
		letter-spacing: 0;
		margin: 0 0 16px;
	}

	.GlyphSet__img {
		width: 100%;
		height: auto;
		display: block;
	}

	/* Compact, borderless dense grid — no boxy hairlines, tight rows */
	.GlyphSet__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(22px, 1fr));
	}

	@media (min-width: 768px) {
		.GlyphSet__grid {
			grid-template-columns: repeat(auto-fill, minmax(26px, 1fr));
		}
	}

	.GlyphSet__cell {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 30px;
		font-size: clamp(14px, 1.9vw, 18px);
		font-variation-settings: 'wght' 400;
		line-height: 1;
		color: var(--color-text);
	}
</style>
