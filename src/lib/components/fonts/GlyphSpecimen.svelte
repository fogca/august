<script lang="ts">
	// Large 3-row character specimen: A–Z, a–z, and ~30 standard symbols, each on
	// its own row at the same size. Image-driven: if a row image is supplied it is
	// shown; otherwise the row falls back to live text rendered in the webfont
	// (so the layout is visible before glyph images are exported).
	interface Props {
		fontFamily: string;
		images?: { uppercase?: string; lowercase?: string; symbols?: string };
	}

	let { fontFamily, images }: Props = $props();

	const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const LOWER = 'abcdefghijklmnopqrstuvwxyz';
	const SYMBOLS = '& ! ? @ # % * + = / ( ) [ ] { } < > . , : ; " ’ - – — … • $ € ¥';

	const rows = $derived([
		{ key: 'uppercase', text: UPPER, img: images?.uppercase },
		{ key: 'lowercase', text: LOWER, img: images?.lowercase },
		{ key: 'symbols', text: SYMBOLS, img: images?.symbols }
	]);
</script>

<section class="GlyphSpecimen" aria-label="Character specimen">
	{#each rows as row (row.key)}
		<div class="GlyphSpecimen__row">
			{#if row.img}
				<img class="GlyphSpecimen__img" src={row.img} alt="" />
			{:else}
				<p class="GlyphSpecimen__text" style="font-family: '{fontFamily}', sans-serif;">
					{row.text}
				</p>
			{/if}
		</div>
	{/each}
</section>

<style>
	.GlyphSpecimen {
		padding: 80px var(--padding);
		display: flex;
		flex-direction: column;
		gap: 24px;
		border-top: 1px solid var(--color-line);
	}

	.GlyphSpecimen__row {
		display: block;
	}

	.GlyphSpecimen__img {
		width: 100%;
		height: auto;
		display: block;
	}

	.GlyphSpecimen__text {
		font-size: clamp(34px, 8.5vw, 104px);
		font-variation-settings: 'wght' 400;
		line-height: 1.1;
		letter-spacing: 0.01em;
		margin: 0;
		word-break: break-word;
	}
</style>
