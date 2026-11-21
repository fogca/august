<!-- Glyph Overview, after Kontrapunkt Type's: a style switch and a "Show
     metrics" toggle, then — left — one glyph set huge with the font's vertical
     metrics ruled across it, and — right — the encoded characters in boxed
     grids by group, any of which can be picked. Everything shown is the
     shipped font's own (see $lib/data/humoristOverview.ts).

     The big glyph's box is exactly the font's line box: line-height is
     (ascender - descender) / 1000, so the baseline sits `ascender` units below
     the top, and each metric line is placed from the top at
     (ascender - value) / 1000 em. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { TypefaceWeight } from '$lib/data/typefaces.js';
	import type { GlyphGroup, MetricLine } from '$lib/data/humoristOverview.js';
	import SectionHeading from './SectionHeading.svelte';

	interface Props {
		/** Public name, for the style names ("PF Humorist Regular"). */
		name: string;
		weights: TypefaceWeight[];
		groups: GlyphGroup[];
		/** Ascender first, descender last (hhea), the lines in between. */
		metrics: MetricLine[];
	}

	let { name, weights, groups, metrics }: Props = $props();

	/** How many groups show before "Show full character set". */
	const FIRST_GROUPS = 4;

	const defaultWeight = $derived(weights.find((w) => w.label === 'Regular') ?? weights[0]);
	let weightId = $state<number | null>(null);
	const weight = $derived(weights.find((w) => w.id === weightId) ?? defaultWeight);

	let picked = $state<string | null>(null);
	const selected = $derived(picked ?? groups[0]?.chars[0] ?? 'A');

	let showMetrics = $state(true);
	let showFull = $state(false);
	const visibleGroups = $derived(showFull ? groups : groups.slice(0, FIRST_GROUPS));

	const ascender = $derived(metrics[0]?.value ?? 1000);
	const descender = $derived(metrics[metrics.length - 1]?.value ?? -200);

	const hex = (c: string) =>
		'U+' + (c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0');

	// Where the baseline really is. The browser sets the text on a whole device
	// pixel, so the baseline the metrics predict (ascender / 1000 × size from
	// the top) can be a pixel off from where the letters stand: the line then
	// floats under them, or cuts into them (2026-11-21, at the user's request —
	// "baselineとグリフの間に隙間1pxくらいある"). A zero-size marker sitting on
	// the text's baseline is measured, and every line and the grid hang from
	// that.
	let squareEl = $state<HTMLElement>();
	let baseMarker = $state<HTMLElement>();
	let baseY = $state<number | null>(null);

	function measureBaseline() {
		if (!squareEl || !baseMarker) return;
		const dpr = window.devicePixelRatio || 1;
		// From the top of the square's padding box (inside its frame), which is
		// what the lines and the grid are positioned from.
		const y =
			baseMarker.getBoundingClientRect().top -
			(squareEl.getBoundingClientRect().top + squareEl.clientTop);
		baseY = Math.round(y * dpr) / dpr;
	}

	// A new glyph or weight changes the text; wait for it to be laid out.
	$effect(() => {
		void selected;
		void weight.axisValue;
		void showMetrics;
		requestAnimationFrame(measureBaseline);
	});

	onMount(() => {
		measureBaseline();
		const observer = squareEl ? new ResizeObserver(measureBaseline) : undefined;
		if (squareEl) observer?.observe(squareEl);
		document.fonts?.ready.then(measureBaseline);
		document.fonts?.addEventListener('loadingdone', measureBaseline);
		return () => {
			observer?.disconnect();
			document.fonts?.removeEventListener('loadingdone', measureBaseline);
		};
	});
</script>

<section class="GlyphOverview" aria-label="Glyph Overview">
	<SectionHeading title="Glyph Overview" />

	<div class="GlyphOverview__bar">
		<select
			class="GlyphOverview__select"
			aria-label="Style"
			value={weight.id}
			onchange={(e) => (weightId = Number(e.currentTarget.value))}
		>
			{#each weights as w (w.id)}
				<option value={w.id}>{name} {w.label}</option>
			{/each}
		</select>

		<button
			type="button"
			class="GlyphOverview__switch"
			class:is-on={showMetrics}
			role="switch"
			aria-checked={showMetrics}
			onclick={() => (showMetrics = !showMetrics)}
		>
			<span class="GlyphOverview__track" aria-hidden="true"
				><span class="GlyphOverview__knob"></span></span
			>
			Show metrics
		</button>
	</div>

	<div class="GlyphOverview__grid">
		<div class="GlyphOverview__stage">
			<!-- A square, framed (2026-11-21, at the user's request — "全体が正方形に
			     なるようにして欲しくて、枠線つけて"): the grid fills it, the metric
			     lines run across it, and the glyph's line box stands in the middle. -->
			<div
				class="GlyphOverview__square"
				bind:this={squareEl}
				style="--asc: {ascender}; --desc: {descender};{baseY === null ? '' : ` --base: ${baseY}px;`}"
			>
				{#if showMetrics}
					<!-- The square grid: a cell is 20 units (40 until 2026-11-21, then "もっと
					     細かくしたい"), which every metric line (1000, 720, 480, 0, -200)
					     lands on. Paler than the lines. -->
					<div class="GlyphOverview__paper" aria-hidden="true"></div>
					{#each metrics as m (m.label)}
						<div class="GlyphOverview__line" style="--v: {m.value}">
							<span class="GlyphOverview__lineText">
								<span>{m.label}</span><span>{m.value}</span>
							</span>
						</div>
					{/each}
				{/if}
				<div
					class="GlyphOverview__em"
					style="font-variation-settings: 'wght' {weight.axisValue}; font-weight: {weight.axisValue};"
				>
					<span class="GlyphOverview__glyph" aria-label="{selected} {hex(selected)}"
						><span class="GlyphOverview__text"
							>{selected}<i class="GlyphOverview__base" bind:this={baseMarker}></i></span
						></span
					>
				</div>
			</div>
		</div>

		<div class="GlyphOverview__sets">
			{#each visibleGroups as g (g.title)}
				<div class="GlyphOverview__group">
					<p class="GlyphOverview__groupTitle">{g.title}</p>
					<div
						class="GlyphOverview__cells"
						role="group"
						aria-label={g.title}
						style="font-variation-settings: 'wght' {weight.axisValue}; font-weight: {weight.axisValue};"
					>
						{#each [...g.chars] as c (c)}
							<button
								type="button"
								class="GlyphOverview__cell"
								class:is-selected={c === selected}
								aria-pressed={c === selected}
								aria-label="{c} {hex(c)}"
								title={hex(c)}
								onclick={() => (picked = c)}>{c}</button
							>
						{/each}
					</div>
				</div>
			{/each}

			{#if groups.length > FIRST_GROUPS}
				<button type="button" class="GlyphOverview__more" onclick={() => (showFull = !showFull)}>
					{showFull ? 'Show fewer characters' : 'Show full character set'}
				</button>
			{/if}
		</div>
	</div>
</section>

<style>
	.GlyphOverview {
		padding: 0 var(--padding);
		margin-top: 96px;
	}

	.GlyphOverview__bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 24px;
		padding-top: 16px;
	}

	/* The style switch: an outlined pill with its own chevron. */
	.GlyphOverview__select {
		appearance: none;
		-webkit-appearance: none;
		border: 1px solid var(--color-text);
		border-radius: 999px;
		background-color: transparent;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23000' stroke-width='1.2'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		color: var(--color-text);
		padding: 5px 32px 5px 14px;
		font-size: 14px;
		line-height: 1.3;
		cursor: pointer;
	}

	.GlyphOverview__switch {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-text);
		font-size: 14px;
		cursor: pointer;
	}

	.GlyphOverview__track {
		position: relative;
		width: 40px;
		height: 22px;
		border: 1px solid var(--color-text);
		border-radius: 999px;
	}

	.GlyphOverview__knob {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-text);
		transition: transform 0.2s ease;
	}

	.GlyphOverview__switch.is-on .GlyphOverview__knob {
		transform: translateX(18px);
	}

	.GlyphOverview__grid {
		display: grid;
		gap: 40px;
		margin-top: 32px;
	}

	@media (min-width: 768px) {
		.GlyphOverview__grid {
			grid-template-columns: 1fr 1fr;
			gap: 24px;
		}
	}

	/* ── The big glyph with its metrics ── */
	.GlyphOverview__stage {
		container-type: inline-size;
	}

	/* The square: as wide as the stage, as tall as it is wide, framed. Inside, the
	   grid and the metric lines are positioned from its top (--base is the
	   measured baseline, from there), and the em box — the font's line box
	   (ascender - descender) — is centred in it. cqw is the stage's width. */
	.GlyphOverview__square {
		--fs: min(62cqw, 520px);
		/* A whole number of 20-unit cells (50 to the em): whole pixels for the
		   grid and for every line. */
		--line: color-mix(in srgb, var(--color-text) 30%, #fff);
		--grid: color-mix(in srgb, var(--color-text) 6%, #fff);
		/* Until the baseline is measured: where the metrics put it in the
		   centred em box. */
		--em-h: calc(var(--fs) * (var(--asc) - var(--desc)) / 1000);
		--base: calc((100cqw - 2px - var(--em-h)) / 2 + var(--asc) / 1000 * var(--fs));
		position: relative;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		border: 1px solid var(--line);
	}

	@supports (width: round(nearest, 1px, 1px)) {
		.GlyphOverview__square {
			--fs: round(nearest, min(62cqw, 520px), 50px);
		}
	}

	.GlyphOverview__em {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: var(--em-h);
		margin-top: calc(var(--em-h) / -2);
	}

	/* The square grid, a cell 20 units wide and tall. Its rows hang from the
	   baseline and its columns from the middle of the box (where the glyph is
	   centred); the lines are the same 1px as the metric lines and paler. */
	.GlyphOverview__paper {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			linear-gradient(to right, var(--grid) 1px, transparent 1px),
			linear-gradient(to bottom, var(--grid) 1px, transparent 1px);
		background-size: calc(var(--fs) / 50) calc(var(--fs) / 50);
		background-position: round(down, calc(50cqw - 1px), 1px) var(--base);
	}

	.GlyphOverview__glyph {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		font-size: var(--fs);
		line-height: calc((var(--asc) - var(--desc)) / 1000);
		letter-spacing: 0;
		color: var(--color-text);
		user-select: none;
	}

	/* The marker the baseline is measured from: no size, on the text's baseline. */
	.GlyphOverview__text {
		display: inline;
	}

	.GlyphOverview__base {
		display: inline-block;
		width: 0;
		height: 0;
		vertical-align: baseline;
	}

	/* From the baseline up: the metric lines are solid (the grid under them is
	   paler, and must not add to them). */
	.GlyphOverview__line {
		position: absolute;
		left: 0;
		right: 0;
		height: 0;
		top: calc(var(--base) - var(--v) / 1000 * var(--fs));
		border-top: 1px solid var(--line);
		pointer-events: none;
	}

	.GlyphOverview__lineText {
		position: absolute;
		left: 8px;
		right: 8px;
		bottom: 2px;
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		line-height: 1.3;
		letter-spacing: 0;
		color: var(--color-text);
		font-variation-settings: 'wght' 350;
	}

	/* ── The characters ── */
	.GlyphOverview__sets {
		display: grid;
		gap: 20px;
		align-content: start;
	}

	.GlyphOverview__groupTitle {
		margin: 0 0 6px;
		font-size: 12px;
		line-height: 1.3;
		letter-spacing: 0;
		color: var(--color-text);
		opacity: 0.6;
	}

	.GlyphOverview__cells {
		display: grid;
		grid-template-columns: repeat(8, minmax(0, 1fr));
		border: var(--border-line);
		border-radius: 6px;
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.GlyphOverview__cells {
			grid-template-columns: repeat(14, minmax(0, 1fr));
		}
	}

	.GlyphOverview__cell {
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--color-text);
		font-size: clamp(16px, 1.5vw, 22px);
		line-height: 1;
		letter-spacing: 0;
		cursor: pointer;
	}

	.GlyphOverview__cell:hover {
		background: color-mix(in srgb, var(--color-text) 7%, transparent);
	}

	.GlyphOverview__cell.is-selected {
		background: color-mix(in srgb, var(--color-text) 14%, transparent);
	}

	.GlyphOverview__more {
		justify-self: start;
		padding: 5px 14px;
		border: 1px solid var(--color-text);
		border-radius: 999px;
		background: transparent;
		color: var(--color-text);
		font-size: 14px;
		line-height: 1.3;
		cursor: pointer;
	}
</style>
