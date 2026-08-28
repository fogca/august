<script lang="ts">
	// Glyph inspector: a fixed metrics/preview panel (left) beside an
	// independently-scrolling, category-grouped glyph grid (right). Pattern
	// referenced from Increments Type's /fonts/[slug] Glyphs page — click any
	// tile to inspect it; only the grid scrolls, the panel stays put.
	import { WEIGHTS } from '$lib/components/TypeTester/presets.js';
	import {
		STEINER_GLYPHS,
		GLYPH_CATEGORY_ORDER,
		GLYPH_CATEGORY_LABELS,
		type GlyphEntry
	} from '$lib/data/steinerGlyphs.js';

	interface Props {
		fontFamily: string;
		/** Display name for the panel header — falls back to fontFamily. */
		name?: string;
		title?: string;
	}

	let { fontFamily, name, title = 'Glyph set' }: Props = $props();

	// Font-wide vertical metrics (hhea/OS2 — one fixed set for the whole VF).
	// Per Steiner's Glyphs master data: ascender 800, cap height 700,
	// descender -200 across all masters; x-height is the one value that
	// genuinely drifts by weight (510 at Hair/Book, 518 at Ultra) — interpolated
	// below rather than hardcoded, same as the font itself.
	const ASCENDER = 800;
	const CAP_HEIGHT = 700;
	const DESCENDER = -200;
	const UPM = ASCENDER - DESCENDER;
	const XHEIGHT_STOPS: [number, number][] = [
		[1, 510],
		[400, 510],
		[950, 518]
	];

	function xHeightFor(axisValue: number): number {
		for (let i = 0; i < XHEIGHT_STOPS.length - 1; i++) {
			const [w0, x0] = XHEIGHT_STOPS[i];
			const [w1, x1] = XHEIGHT_STOPS[i + 1];
			if (axisValue >= w0 && axisValue <= w1) {
				const t = (axisValue - w0) / (w1 - w0);
				return Math.round(x0 + t * (x1 - x0));
			}
		}
		return XHEIGHT_STOPS[XHEIGHT_STOPS.length - 1][1];
	}

	const DEFAULT_WEIGHT = WEIGHTS.find((w) => w.label === 'Regular') ?? WEIGHTS[8];
	const DEFAULT_GLYPH = STEINER_GLYPHS.find((g) => g.char === 'A') ?? STEINER_GLYPHS[0];

	let selectedWeight = $state(DEFAULT_WEIGHT);
	let selected = $state<GlyphEntry>(DEFAULT_GLYPH);

	const xHeight = $derived(xHeightFor(selectedWeight.axisValue));
	const capLineTop = (ASCENDER - CAP_HEIGHT) / UPM; // fraction from top of the preview box
	const baselineTop = ASCENDER / UPM;

	const groups = $derived(
		GLYPH_CATEGORY_ORDER.map((cat) => ({
			cat,
			label: GLYPH_CATEGORY_LABELS[cat],
			items: STEINER_GLYPHS.filter((g) => g.category === cat)
		}))
	);

	function onWeightChange(e: Event) {
		const id = Number((e.currentTarget as HTMLSelectElement).value);
		const w = WEIGHTS.find((w) => w.id === id);
		if (w) selectedWeight = w;
	}
</script>

