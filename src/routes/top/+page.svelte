<!-- /top — experimental typographic study, not linked from nav. Referenced
     from three calligram/shape-poetry spreads the user shared: a paragraph
     of running text set so its own ragged, centered edge traces a
     silhouette (a diamond, a portrait) rather than a plain rectangle.

     Technique: a fixed stack of line rows, each row a fixed-height window
     (overflow:hidden) whose WIDTH is driven by a shape function sampled at
     that row's vertical position (0 at top, 1 at bottom). Each row holds a
     long nowrap run of text centered on the row's own midpoint via
     left:50%/translateX(-50%), so the window clips symmetrically left and
     right around that center — the row's visible slice is always exactly
     as wide as the shape function says, regardless of word boundaries.
     Widths are plain CSS custom-property calc()s off one responsive
     --top-max-width, so the whole thing reshapes with the viewport without
     any JS resize handling. Switching the active shape just changes every
     row's target width at once; the existing `width` transition on each
     row (staggered a few ms per row via --i) does the rest — CSS morphs
     the whole silhouette from one shape into the next on its own. -->
<script lang="ts">
	import { onMount } from 'svelte';

	type Shape = { name: string; fn: (t: number) => number };

	// fn(t): 0 (top) -> 1 (bottom), returns a 0..1 fraction of --top-max-width
	// for that row. Only shapes whose horizontal extent is a single
	// contiguous span per scanline work with this one-window-per-row
	// technique (no notches/holes) — these five all qualify.
	const SHAPES: Shape[] = [
		{ name: 'Circle', fn: (t) => Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)) },
		{ name: 'Square', fn: () => 1 },
		{ name: 'Triangle', fn: (t) => 1 - t },
		{ name: 'Diamond', fn: (t) => (t < 0.5 ? 2 * t : 2 * (1 - t)) },
		{ name: 'Cross', fn: (t) => (t > 0.38 && t < 0.62 ? 1 : 0.16) }
	];

	// Original copy, not lorem ipsum — a short meditation on the shapes
	// under letterforms, tying back to Asger's own Goethean "form in
	// metamorphosis" language (see typefaces.ts). Cycled continuously as a
	// single running stream, same as the reference spreads' unbroken prose.
	const TEXT =
		'Every letter begins as a shape before it is a sound. The circle gives the ' +
		'bowl of the o, the eye of the e, the shoulder of the n. The square gives ' +
		'the counter its floor, the serif its foot, the stem its discipline. The ' +
		'triangle is the sharpest instinct in the alphabet — the apex of the A, ' +
		'the wedge of the V, the point where two strokes agree to meet. Turn a ' +
		'letterform far enough and the shape underneath it stops hiding. Steiner ' +
		'was drawn this way: not stroke by stroke but form by form, each glyph a ' +
		'compromise between the round and the straight, the closed and the open, ' +
		'held together by whatever force keeps geometry from becoming decoration. ' +
		'A typeface is a family of shapes that have agreed to behave like ' +
		'language. Before Helvetica there was the circle. Before Garamond there ' +
		'was the pen, and before the pen there was the hand, and before the hand ' +
		'there was the wish to make a mark that would outlast the making of it. ' +
		'This is the oldest problem in design: how much shape can a letter carry ' +
		'before it stops being legible, and how little can it carry before it ' +
		'stops being felt.';
	const WORDS = TEXT.split(/\s+/);

	const LINES = 52;
	// Words per row: long enough to overflow even the widest row at any
	// viewport size, so overflow:hidden always has something to clip on
	// both sides rather than running out mid-row.
	const WORDS_PER_LINE = 16;
	const CYCLE_MS = 4200;

	let shapeIndex = $state(0);
	let wordOffset = $state(0);
	// Manual pick pauses autoplay briefly rather than fighting the user's
	// own click with the next scheduled tick.
	let pausedUntil = 0;

	const currentShape = $derived(SHAPES[shapeIndex]);

	const rows = $derived(
		Array.from({ length: LINES }, (_, i) => {
			const t = i / (LINES - 1);
			const frac = currentShape.fn(t);
			let idx = wordOffset + i * 7; // spread each row's excerpt apart, not a single repeating line
			const words: string[] = [];
			for (let k = 0; k < WORDS_PER_LINE; k++) {
				words.push(WORDS[idx % WORDS.length]);
				idx++;
			}
			return { i, frac, text: words.join(' ') };
		})
	);

	function goTo(index: number, manual = false) {
		shapeIndex = ((index % SHAPES.length) + SHAPES.length) % SHAPES.length;
		wordOffset = (wordOffset + 23) % WORDS.length;
		if (manual) pausedUntil = Date.now() + CYCLE_MS * 1.5;
	}

	onMount(() => {
		const id = setInterval(() => {
			if (Date.now() < pausedUntil) return;
			goTo(shapeIndex + 1);
		}, CYCLE_MS);
		return () => clearInterval(id);
	});
</script>

<svelte:head>
	<title>Shape Study — August Type Foundry</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Top">
	<div class="Top__stage" style="--top-lines: {LINES};">
		{#each rows as row (row.i)}
			<div class="Top__row" style="--i: {row.i}; width: calc(var(--top-max-width) * {row.frac});">
				<span class="Top__row-text">{row.text}</span>
			</div>
		{/each}
	</div>

	<nav class="Top__picker" aria-label="Shape">
		{#each SHAPES as shape, i (shape.name)}
			<button
				type="button"
				class="Top__picker-item"
				class:is-active={i === shapeIndex}
				onclick={() => goTo(i, true)}
			>
				{shape.name}
			</button>
		{/each}
	</nav>
</main>

<style>
	.Top {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 40px;
		background: #fff;
		color: #000;
		padding-block: 96px;
		overflow: hidden;
	}

	.Top__stage {
		--top-max-width: clamp(260px, 62vw, 620px);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}

	.Top__row {
		position: relative;
		height: 13px;
		overflow: hidden;
		transition: width var(--duration-slow, 800ms) var(--ease-in-out, ease);
		/* Staggered per row so the silhouette morphs as a wave rather than
		   every row snapping in lockstep — capped so the last row isn't
		   waiting a full second behind the first. */
		transition-delay: calc(min(var(--i), 30) * 6ms);
	}

	.Top__row-text {
		position: absolute;
		left: 50%;
		top: 0;
		transform: translateX(-50%);
		white-space: nowrap;
		font-family: 'Steiner', sans-serif;
		font-variation-settings: 'wght' 380;
		font-size: 12px;
		line-height: 13px;
		letter-spacing: 0;
	}

	.Top__picker {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
	}

	.Top__picker-item {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--color-text-mute);
		background: transparent;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		padding: 6px 16px;
		cursor: pointer;
		transition:
			color 150ms ease,
			border-color 150ms ease,
			background-color 150ms ease;
	}

	.Top__picker-item.is-active {
		color: var(--color-bg);
		background: var(--color-text);
		border-color: var(--color-text);
	}

	@media (max-width: 480px) {
		.Top__stage {
			--top-max-width: clamp(220px, 82vw, 380px);
		}
	}
</style>
