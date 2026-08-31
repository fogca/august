<script lang="ts">
	// Glyph inspector: a fixed metrics/preview panel (left) beside an
	// independently-scrolling, category-grouped glyph grid (right). Pattern
	// referenced from Increments Type's /fonts/[slug] Glyphs page — click any
	// tile to inspect it; only the grid scrolls, the panel stays put.
	import { onMount, untrack } from 'svelte';
	import { onScroll } from '$lib/scroll';
	import { WEIGHTS } from '$lib/components/TypeTester/presets.js';
	import type { WeightDef } from '$lib/components/TypeTester/presets.js';
	import {
		STEINER_GLYPHS,
		GLYPH_CATEGORY_ORDER as NORMA_CATEGORY_ORDER,
		GLYPH_CATEGORY_LABELS as NORMA_CATEGORY_LABELS,
		type GlyphEntry,
		type GlyphCategory
	} from '$lib/data/normaGlyphs.js';

	interface Props {
		fontFamily: string;
		/** Display name for the panel header — falls back to fontFamily. */
		name?: string;
		title?: string;
		// Defaults to Norma's own full roster (523 glyphs) — pass a narrower
		// set for a typeface that doesn't ship that full a cmap yet (see
		// elioGlyphs.ts), so nothing here can render as a .notdef/tofu box.
		glyphs?: GlyphEntry[];
		categoryOrder?: GlyphCategory[];
		categoryLabels?: Record<GlyphCategory, string>;
		// Defaults to Norma's 20-stop axis. Pass a narrower list (even a
		// single entry) for a typeface with fewer real drawn weights.
		weights?: WeightDef[];
	}

	let {
		fontFamily,
		name,
		title = 'Glyph set',
		glyphs = STEINER_GLYPHS,
		categoryOrder = NORMA_CATEGORY_ORDER,
		categoryLabels = NORMA_CATEGORY_LABELS,
		weights = WEIGHTS
	}: Props = $props();

	// Font-wide vertical metrics (hhea/OS2 — one fixed set for the whole VF).
	// Per Norma's Glyphs master data: ascender 800, cap height 700,
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

	// Only the initial weights/glyphs prop values seed the defaults — same
	// intentional one-time-read pattern as WeightRow.svelte's initialSize.
	const DEFAULT_WEIGHT = untrack(
		() => weights.find((w) => w.label === 'Regular') ?? weights[Math.min(8, weights.length - 1)]
	);
	const DEFAULT_GLYPH = untrack(() => glyphs.find((g) => g.char === 'A') ?? glyphs[0]);

	let selectedWeight = $state(DEFAULT_WEIGHT);
	let selected = $state<GlyphEntry>(DEFAULT_GLYPH);

	const xHeight = $derived(xHeightFor(selectedWeight.axisValue));

	// The preview box is exactly one em tall (its height equals the glyph's
	// font-size), so a metric at `units` above the baseline sits at
	// (ASCENDER - units) / UPM down from the top. The glyph's own baseline lands
	// at ASCENDER / UPM because the box uses line-height 1 with typo metrics
	// that sum to the em — measured, not assumed.
	const metricLines = $derived([
		{ label: 'Ascender', value: ASCENDER, top: 0 },
		{ label: 'Cap height', value: CAP_HEIGHT, top: (ASCENDER - CAP_HEIGHT) / UPM },
		{ label: 'x-Height', value: xHeight, top: (ASCENDER - xHeight) / UPM },
		{ label: 'Baseline', value: 0, top: ASCENDER / UPM },
		{ label: 'Descender', value: DESCENDER, top: 1 }
	]);

	const groups = $derived(
		categoryOrder.map((cat) => ({
			cat,
			label: categoryLabels[cat],
			items: glyphs.filter((g) => g.category === cat)
		}))
	);

	// Scroll-driven A-Z. The section is taller than the viewport; the panel
	// sticks for that distance and the scroll progress across it picks one of
	// the 26 capitals. Clicking a tile still works — it just parks the scroll
	// driver until the reader scrolls again, so the two never fight.
	const AZ = $derived(
		'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
			.split('')
			.map((c) => glyphs.find((g) => g.char === c))
			.filter((g): g is GlyphEntry => !!g)
	);

	let sectionEl = $state<HTMLElement>();
	let scrollEl = $state<HTMLElement>();
	let pickedByClick = false;

	// Keep the highlighted tile in view while the scroll walks A-Z. Only nudges
	// the grid's own scroller, never the page.
	$effect(() => {
		const cp = selected.codepoint;
		if (!scrollEl) return;
		const cell = scrollEl.querySelector<HTMLElement>(`[data-cp="${cp}"]`);
		if (!cell) return;
		const top = cell.offsetTop - scrollEl.clientHeight / 2 + cell.offsetHeight / 2;
		scrollEl.scrollTo({ top, behavior: 'smooth' });
	});

	onMount(() => {
		const update = () => {
			if (!sectionEl || pickedByClick || AZ.length === 0) return;
			const rect = sectionEl.getBoundingClientRect();
			const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
			const range = rect.height - viewportHeight;
			if (range <= 0) return;
			const progress = Math.min(1, Math.max(0, -rect.top / range));
			const i = Math.min(AZ.length - 1, Math.floor(progress * AZ.length));
			if (AZ[i] && AZ[i].codepoint !== selected.codepoint) selected = AZ[i];
		};
		update();
		return onScroll(update);
	});

	function pick(g: GlyphEntry) {
		selected = g;
		// Hand control back to the scroll on the reader's next move.
		pickedByClick = true;
		const release = () => {
			pickedByClick = false;
			window.removeEventListener('scroll', release);
		};
		window.addEventListener('scroll', release, { passive: true, once: true });
	}

	function onWeightChange(e: Event) {
		const id = Number((e.currentTarget as HTMLSelectElement).value);
		const w = weights.find((w) => w.id === id);
		if (w) selectedWeight = w;
	}
