<script lang="ts">
	import { untrack } from 'svelte';
	import type { WeightDef } from './presets.js';
	import type { AlignValue } from './presets.js';

	interface Props {
		weight: WeightDef;
		/** Each row owns its text independently; this sets the initial value. */
		defaultText: string;
		/** Body text under the word. Fixed size — the slider drives the word only. */
		defaultNote?: string;
		/** CSS font-family name — allows different typefaces to share this component */
		fontFamily: string;
		/** Starting size in px */
		initialSize?: number;
		/** Starting text alignment */
		initialAlign?: AlignValue;
	}

	let { weight, defaultText, defaultNote, fontFamily, initialSize = 125, initialAlign = 'center' }: Props = $props();

	const SIZE_MIN = 12;
	const SIZE_MAX = 200;

	let size = $state(untrack(() => initialSize));
	let sliderEl = $state<HTMLInputElement>();
	let dragging = false;

	function valueFromX(clientX: number) {
		if (!sliderEl) return size;
		const r = sliderEl.getBoundingClientRect();
		const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
		return Math.round(SIZE_MIN + t * (SIZE_MAX - SIZE_MIN));
	}

	function onMove(e: PointerEvent) {
		if (dragging) size = valueFromX(e.clientX);
	}

	function endDrag() {
		dragging = false;
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', endDrag);
		window.removeEventListener('pointercancel', endDrag);
	}

	// iOS Safari only drags a range input when the touch lands on the thumb
	// itself — tapping the track does nothing, and the thumb here is 7px. So the
	// value is driven from the pointer instead: the whole track is grabbable and
	// the thumb tracks the finger 1:1. Listeners go on window (not
	// setPointerCapture) so a drag that leaves the control still works without
	// retargeting the eventual click.
	function startDrag(e: PointerEvent) {
		e.preventDefault();
		dragging = true;
		size = valueFromX(e.clientX);
		sliderEl?.focus(); // preventDefault above skips the native focus
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', endDrag);
		window.addEventListener('pointercancel', endDrag);
	}

	$effect(() => endDrag);
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
				min={SIZE_MIN}
				max={SIZE_MAX}
				bind:value={size}
				bind:this={sliderEl}
				onpointerdown={startDrag}
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

	{#if defaultNote}
		<!-- Body copy under the word. Deliberately a fixed size and not editable:
		     the row reads as a title with a paragraph, and the slider stays a
		     control for the specimen above it. -->
		<p
			class="WeightRow__note"
			style="
        font-family: '{fontFamily}', sans-serif;
        font-variation-settings: 'wght' {weight.axisValue};
        text-align: {align};
      "
		>
			{defaultNote}
		</p>
	{/if}
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
	.WeightRow__text,
	.WeightRow__note {
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
	/* The visible track is a 1.5px hairline, but the input itself has to be tall
	   enough to grab with a thumb — a 1.5px-high control is undraggable on
	   touch. So the box is 24px and transparent, and the hairline is drawn by
	   the track pseudo-element inside it. `touch-action: none` keeps the drag
	   from being read as a page scroll. */
	.WeightRow__size-range {
		flex: none;
		width: 72px;
		height: 24px;
		appearance: none;
		-webkit-appearance: none;
		background: transparent;
		cursor: pointer;
		touch-action: none;
	}

	.WeightRow__size-range::-webkit-slider-runnable-track {
		height: 1.5px;
		background: var(--color-line);
	}

	.WeightRow__size-range::-moz-range-track {
		height: 1.5px;
		background: var(--color-line);
	}

	.WeightRow__size-range::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-text);
		border: none;
		/* centre the 7px thumb on the 1.5px track */
		margin-top: -2.75px;
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

	.WeightRow__note {
		/* SP size; the desktop step is in the media block below. */
		font-size: 16px;
		line-height: 1.5;
		letter-spacing: 0;
		color: var(--color-text);
		margin: 0;
		max-width: 60ch;
		margin-inline: auto;
	}

	/* Must follow the rule above, not precede it: a media query adds no
	   specificity, so source order decides. */
	@media (min-width: 768px) {
		.WeightRow__note {
			font-size: 32px;
			line-height: 1.35;
			max-width: 44ch;
		}
	}

	.WeightRow__text {
		display: block;
		width: 100%;
		/* pre-wrap keeps any line break the visitor types in themselves */
		white-space: pre-wrap;
		word-break: break-word;
		min-height: 1em;
		cursor: text;
		outline: none;
		padding-block: 8px;
	}
</style>
