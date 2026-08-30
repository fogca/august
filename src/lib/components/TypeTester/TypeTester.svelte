<script lang="ts">
	import { browser } from '$app/environment';
	import WeightRow from './WeightRow.svelte';
	import type { WeightDef } from './presets.js';
	import {
		MOBILE_BREAKPOINT_PX,
		WEIGHT_ROW_SIZE_DEFAULT_DESKTOP,
		WEIGHT_ROW_SIZE_DEFAULT_MOBILE,
		WEIGHT_ROW_NOTE_DEFAULT_DESKTOP,
		WEIGHT_ROW_NOTE_DEFAULT_MOBILE,
		WEIGHT_ROW_ALIGN_DEFAULT_DESKTOP,
		WEIGHT_ROW_ALIGN_DEFAULT_MOBILE
	} from './presets.js';

	interface Props {
		weights: WeightDef[];
		fontFamily: string;
		/** Per-weight default word — row i uses defaultTexts[i % length]. One
		 *  word per row: at the default size a sentence would fill the row. */
		defaultTexts: string[];
		/** Body text set under each word, paired by the same index. */
		defaultNotes?: string[];
		/** When false, show an "in development" notice */
		available?: boolean;
	}

	let { weights, fontFamily, defaultTexts, defaultNotes, available = true }: Props = $props();

	// Viewport-dependent default size (evaluated once on mount)
	const isPhone = browser && window.innerWidth < MOBILE_BREAKPOINT_PX;
	const initialSize = isPhone ? WEIGHT_ROW_SIZE_DEFAULT_MOBILE : WEIGHT_ROW_SIZE_DEFAULT_DESKTOP;
	const initialNoteSize = isPhone
		? WEIGHT_ROW_NOTE_DEFAULT_MOBILE
		: WEIGHT_ROW_NOTE_DEFAULT_DESKTOP;
	const initialAlign = isPhone ? WEIGHT_ROW_ALIGN_DEFAULT_MOBILE : WEIGHT_ROW_ALIGN_DEFAULT_DESKTOP;
</script>

<section class="TypeTester" aria-label="Type Tester — {fontFamily}">
	<div class="TypeTester__header">
		<h2 class="TypeTester__title">Type Tester</h2>
		<p class="TypeTester__hint">Click any line to edit · drag A—A to resize</p>
		{#if !available}
			<p class="TypeTester__notice">
				{fontFamily} is in development. Preview shown in Atom.
			</p>
		{/if}
	</div>

	<div class="TypeTester__rows" role="list" aria-label="Weight specimens">
		{#each weights as weight, i (weight.id)}
			<WeightRow
				{weight}
				defaultText={defaultTexts[i % defaultTexts.length]}
				defaultNote={defaultNotes?.[i % defaultNotes.length]}
				{fontFamily}
				{initialSize}
				{initialNoteSize}
				{initialAlign}
			/>
		{/each}
	</div>
</section>

<style>
	/* padding-inline 0 so WeightRow border lines can span the full viewport */
	.TypeTester {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		padding-top: 60px;
		padding-inline: 0;
	}

	/* Unlike .TypeTester itself (padding-inline:0 so WeightRow's border lines
	   can span full-bleed), the header text needs real inset at every size —
	   it was sitting flush against the screen edge on mobile. */
	.TypeTester__header {
		padding-bottom: 32px;
		padding-inline: var(--padding);
	}

	.TypeTester__title {
		font-family: var(--font-en), sans-serif;
		font-size: var(--fs-h5);
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	.TypeTester__hint {
		font-family: var(--font-en), sans-serif;
		font-size: var(--fs-h6);
		color: var(--color-text-mute);
		margin-top: 6px;
		opacity: 0.7;
	}

	.TypeTester__notice {
		font-family: var(--font-en), sans-serif;
		font-size: var(--fs-h6);
		color: var(--color-text-mute);
		margin-top: 4px;
		opacity: 0.7;
	}

	/* No horizontal padding here — WeightRow pads its own content so its
	   border lines can run the full viewport width. */
	.TypeTester__rows {
		flex: 1;
	}
</style>