<section class="GlyphSet" aria-label={title}>
	<p class="GlyphSet__label">{title}</p>

	<div class="GlyphSet__panel">
		<aside class="GlyphSet__meta" aria-label="Selected glyph">
			<div class="GlyphSet__meta-head">
				<span class="GlyphSet__type-name">{name ?? fontFamily}</span>
				<div class="GlyphSet__select-wrap">
					<select
						class="GlyphSet__weight-select"
						value={selectedWeight.id}
						onchange={onWeightChange}
						aria-label="Weight"
					>
						{#each WEIGHTS as w (w.id)}
							<option value={w.id}>{w.label}</option>
						{/each}
					</select>
				</div>
			</div>
			<p class="GlyphSet__glyph-name">{selected.name}</p>

			<dl class="GlyphSet__metrics">
				<div class="GlyphSet__metric">
					<dt>Ascender</dt>
					<dd>{ASCENDER}</dd>
				</div>
				<div class="GlyphSet__metric">
					<dt>Cap height</dt>
					<dd>{CAP_HEIGHT}</dd>
				</div>
				<div class="GlyphSet__metric">
					<dt>x-Height</dt>
					<dd>{xHeight}</dd>
				</div>
			</dl>

			<div class="GlyphSet__preview" style="font-family: '{fontFamily}', sans-serif;">
				<span class="GlyphSet__guide" style="top: {capLineTop * 100}%"></span>
				<span class="GlyphSet__guide" style="top: {baselineTop * 100}%"></span>
				<span
					class="GlyphSet__preview-glyph"
					style="font-variation-settings: 'wght' {selectedWeight.axisValue};"
				>{selected.char}</span>
			</div>

			<dl class="GlyphSet__metrics">
				<div class="GlyphSet__metric">
					<dt>Baseline</dt>
					<dd>0</dd>
				</div>
				<div class="GlyphSet__metric">
					<dt>Descender</dt>
					<dd>{DESCENDER}</dd>
				</div>
			</dl>
		</aside>

		<div class="GlyphSet__grid-scroll">
			{#each groups as group (group.cat)}
				<div class="GlyphSet__group">
					<p class="GlyphSet__group-label">{group.label}</p>
					<div class="GlyphSet__grid" style="font-family: '{fontFamily}', sans-serif;">
						{#each group.items as g (g.codepoint)}
							<button
								type="button"
								class="GlyphSet__cell"
								class:is-active={selected.codepoint === g.codepoint}
								style="font-variation-settings: 'wght' {selectedWeight.axisValue};"
								onclick={() => (selected = g)}
								aria-label={g.name}
								aria-pressed={selected.codepoint === g.codepoint}
							>{g.char}</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
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
		margin: 0 0 20px;
	}

	/* Mobile: stacked, page scrolls normally — a viewport-height split pane
	   doesn't work well at phone widths. */
	.GlyphSet__panel {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.GlyphSet__meta {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.GlyphSet__meta-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--color-line);
	}

	.GlyphSet__type-name {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h4);
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		color: var(--color-text);
	}

	.GlyphSet__select-wrap {
		position: relative;
	}

	.GlyphSet__weight-select {
		appearance: none;
		-webkit-appearance: none;
		background: transparent;
		border: none;
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h6);
		color: var(--color-text-mute);
		letter-spacing: 0;
		padding-right: 14px;
		cursor: pointer;
		/* minimal chevron, drawn in currentColor so it follows the muted tone */
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'%3E%3Cpath d='M0 0 4 5 8 0' fill='none' stroke='%23999' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right center;
		background-size: 8px 5px;
	}

	.GlyphSet__glyph-name {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h6);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--color-text-mute);
		margin: 0;
	}

	.GlyphSet__metrics {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
	}

	.GlyphSet__metric {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h6);
		letter-spacing: 0;
		border-bottom: 1px solid var(--color-line);
		padding-bottom: 6px;
	}

	.GlyphSet__metric dt {
		color: var(--color-text-mute);
	}

	.GlyphSet__metric dd {
		margin: 0;
		color: var(--color-text);
		font-variation-settings: normal;
	}

	/* The big glyph preview — guides sit at cap-height / baseline, computed
	   from the font's own metrics (not from where the browser happens to lay
	   the text out), so they stay correct regardless of the glyph rendered. */
	.GlyphSet__preview {
		position: relative;
		height: 220px;
		overflow: hidden;
	}

	.GlyphSet__guide {
		position: absolute;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-line);
	}

	.GlyphSet__preview-glyph {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		font-size: 220px;
		line-height: 1;
		text-align: center;
		color: var(--color-text);
	}

	@media (min-width: 768px) {
		.GlyphSet__preview,
		.GlyphSet__preview-glyph {
			height: 320px;
			font-size: 320px;
		}
	}

	.GlyphSet__group {
		padding-block: 20px;
		border-top: 1px solid var(--color-line);
	}

	.GlyphSet__group:first-child {
		padding-top: 0;
		border-top: none;
	}

	.GlyphSet__group-label {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h6);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--color-text-mute);
		margin: 0 0 12px;
	}

	.GlyphSet__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
	}

	.GlyphSet__cell {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 52px;
		font-size: 20px;
		line-height: 1;
		color: var(--color-text);
		background: transparent;
		border: 1px solid transparent;
		cursor: pointer;
		padding: 0;
		transition: background-color 0.12s, color 0.12s;
	}

	.GlyphSet__cell:hover {
		background: var(--color-bg-gray);
	}

	.GlyphSet__cell.is-active {
		background: var(--color-text);
		color: var(--color-bg);
	}

	/* Desktop: fixed-width metrics panel stays put; only the grid scrolls,
	   inside a panel height the panel itself defines. */
	@media (min-width: 768px) {
		.GlyphSet__panel {
			flex-direction: row;
			align-items: stretch;
			gap: 48px;
			height: min(76vh, 720px);
			min-height: 560px;
		}

		.GlyphSet__meta {
			flex: none;
			width: 240px;
			justify-content: space-between;
		}

		.GlyphSet__grid-scroll {
			flex: 1;
			min-width: 0;
			overflow-y: auto;
			padding-right: 8px;
		}

		.GlyphSet__grid {
			grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
		}
	}
</style>
