<script lang="ts">
	// Hero specimen that flips through the alphabet, one glyph at a time.
	// White on black — used in place of a hero photo on the typeface page.
	import { onMount } from 'svelte';

	type Props = {
		/** Characters to step through, in order. */
		glyphs?: string;
		/** Milliseconds each glyph stays on screen. */
		interval?: number;
	};

	const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const LOWER = 'abcdefghijklmnopqrstuvwxyz';

	let { glyphs = UPPER + LOWER, interval = 110 }: Props = $props();

	let index = $state(0);
	const glyph = $derived(glyphs[index] ?? glyphs[0]);

	onMount(() => {
		// Honour reduced-motion: hold a single glyph instead of flashing.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const id = setInterval(() => {
			index = (index + 1) % glyphs.length;
		}, interval);
		return () => clearInterval(id);
	});
</script>

<div class="GlyphCycle" aria-hidden="true">
	<span class="GlyphCycle__glyph">{glyph}</span>
</div>

<style>
	.GlyphCycle {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;
		color: #fff;
	}

	.GlyphCycle__glyph {
		font-family: 'Norma', sans-serif;
		font-size: clamp(160px, 34vw, 460px);
		line-height: 1;
		letter-spacing: 0;
		color: #fff;
		user-select: none;
		/* Fixed box so glyphs of different widths don't shift the centre. */
		display: block;
		text-align: center;
	}
</style>
