<script lang="ts">
	import { untrack } from 'svelte';
	import WeightRow from './WeightRow.svelte';
	import type { WeightDef } from './presets.js';

	interface Props {
		weights: WeightDef[];
		fontFamily: string;
		defaultText: string;
		/** When false, show an "in development" notice */
		available?: boolean;
	}

	let { weights, fontFamily, defaultText, available = true }: Props = $props();

	// Shared text across all weight rows. Each row is directly editable
	// (contenteditable); editing any row updates this and propagates to the rest.
	let text = $state(untrack(() => defaultText));

	function handleText(value: string) {
		text = value;
	}
</script>

<section class="TypeTester" aria-label="Type Tester — {fontFamily}">
	<div class="TypeTester__header">
		<h2 class="TypeTester__title">Type Tester</h2>
		<p class="TypeTester__hint">Click any line to type · drag the slider to size each weight</p>
		{#if !available}
			<p class="TypeTester__notice">
				{fontFamily} is in development. Preview shown in Steiner.
			</p>
		{/if}
	</div>

	<div class="TypeTester__rows" role="list" aria-label="Weight specimens">
		{#each weights as weight (weight.id)}
			<WeightRow {weight} {text} {fontFamily} onTextChange={handleText} />
		{/each}
	</div>
</section>

<style>
	.TypeTester {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding-top: 60px;
	}

	.TypeTester__header {
		padding-bottom: 32px;
		padding-inline: 0;
	}

	@media (min-width: 768px) {
		.TypeTester__header {
			padding-inline: var(--padding);
		}
	}

	.TypeTester__title {
		font-family: var(--font-en), sans-serif;
		font-size: var(--fs-h5);
		font-weight: 400;
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

	.TypeTester__rows {
		flex: 1;
		padding-inline: 0;
	}

	@media (min-width: 768px) {
		.TypeTester__rows {
			padding-inline: var(--padding);
		}
	}
</style>
