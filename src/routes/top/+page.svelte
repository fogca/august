<!-- /top — experimental typographic study, not linked from nav. Referenced
     from three calligram/shape-poetry spreads the user shared: a paragraph
     of running text set so its own edge traces a silhouette (a diamond, a
     portrait), rather than a plain rectangle of type.

     Technique (v2 — replaces an earlier clip/mask version the user
     correctly called out as "just a mask, not real characters"): every row
     is a real, independently-typeset line — a greedy character-by-character
     fit (word-break: break-all, no word-boundary logic, exactly as asked)
     against a target width sampled from a shape function at that row's
     vertical position. Nothing is hidden or overflowing; whatever text
     exists on a row is exactly what's visible, ending precisely where the
     shape's edge says it should. Measured with Canvas2D (this codebase's
     established way to measure a webfont — see OpenTypeReference.svelte's
     document.fonts.ready pattern — DOM getBoundingClientRect works too but
     forces a reflow per character; canvas doesn't).

     Because each shape's line breaks fall in completely different places,
     there's no continuous text to width-morph between shapes the way a
     mask could. So switching shapes fades the old rows out, relayouts, and
     reveals the new rows with a per-row stagger — the shape assembles
     itself out of characters rather than sliding from one outline to the
     next. -->
<script lang="ts">
	import { onMount } from 'svelte';

	type Shape = { name: string; fn: (t: number) => number };

	// fn(t): 0 (top) -> 1 (bottom), returns a 0..1 fraction of the stage's
	// width for that row. Only shapes whose horizontal extent is a single
	// contiguous span per scanline work with this one-line-per-row
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
	// metamorphosis" language (see typefaces.ts). Read as one continuous
	// character stream (spaces included) and cycled once exhausted — real
	// running prose, not per-line word lists.
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
		'stops being felt. ';

	const LINES = 52;
	const FONT_SIZE = 12;
	const FONT_FAMILY = "'Steiner', sans-serif";
	const CYCLE_MS = 4600;
	// Matches .Top__row's base (non-.is-visible) transition duration, plus a
	// small buffer — the fade-out is uniform/unstaggered (see the CSS
	// comment), so every row is genuinely done fading by this point.
	const FADE_MS = 220;

	let shapeIndex = $state(0);
	let charOffset = $state(0);
	let rows = $state<string[]>(Array(LINES).fill(''));
	let revealed = $state(false);
	let pausedUntil = 0;

	let stageEl: HTMLDivElement | undefined = $state();
	let measureCtx: CanvasRenderingContext2D | null = null;
	let laying = false;

	function ensureCtx() {
		if (measureCtx) return measureCtx;
		const canvas = document.createElement('canvas');
		measureCtx = canvas.getContext('2d');
		if (measureCtx) measureCtx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
		return measureCtx;
	}

	// Greedy character-by-character fit, one shape's worth of rows at once.
	// No word-boundary awareness at all (word-break: break-all, per the
	// request) — a line simply keeps consuming characters from the corpus
	// until the next one would push it past its target width, then the
	// next row picks up exactly where it left off. Leading spaces at a new
	// row are skipped so a line break never starts with a blank.
	function layout(shape: Shape, widthPx: number, startOffset: number): { rows: string[]; nextOffset: number } {
		const ctx = ensureCtx();
		const corpusLen = TEXT.length;
		let idx = startOffset;
		const out: string[] = [];

		for (let i = 0; i < LINES; i++) {
			const t = i / (LINES - 1);
			const targetW = shape.fn(t) * widthPx;

			if (!ctx || targetW < FONT_SIZE * 0.7) {
				out.push('');
				continue;
			}

			while (TEXT[idx % corpusLen] === ' ') idx++;

			let line = '';
			// Safety cap: a target width this generous shouldn't need more
			// characters than this to fill, even at the narrowest glyphs —
			// just a backstop against an infinite loop, never expected to bind.
			for (let guard = 0; guard < 400; guard++) {
				const candidate = line + TEXT[idx % corpusLen];
				if (ctx.measureText(candidate).width > targetW && line.length > 0) break;
				line = candidate;
				idx++;
				if (ctx.measureText(line).width >= targetW) break;
			}
			out.push(line);
		}

		return { rows: out, nextOffset: idx };
	}

	async function relayout() {
		if (laying || !stageEl) return;
		laying = true;
		try {
			await document.fonts.ready;
		} catch {
			/* ignore — measure with whatever's available rather than block forever */
		}
		const widthPx = stageEl.getBoundingClientRect().width;
		const shape = SHAPES[shapeIndex];
		const result = layout(shape, widthPx, charOffset);
		rows = result.rows;
		charOffset = result.nextOffset;
		laying = false;
	}

	async function goTo(index: number, manual = false) {
		const next = ((index % SHAPES.length) + SHAPES.length) % SHAPES.length;
		if (manual) pausedUntil = Date.now() + CYCLE_MS * 1.5;
		// Fade the current shape out, relayout while invisible, then reveal
		// the new one with a stagger — there's no shared text between two
		// different shapes' line breaks to width-morph between, so this
		// dissolve-then-assemble read is the honest animation for what's
		// actually changing underneath.
		revealed = false;
		await new Promise((r) => setTimeout(r, FADE_MS));
		shapeIndex = next;
		await relayout();
		// One frame so the DOM has the new (invisible) rows before the
		// reveal transition starts, or the stagger fires with stale content.
		requestAnimationFrame(() => {
			revealed = true;
		});
	}

	let resizeTimer: ReturnType<typeof setTimeout>;
	function onResize() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(relayout, 150);
	}

	onMount(() => {
		relayout().then(() => {
			revealed = true;
		});
		const cycleId = setInterval(() => {
			if (Date.now() < pausedUntil) return;
			goTo(shapeIndex + 1);
		}, CYCLE_MS);
		window.addEventListener('resize', onResize);
		return () => {
			clearInterval(cycleId);
			clearTimeout(resizeTimer);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<svelte:head>
	<title>Shape Study — Ôgast</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Top">
	<div class="Top__stage" bind:this={stageEl}>
		{#each rows as text, i (i)}
			<div class="Top__row" class:is-visible={revealed} style="--i: {i};">{text}</div>
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
		width: clamp(260px, 62vw, 620px);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Each row is exactly as wide as its own real, measured text — width:
	   fit-content + auto side margins is what centers it, not a fixed
	   window clipping something wider. word-break:break-all is a backstop
	   only (JS already stops each line at a whole character), matching the
	   brief that a mid-word break is fine. */
	/* Fade-out (this base state, .is-visible removed) is deliberately fast
	   and uniform — no per-row delay. Only the reveal-in below is staggered;
	   giving both directions the same delay meant late rows (delay up to
	   ~450ms) hadn't even started fading out by the time the fixed-length
	   fade-out window ended and the reveal fired, so they never visibly
	   animated at all. Which transition duration/delay applies is decided
	   by the class being transitioned TO — removing .is-visible reads this
	   rule's plain transition, adding it reads .is-visible's staggered one. */
	.Top__row {
		width: fit-content;
		margin-inline: auto;
		min-height: 1px;
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		line-height: 13px;
		letter-spacing: 0;
		white-space: nowrap;
		word-break: break-all;
		opacity: 0;
		transform: translateY(3px);
		transition:
			opacity 180ms ease,
			transform 180ms ease;
	}

	.Top__row.is-visible {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 420ms var(--ease-out, ease),
			transform 420ms var(--ease-out, ease);
		transition-delay: calc(min(var(--i), 34) * 13ms);
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
			width: clamp(220px, 82vw, 380px);
		}
	}
</style>
