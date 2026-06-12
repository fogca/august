<script lang="ts">
	import { untrack } from 'svelte';
	import type { WeightDef } from './presets.js';
	import type { AlignValue } from './presets.js';

	interface Props {
		weight: WeightDef;
		/** Each row owns its text independently; this sets the initial value. */
		defaultText: string;
		/** CSS font-family name — allows different typefaces to share this component */
		fontFamily: string;
		/** Starting size in px */
		initialSize?: number;
		/** Starting text alignment */
		initialAlign?: AlignValue;
	}

	let { weight, defaultText, fontFamily, initialSize = 64, initialAlign = 'center' }: Props = $props();

	let size = $state(untrack(() => initialSize));
	let align = $state<AlignValue>(untrack(() => initialAlign));
	let el = $state<HTMLElement>();

	// Seed the contenteditable with defaultText on mount.
	$effect(() => {
		if (el && el.textContent === '') {
			el.textContent = defaultText;
		}
	});

</script>

<div class="WeightRow" role="listitem">
	<div class="WeightRow__meta">
		<span class="label-name">{weight.name}</span>
		<span class="label-axis">wght {weight.axisValue}</span>
		<label class="WeightRow__size">
			<span class="size-icon size-icon--sm">A</span>
			<input
				class="WeightRow__size-range"
				type="range"
				min="12"
				max="200"
				bind:value={size}
				aria-label="{weight.name} size"
			/>
			<span class="size-icon size-icon--lg">A</span>
			<span class="WeightRow__size-val">{size}px</span>
		</label>
		<div class="WeightRow__align" role="group" aria-label="Text alignment">
			{#each (['left', 'center', 'right'] as AlignValue[]) as opt}
				<button
					class="align-btn"
					class:is-active={align === opt}
					onclick={() => (align = opt)}
					aria-pressed={align === opt}
					aria-label="Align {opt}"
					type="button"
				>
					<svg class="align-icon" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						{#if opt === 'left'}
							<line x1="0" y1="1" x2="14" y2="1" />
							<line x1="0" y1="5" x2="9" y2="5" />
							<line x1="0" y1="9" x2="14" y2="9" />
						{:else if opt === 'center'}
							<line x1="0" y1="1" x2="14" y2="1" />
							<line x1="2.5" y1="5" x2="11.5" y2="5" />
							<line x1="0" y1="9" x2="14" y2="9" />
						{:else}
							<line x1="0" y1="1" x2="14" y2="1" />
							<line x1="5" y1="5" x2="14" y2="5" />
							<line x1="0" y1="9" x2="14" y2="9" />
						{/if}
					</svg>
				</button>
			{/each}
		</div>
	</div>

	<div
		class="WeightRow__text"
		bind:this={el}
		contenteditable="true"
		role="textbox"
		tabindex="0"
		aria-multiline="true"
		aria-label="{weight.name} weight — editable preview"
		spellcheck="false"
		style="
      font-family: '{fontFamily}', sans-serif;
      font-variation-settings: 'wght' {weight.axisValue};
      font-size: {size}px;
      line-height: 1.15;
      text-align: {align};
    "
	></div>
</div>

<style>
	/* Border lines run the full viewport width; content is padded per-row. */
	.WeightRow {
		display: flex;
		flex-direction: column;
		gap: 15px;
		padding-block: 15px 20px;
		border-top: 1px solid var(--color-line);
		width: 100%;
	}

	.WeightRow:last-child {
		border-bottom: 1px solid var(--color-line);
	}

	.WeightRow__meta {
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--color-text-mute);
		font-family: var(--font-en), sans-serif;
		font-size: 10px;
		font-variation-settings: normal;
		letter-spacing: 0;
		line-height: 1.4;
		user-select: none;
		flex-wrap: wrap;
		opacity: 0.7;
	}

	.WeightRow__meta,
	.WeightRow__text {
		padding-inline: var(--padding);
	}

	.label-name {
		font-weight: var(--fw-strong);
		min-width: 28px;
	}

	.label-axis {
		opacity: 0.45;
		min-width: 56px;
	}

	.WeightRow__size {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: none;
	}

	/* Desktop: a little more slider travel */
	@media (min-width: 768px) {
		.WeightRow__size-range {
			width: 120px;
		}
	}

	.size-icon {
		font-family: var(--font-en), sans-serif;
		font-variation-settings: normal;
		opacity: 0.45;
		line-height: 1;
		flex: none;
	}

	.size-icon--sm {
		font-size: 8px;
	}

	.size-icon--lg {
		font-size: 13px;
	}

	/* Custom track/thumb — smaller thumb than the native default */
	.WeightRow__size-range {
		flex: none;
		width: 60px;
		height: 1.5px;
		appearance: none;
		-webkit-appearance: none;
		background: var(--color-line);
		cursor: pointer;
	}

	.WeightRow__size-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-text);
		border: none;
	}

	.WeightRow__size-range::-moz-range-thumb {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-text);
		border: none;
	}

	.WeightRow__size-val {
		font-variation-settings: normal;
		min-width: 28px;
		text-align: right;
		opacity: 0.45;
	}

	/* Alignment buttons */
	.WeightRow__align {
		display: flex;
		gap: 2px;
		margin-left: auto;
	}

	.align-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border: 1px solid transparent;
		border-radius: 5px;
		color: var(--color-text-mute);
		cursor: pointer;
		padding: 0;
		transition: color 0.12s, border-color 0.12s;
		background: transparent;
	}

	.align-btn:hover {
		color: var(--color-text);
	}

	.align-btn.is-active {
		color: var(--color-text);
		border-color: var(--color-line);
	}

	.align-icon {
		width: 14px;
		height: 12px;
		stroke: currentColor;
		stroke-width: 1;
		fill: none;
		stroke-linecap: round;
	}

	.WeightRow__text {
		display: block;
		width: 100%;
		word-break: break-word;
		min-height: 1em;
		cursor: text;
		outline: none;
		padding-block: 8px;
	}
</style>
