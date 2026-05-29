<script lang="ts">
	import { untrack } from 'svelte';
	import type { WeightDef } from './presets.js';

	interface Props {
		weight: WeightDef;
		text: string;
		/** CSS font-family name — allows different typefaces to share this component */
		fontFamily: string;
		/** Starting size in px */
		initialSize?: number;
		/** Called when the user edits this row directly (contenteditable) */
		onTextChange?: (value: string) => void;
	}

	let { weight, text, fontFamily, initialSize = 24, onTextChange }: Props = $props();

	// Per-row size (control sits to the right of the wght label).
	let size = $state(untrack(() => initialSize));
	let el = $state<HTMLElement>();

	// Keep the row in sync with the shared text, but never overwrite the row the
	// user is actively editing — that would reset the caret position.
	$effect(() => {
		if (el && document.activeElement !== el && el.textContent !== text) {
			el.textContent = text;
		}
	});

	function handleInput() {
		onTextChange?.(el?.textContent ?? '');
	}
</script>

<div class="WeightRow" role="listitem">
	<div class="WeightRow__meta">
		<span class="label-name">{weight.name}</span>
		<span class="label-axis">wght {weight.axisValue}</span>
		<label class="WeightRow__size">
			<input
				class="WeightRow__size-range"
				type="range"
				min="12"
				max="200"
				bind:value={size}
				aria-label="{weight.name} size"
			/>
			<span class="WeightRow__size-val">{size}px</span>
		</label>
	</div>

	<!-- Click to place a caret and type directly; edits propagate to every row -->
	<div
		class="WeightRow__text"
		bind:this={el}
		contenteditable="true"
		oninput={handleInput}
		role="textbox"
		tabindex="0"
		aria-multiline="true"
		aria-label="{weight.name} weight — editable preview"
		spellcheck="false"
		style="
      font-family: '{fontFamily}', sans-serif;
      font-variation-settings: 'wght' {weight.axisValue};
      font-size: {size}px;
      line-height: 1.2;
    "
	></div>
</div>

<style>
	.WeightRow {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-block: 16px;
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
	}

	.label-name {
		font-weight: 500;
		min-width: 64px;
	}

	.label-axis {
		font-weight: 400;
		opacity: 0.45;
		min-width: 56px;
	}

	/* Size control — sits to the right of the wght label */
	.WeightRow__size {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* Thin track — same as the previous control-panel slider */
	.WeightRow__size-range {
		flex: none;
		width: 90px;
		height: 1.5px;
		accent-color: var(--color-text);
		cursor: pointer;
	}

	.WeightRow__size-val {
		font-variation-settings: normal;
		min-width: 25px;
		text-align: right;
		opacity: 0.45;
	}

	.WeightRow__text {
		display: block;
		width: 100%;
		word-break: break-word;
		min-height: 1em;
		cursor: text;
		outline: none;
	}

	/* Desktop: label column | text */
	@media (min-width: 768px) {
		.WeightRow {
			display: grid;
			grid-template-columns: 240px 1fr;
			align-items: baseline;
			gap: 0 24px;
			flex-direction: unset;
		}

		.WeightRow__meta {
			flex-wrap: wrap;
			gap: 8px 12px;
		}
	}
</style>
