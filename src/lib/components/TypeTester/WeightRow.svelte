<script lang="ts">
	import { untrack } from 'svelte';
	import { SHOW_ROW_TITLE, SHOW_ROW_NOTE } from './presets.js';
	import type { WeightDef } from './presets.js';
	import type { AlignValue } from './presets.js';

	interface Props {
		weight: WeightDef;
		/** Each row owns its text independently; this sets the initial value. */
		defaultText: string;
		/** Body copy under the word — editable and resizable like the word itself. */
		defaultNote?: string;
		/** CSS font-family name — allows different typefaces to share this component */
		fontFamily: string;
		/** Starting size in px */
		initialSize?: number;
		/** Starting size in px for the body copy */
		initialNoteSize?: number;
		/** Starting text alignment */
		initialAlign?: AlignValue;
		/** The row's label, where it is not the weight's own name (a tester line:
		 *  the typeface's name, with the weight's name beside it) */
		title?: string;
		/** Line-height of the text — running text wants more than the 1 a
		 *  single specimen word is set at */
		lineHeight?: number;
		/** Letter-spacing in em */
		letterSpacing?: number;
		/** Columns on a desktop screen (a phone always has one) */
		columns?: number;
		/** The weights a visitor can switch the row to (2026-11-08, at the
		 *  user's request — "weight選択できるようにして欲しい"). Left out, the
		 *  row stays at its own weight and only names it. */
		weightOptions?: WeightDef[];
	}

	let {
		weight,
		defaultText,
		defaultNote,
		fontFamily,
		initialSize = 125,
		initialNoteSize = 48,
		initialAlign = 'left',
		title,
		lineHeight = 1,
		letterSpacing = 0,
		columns = 1,
		weightOptions
	}: Props = $props();

	const rowName = $derived(title ?? weight.name);
	// What a screen reader calls the row: a weight row keeps "55 weight".
	const rowLabel = $derived(title ?? `${weight.name} weight`);

	const SIZE_MIN = 12;
	// 1000: the reference sets single words at up to ~700px, and the opening
	// "Vin" fills a 1440px screen at ~900px (2026-11-05).
	const SIZE_MAX = 1000;
	// The slider runs on a log scale — a linear one over 12-1000px would move
	// the body sizes by whole tens of px per step.
	const SLIDER_STEPS = 1000;
	const sizeToPos = (px: number) =>
		Math.round((Math.log(px / SIZE_MIN) / Math.log(SIZE_MAX / SIZE_MIN)) * SLIDER_STEPS);
	const posToSize = (pos: number) =>
		Math.round(SIZE_MIN * Math.pow(SIZE_MAX / SIZE_MIN, pos / SLIDER_STEPS));
	const NOTE_MIN = 10;
	const NOTE_MAX = 96;

	let size = $state(untrack(() => initialSize));
	let noteSize = $state(untrack(() => initialNoteSize));
	let align = $state<AlignValue>(untrack(() => initialAlign));
	// The row's weight: its own until a visitor picks another. The menu shows
	// the option nearest to it, so a line set between two named stops still
	// reads as one of them.
	let wght = $state(untrack(() => weight.axisValue));
	const selectedOption = $derived(
		weightOptions?.reduce((best, w) =>
			Math.abs(w.axisValue - wght) < Math.abs(best.axisValue - wght) ? w : best
		)
	);

	let el = $state<HTMLElement>();
	let noteEl = $state<HTMLElement>();
	let sliderEl = $state<HTMLInputElement>();
	let noteSliderEl = $state<HTMLInputElement>();

	type Drag = { el: HTMLInputElement; min: number; max: number; apply: (v: number) => void };
	let drag: Drag | null = null;

	function valueFrom(clientX: number, d: Drag) {
		const r = d.el.getBoundingClientRect();
		const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
		return Math.round(d.min + t * (d.max - d.min));
	}

	function onMove(e: PointerEvent) {
		if (drag) drag.apply(valueFrom(e.clientX, drag));
	}

	function endDrag() {
		drag = null;
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
	function startDrag(e: PointerEvent, d: Drag | undefined) {
		if (!d) return;
		e.preventDefault();
		drag = d;
		d.apply(valueFrom(e.clientX, d));
		d.el.focus(); // preventDefault above skips the native focus
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', endDrag);
		window.addEventListener('pointercancel', endDrag);
	}

	$effect(() => endDrag);

	// Seed both contenteditables on mount.
	$effect(() => {
		if (el && el.textContent === '') el.textContent = defaultText;
	});

	$effect(() => {
		if (noteEl && defaultNote && noteEl.textContent === '') noteEl.textContent = defaultNote;
	});
</script>

<div class="WeightRow" role="listitem">
	<div class="WeightRow__meta">
		<span class="label-name">{rowName}</span>
		{#if weightOptions && weightOptions.length > 1 && selectedOption}
			<select
				class="WeightRow__weight"
				value={selectedOption.axisValue}
				onchange={(e) => (wght = +e.currentTarget.value)}
				aria-label="{rowName} weight"
			>
				{#each weightOptions as opt (opt.id)}
					<option value={opt.axisValue}>{opt.label}</option>
				{/each}
			</select>
		{:else}
			<span class="label-axis">{weight.label}</span>
		{/if}
		{#if SHOW_ROW_TITLE}
			<label class="WeightRow__size">
				<span class="size-icon size-icon--sm">A</span>
				<input
					class="WeightRow__size-range"
					type="range"
					min="0"
					max={SLIDER_STEPS}
					step="5"
					value={sizeToPos(size)}
					oninput={(e) => (size = posToSize(+e.currentTarget.value))}
					bind:this={sliderEl}
					onpointerdown={(e) =>
						startDrag(
							e,
							sliderEl && {
								el: sliderEl,
								min: 0,
								max: SLIDER_STEPS,
								apply: (v) => (size = posToSize(v))
							}
						)}
					aria-label="{rowName} size"
				/>
				<span class="size-icon size-icon--lg">A</span>
				<span class="WeightRow__size-val">{size}px</span>
			</label>
		{/if}

		{#if SHOW_ROW_NOTE && defaultNote}
			<label class="WeightRow__size">
				<span class="size-icon size-icon--sm">a</span>
				<input
					class="WeightRow__size-range"
					type="range"
					min={NOTE_MIN}
					max={NOTE_MAX}
					bind:value={noteSize}
					bind:this={noteSliderEl}
					onpointerdown={(e) =>
						startDrag(
							e,
							noteSliderEl && {
								el: noteSliderEl,
								min: NOTE_MIN,
								max: NOTE_MAX,
								apply: (v) => (noteSize = v)
							}
						)}
					aria-label="{rowName} body size"
				/>
				<span class="size-icon size-icon--lg">a</span>
				<span class="WeightRow__size-val">{noteSize}px</span>
			</label>
		{/if}
		<div class="WeightRow__align" role="group" aria-label="Text alignment">
			{#each ['left', 'center', 'right'] as AlignValue[] as opt}
				<button
					class="align-btn"
					class:is-active={align === opt}
					onclick={() => (align = opt)}
					aria-pressed={align === opt}
					aria-label="Align {opt}"
					type="button"
				>
					<svg
						class="align-icon"
						viewBox="0 0 14 12"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
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

	{#if SHOW_ROW_TITLE}
		<div
			class="WeightRow__text"
			bind:this={el}
			contenteditable="true"
			role="textbox"
			tabindex="0"
			aria-multiline="true"
			aria-label="{rowLabel} — editable preview"
			spellcheck="false"
			style="
	      font-family: '{fontFamily}', sans-serif;
	      font-variation-settings: 'wght' {wght};
	      font-size: {size}px;
	      line-height: {lineHeight};
	      letter-spacing: {letterSpacing}em;
	      text-align: {align};
	      --cols: {columns};
	    "
		></div>
	{/if}

	{#if SHOW_ROW_NOTE && defaultNote}
		<!-- Body copy under the word. Deliberately a fixed size and not editable:
		     the row reads as a title with a paragraph, and the slider stays a
		     control for the specimen above it. -->
		<div
			class="WeightRow__note"
			bind:this={noteEl}
			contenteditable="true"
			role="textbox"
			tabindex="0"
			aria-multiline="true"
			aria-label="{rowLabel} — editable body copy"
			spellcheck="false"
			style="
        font-family: '{fontFamily}', sans-serif;
        font-variation-settings: 'wght' {wght};
        font-size: {noteSize}px;
        text-align: {align};
      "
		></div>
	{/if}
</div>

<style>
	/* Border lines run the full viewport width; content is padded per-row. */
	/* Mobile-first base; the >=768px block below sets the desktop spacing.
	   Tightened 2026-11-05, at the user's request ("それぞれのテスター間の余白が
	   広いので、もう少し詰めて"): what a row adds around its line is ~65px on a
	   desktop screen (was ~113px), the same as Kontrapunkt Type's rows. */
	.WeightRow {
		display: flex;
		flex-direction: column;
		/* No gap: the meta row carries the space under itself, and the specimen
		   sits directly on the body copy below it. */
		gap: 0;
		padding-block: 5px 16px;
		border-top: var(--border-line);
		width: 100%;
	}

	.WeightRow:last-child {
		border-bottom: var(--border-line);
	}

	.WeightRow__meta {
		display: flex;
		align-items: center;
		/* 8px on a phone, so the longer label (the typeface's name) and the
		   controls still fit one line; 12px from 768px up. */
		gap: 8px;
		margin-bottom: 10px;
		/* No rule under the row's label and controls (2026-11-04, at the user's
		   request — "testerのパラメータの下線は無しで"). */
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

	/* The weight menu reads as the weight's name beside the row's label, with
	   a small chevron to say it opens; the native list does the choosing. */
	.WeightRow__weight {
		appearance: none;
		-webkit-appearance: none;
		min-width: 56px;
		margin: 0;
		padding: 2px 16px 2px 0;
		border: 0;
		border-radius: 0;
		background: transparent
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'%3E%3Cpath d='M.5.5 4 4 7.5.5' fill='none' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E")
			no-repeat right 2px center / 8px 5px;
		color: inherit;
		font: inherit;
		font-variation-settings: normal;
		cursor: pointer;
	}

	.WeightRow__weight:focus-visible {
		outline: 1px solid currentColor;
		outline-offset: 2px;
	}

	.WeightRow__size {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: none;
	}

	/* Desktop: restore the roomier row spacing (SP was tightened above),
	   plus a little more slider travel. */
	@media (min-width: 768px) {
		.WeightRow {
			padding-block: 12px 16px;
		}

		.WeightRow__meta {
			gap: 12px;
			margin-bottom: 12px;
		}

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
		transition:
			color 0.12s,
			border-color 0.12s;
		background: transparent;
	}

	.align-btn:hover {
		color: var(--color-text);
	}

	.align-btn.is-active {
		color: var(--color-text);
		border: var(--border-line);
	}

	.align-icon {
		width: 14px;
		height: 12px;
		stroke: currentColor;
		stroke-width: 1;
		fill: none;
		stroke-linecap: round;
	}

	/* font-size comes from the inline style (its own slider); everything else
	   is fixed here. Editable, so it needs the same affordances as the word. */
	.WeightRow__note {
		line-height: 1.1;
		letter-spacing: 0;
		color: var(--color-text);
		margin: 0;
		max-width: 60ch;
		margin-inline: 0;
		white-space: pre-wrap;
		word-break: break-word;
		cursor: text;
		outline: none;
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
		padding-block: 0;
	}

	/* Running text can be set in columns on a wide screen (--cols, from the
	   line's own data); a phone always has one. */
	@media (min-width: 768px) {
		.WeightRow__text {
			column-count: var(--cols, 1);
			column-gap: 40px;
		}
	}
</style>
