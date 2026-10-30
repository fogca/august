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
	import type { TypefaceWeight } from '$lib/data/typefaces.js';
	import type { GlyphGroup, MetricLine } from '$lib/data/humoristOverview.js';
	import SectionHeading from './SectionHeading.svelte';

	interface Props {
		/** Public name, for the style names ("APGR Humorist Regular"). */
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
			<div
				class="GlyphOverview__em"
				style="--asc: {ascender}; --desc: {descender}; font-variation-settings: 'wght' {weight.axisValue}; font-weight: {weight.axisValue};"
			>
				{#if showMetrics}
					{#each metrics as m (m.label)}
						<div class="GlyphOverview__line" style="--v: {m.value}">
							<span class="GlyphOverview__lineText">
								<span>{m.label}</span><span>{m.value}</span>
							</span>
						</div>
					{/each}
				{/if}
				<span class="GlyphOverview__glyph" aria-label="{selected} {hex(selected)}">{selected}</span>
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

	/* The em box: as tall as the font's line box (ascender - descender), so the
	   metric lines can be placed from its top. cqw is the stage's width. The
	   top margin leaves room for the ascender line's label. */
	.GlyphOverview__em {
		--fs: min(62cqw, 520px);
		position: relative;
		margin-top: 22px;
		height: calc(var(--fs) * (var(--asc) - var(--desc)) / 1000);
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

	.GlyphOverview__line {
		position: absolute;
		left: 0;
		right: 0;
		height: 0;
		top: calc((var(--asc) - var(--v)) / 1000 * var(--fs));
		border-top: 1px solid color-mix(in srgb, var(--color-text) 30%, transparent);
		pointer-events: none;
	}

	.GlyphOverview__lineText {
		position: absolute;
		left: 0;
		right: 0;
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
		border: 1px solid var(--color-text);
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