</script>

<section class="GlyphSet" aria-label={title} bind:this={sectionEl}>
	<p class="GlyphSet__label">{title}</p>

	<div class="GlyphSet__pin">
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
						{#each weights as w (w.id)}
							<option value={w.id}>{w.label}</option>
						{/each}
					</select>
				</div>
			</div>
			<p class="GlyphSet__glyph-name">{selected.name}</p>

			<div class="GlyphSet__diagram" style="font-family: '{fontFamily}', sans-serif;">
				<span
					class="GlyphSet__preview-glyph"
					style="font-variation-settings: 'wght' {selectedWeight.axisValue};">{selected.char}</span>

				{#each metricLines as m (m.label)}
					<div
						class="GlyphSet__mline"
						class:is-edge={m.top === 1}
						style="top: {m.top * 100}%"
					>
						<span class="GlyphSet__mlabel">{m.label}</span>
						<span class="GlyphSet__mvalue">{m.value}</span>
					</div>
				{/each}
			</div>

		</aside>

		<div class="GlyphSet__grid-scroll" bind:this={scrollEl}>
			{#each groups as group (group.cat)}
				<div class="GlyphSet__group">
					<p class="GlyphSet__group-label">{group.label}</p>
					<div class="GlyphSet__grid" style="font-family: '{fontFamily}', sans-serif;">
						{#each group.items as g (g.codepoint)}
							<button
								type="button"
								class="GlyphSet__cell"
								class:is-active={selected.codepoint === g.codepoint}
								data-cp={g.codepoint}
								style="font-variation-settings: 'wght' {selectedWeight.axisValue};"
								onclick={() => pick(g)}
								aria-label={g.name}
								aria-pressed={selected.codepoint === g.codepoint}
							>{g.char}</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
	</div>
</section>

<style>
	.GlyphSet {
		padding: 40px var(--padding) 48px;
		border-top: 1px solid var(--color-line);
	}

	/* Mobile: no pinning — the section is its own height and scrolls normally. */
	.GlyphSet__pin {
		display: block;
	}

	.GlyphSet__label {
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
		font-size: var(--fs-h6);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--color-text-mute);
		margin: 0;
	}





	/* The big glyph preview — guides sit at cap-height / baseline, computed
	   from the font's own metrics (not from where the browser happens to lay
	   the text out), so they stay correct regardless of the glyph rendered. */


	/* The box is exactly one em tall, so a metric line placed at
	   (ascender - units) / upm from the top lands on the real metric. The glyph
	   is set at the same size with line-height 1, which puts its baseline at
	   ascender/upm — the two agree by construction, not by eye. */
	.GlyphSet__diagram {
		position: relative;
		height: 220px;
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

	.GlyphSet__mline {
		position: absolute;
		left: 0;
		right: 0;
		border-top: 1px solid var(--color-line);
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		font-family: 'Norma', sans-serif;
		font-size: var(--fs-h6);
		font-variation-settings: normal;
		letter-spacing: 0;
		line-height: 1.4;
		pointer-events: none;
	}

	/* Labels sit just under their own rule; the bottom line reads above its
	   rule instead so it stays inside the box. */
	.GlyphSet__mline span {
		padding-top: 2px;
	}

	.GlyphSet__mline.is-edge span {
		padding-top: 0;
		transform: translateY(-100%);
	}

	.GlyphSet__mlabel {
		color: var(--color-text-mute);
	}

	.GlyphSet__mvalue {
		color: var(--color-text);
	}

	@media (min-width: 768px) {
		.GlyphSet__diagram,
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
		font-family: 'Norma', sans-serif;
		font-size: var(--fs-h6);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--color-text-mute);
		margin: 0 0 12px;
	}

	.GlyphSet__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(26px, 1fr));
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
		/* Scroll distance for the A-Z run: the section is far taller than the
		   viewport and the panel sticks inside it, so scrolling through this
		   block steps the preview from A to Z. 26 letters at roughly a third of
		   a screen each. */
		.GlyphSet {
			padding-bottom: 0;
		}

		.GlyphSet__pin {
			height: 900vh;
		}

		.GlyphSet__panel {
			position: sticky;
			top: 72px;
			display: grid;
			grid-template-columns: 35fr 65fr;
			align-items: stretch;
			gap: 48px;
			height: calc(100vh - 120px);
			height: calc(100dvh - 120px);
			min-height: 560px;
		}

		.GlyphSet__meta {
			width: auto;
			min-width: 0;
			/* Was space-between, which pushed the header, the glyph name and the
			   diagram to opposite ends of a full-height column — the metric
			   labels ended up nowhere near the lines they name. */
			justify-content: flex-start;
			gap: 24px;
		}

		.GlyphSet__grid-scroll {
			min-width: 0;
			overflow-y: auto;
			padding-right: 8px;
		}

		.GlyphSet__grid {
			grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
		}
	}
</style>
