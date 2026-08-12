<script lang="ts">
	import { onMount } from 'svelte';
	import { coverReveal } from '$lib/actions/coverReveal';
	import { onScroll } from '$lib/scroll';
	import { WEIGHTS } from '$lib/components/TypeTester/presets';

	// Top page v2 — red / black / white, type-first.
	// Scheme:
	//   KV (white, AUGUST logotype) → normal scroll
	//   Sweep (black, pinned): scroll scrubs Steiner's wght axis 1 → 950
	//   Waterfall (white) → Tester (gray) → Buy (red) : normal scroll
	//   Bespoke (black) / Office (white) : v1 cover reveals (unchanged)

	// numeric weight names per the canonical scheme (presets.ts):
	// name = wght / 10, except name 1 = wght 1 (Hair). 40 = Book, 95 = Ultra.
	const axisOf = (id: number) => (id === 1 ? 1 : id * 10);
	const WATERFALL: { id: number; word: string }[] = [
		{ id: 1, word: 'Formkräfte' },
		{ id: 5, word: 'Metamorphose' },
		{ id: 10, word: 'Goetheanum' },
		{ id: 20, word: 'Eurythmie' },
		{ id: 40, word: 'Anthroposophie' },
		{ id: 60, word: 'Menschenkunde' },
		{ id: 80, word: 'Dreigliederung' },
		{ id: 95, word: 'Willenskräfte' }
	];

	let sweepWrapEl: HTMLElement;
	let sweepWght = $state(1);
	let testerWght = $state(400);

	// snap a live axis value to the nearest of the 20 real weights — the readout
	// only ever shows names that exist in the family
	const nearestWeight = (w: number) =>
		WEIGHTS.reduce((a, b) => (Math.abs(b.axisValue - w) < Math.abs(a.axisValue - w) ? b : a));
	const nameOf = (w: number) => nearestWeight(w).name.padStart(2, '0');
	const masterOf = (w: number) => {
		const id = nearestWeight(w).id;
		return id === 1 ? 'Hair' : id === 40 ? 'Book' : id === 95 ? 'Ultra' : '';
	};

	// plain-text paste only — keep the specimen in Steiner, keep markup out
	function plainPaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/plain') ?? '';
		document.execCommand('insertText', false, text);
	}

	// The sweep is a CSS-sticky scrub (no ScrollTrigger pin): the wrapper is
	// 280vh tall, the stage sticks, and native scroll position drives the wght
	// axis. Keeping it spacer-free means the coverReveal pins further down the
	// page never have to re-measure around an injected pin-spacer.
	onMount(() => {
		const update = () => {
			if (!sweepWrapEl) return;
			const vh = window.visualViewport?.height ?? window.innerHeight;
			const total = sweepWrapEl.offsetHeight - vh;
			if (total <= 0) return;
			const p = Math.min(1, Math.max(0, -sweepWrapEl.getBoundingClientRect().top / total));
			sweepWght = Math.round(1 + p * 949);
		};
		const off = onScroll(update);
		window.addEventListener('resize', update);
		update();
		return () => {
			off();
			window.removeEventListener('resize', update);
		};
	});
</script>

<svelte:head>
	<title>August Type Foundry — Steiner</title>
	<meta
		name="description"
		content="August Type Foundry — an independent type foundry from Tokyo. Steiner, a 20-weight neo-humanist variable typeface."
	/>
</svelte:head>

<main class="Home">
	<!-- KV (white) — the AUGUST logotype -->
	<section class="Kv">
		<h1 class="Kv__mark">AUGUST</h1>
		<a class="Kv__news" href="/fonts/steiner">New — Steiner, 20 weights · Debut 26.07.01&nbsp;→</a>
		<div class="Kv__bottom">
			<p class="Kv__statement">
				August Type Foundry is an independent type foundry from Tokyo. We draw humanist
				typefaces that treat the letter as the medium meaning passes through — retail
				families and bespoke type for those who value the power of design.
			</p>
			<div class="Kv__foot">
				<p class="Kv__label">Independent Type Foundry</p>
				<div class="Kv__meta">
					<span>Tokyo, Japan</span>
					<span>Est. 2026</span>
					<span class="Kv__domain">august.tf</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Sweep (black, sticky scrub) — the wght axis, demonstrated -->
	<section class="SweepWrap" bind:this={sweepWrapEl}>
		<div class="Sweep">
		<p class="Sweep__eyebrow">Steiner — Neo Humanist Sans, vol.01</p>
		<p class="Sweep__word" style="font-variation-settings: 'wght' {sweepWght};">Steiner</p>
		<div class="Sweep__readout">
			<span class="Sweep__count">20 weights, one axis</span>
			<span class="Sweep__wght"
				>{nameOf(sweepWght)}<em>
					· wght {String(sweepWght).padStart(3, '0')}{masterOf(sweepWght)
						? ' — ' + masterOf(sweepWght)
						: ''}</em
				></span
			>
			<a class="Sweep__link" href="/fonts/steiner">Discover Steiner →</a>
		</div>
		</div>
	</section>

	<!-- Waterfall (white) — the range, set in real weights -->
	<section class="Fall">
		<p class="Fall__label">The range</p>
		<ul class="Fall__rows">
			{#each WATERFALL as row (row.id)}
				<li class="Fall__row">
					<span class="Fall__no">{String(row.id).padStart(2, '0')}</span>
					<a
						class="Fall__word"
						href="/fonts/steiner"
						style="font-variation-settings: 'wght' {axisOf(row.id)};">{row.word}</a
					>
					<span class="Fall__wght">wght {String(axisOf(row.id)).padStart(3, '0')}</span>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Tester (gray) — try it, right here -->
	<section class="Try">
		<p class="Try__label">Type your own</p>
		<p
			class="Try__stage"
			contenteditable="true"
			spellcheck="false"
			role="textbox"
			tabindex="0"
			aria-multiline="false"
			aria-label="Type-tester preview — editable"
			onpaste={plainPaste}
			ondrop={(e) => e.preventDefault()}
			style="font-variation-settings: 'wght' {testerWght};"
		>
			The formative forces of the word, made visible.
		</p>
		<div class="Try__controls">
			<span class="Try__wght">{nameOf(testerWght)} / wght {String(testerWght).padStart(3, '0')}</span>
			<input
				class="Try__range"
				type="range"
				min="1"
				max="950"
				step="1"
				bind:value={testerWght}
				aria-label="Weight"
			/>
			<a class="Try__link" href="/fonts/steiner">Open the full tester →</a>
		</div>
	</section>

	<!-- Buy (red) — the license, plainly -->
	<section class="Buy">
		<div class="Buy__inner">
			<p class="Buy__eyebrow">License</p>
			<h2 class="Buy__heading">Make it yours.</h2>
			<p class="Buy__body">
				Steiner Complete — 20 weights, desktop and web. From €560, perpetual license. Pay
				once, use forever.
			</p>
			<a class="Buy__cta" href="/buy">Buy Steiner</a>
		</div>
	</section>

	<!-- Custom type service (black) — v1 cover reveal -->
	<section class="Home__custom" use:coverReveal>
		<div class="Custom__inner">
			<p class="Custom__eyebrow">Bespoke</p>
			<h2 class="Custom__heading">Custom type for corporate identity</h2>
			<p class="Custom__body">
				Beyond our retail library, August designs bespoke typefaces for brands and
				institutions — a proprietary voice, drawn from the first sketch to a fully realised
				family. A custom typeface is the most enduring asset a brand can own: it travels
				across every screen, surface, and language while remaining unmistakably yours.
			</p>
			<a class="Custom__cta" href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">
				Enquire →
			</a>
		</div>
	</section>

	<!-- Design office band — v1 cover reveal -->
	<section class="Office" use:coverReveal>
		<div class="Office__inner">
			<p class="Office__label">Design Office</p>
			<p class="Office__text">
				August Type Foundry is the type design practice of an independent design office in
				Tokyo.
			</p>
			<a class="Office__link" href="/about">About the foundry →</a>
		</div>
	</section>
</main>

<style>
	/* Page-scoped brand red. base.css --color-accent (#b33030) stays untouched;
	   the top page uses the sharper signal red below. */
	.Home {
		--red: #e0231c;
	}

	/* --- KV (white) — AUGUST logotype --- */
	.Kv {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
		background: #ffffff;
		color: #000000;
		padding-top: var(--gutter);
		padding-bottom: var(--gutter);
	}

	.Kv__mark {
		font-family: 'Mokuseki Sans 01', 'Mokuseki Sans', 'Steiner', sans-serif;
		font-size: clamp(64px, 22.5vw, 360px);
		font-weight: 400;
		line-height: 0.94;
		letter-spacing: -0.01em;
		white-space: nowrap;
		margin: 0 0 18px;
	}

	.Kv__news {
		align-self: flex-start;
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-weight: var(--fw-ui);
		color: var(--red);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s ease;
	}

	.Kv__news:hover {
		border-bottom-color: var(--red);
	}

	.Kv__bottom {
		margin-top: auto;
	}

	.Kv__statement {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.6;
		letter-spacing: 0.01em;
		max-width: 340px;
		margin: 0;
	}

	.Kv__foot {
		margin-top: 48px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.Kv__label {
		font-family: 'Steiner', sans-serif;
		font-size: 9px;
		line-height: 1.5;
		opacity: 0.9;
		margin: 0;
	}

	.Kv__meta {
		display: flex;
		gap: 14px;
		align-items: baseline;
		font-family: 'Steiner', sans-serif;
		font-size: 10px;
		line-height: 1.4;
	}

	.Kv__domain {
		margin-left: auto;
	}

	/* --- Sweep (black, pinned) --- */
	.SweepWrap {
		height: 280vh;
		background: #000000;
		/* the sticky stage supplies the visual frame; the wrapper only sets the runway */
		padding-left: 0;
		padding-right: 0;
	}

	.Sweep {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background: #000000;
		color: #ffffff;
		/* clear the fixed Header, which stays visible while the stage is stuck */
		padding-top: calc(var(--gutter) + 64px + env(safe-area-inset-top, 0px));
		padding-bottom: var(--gutter);
		padding-left: var(--padding);
		padding-right: var(--padding);
	}

	.Sweep :global(*) {
		color: #ffffff;
	}

	.Sweep__eyebrow {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0;
	}

	.Sweep__word {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(80px, 16.5vw, 300px);
		line-height: 1;
		text-align: center;
		margin: 0;
		font-variation-settings: 'wght' 400;
	}

	.Sweep__readout {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 20px;
		font-family: 'Steiner', sans-serif;
	}

	.Sweep__count {
		font-size: 11px;
		opacity: 0.6;
	}

	.Sweep__wght {
		font-size: clamp(20px, 3vw, 32px);
		font-variation-settings: 'wght' 450;
		font-variant-numeric: tabular-nums;
		color: var(--red) !important;
	}

	.Sweep__wght em {
		font-style: normal;
		font-size: 0.6em;
	}

	.Sweep__link {
		font-size: 13px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		opacity: 0.8;
		transition: opacity 0.2s ease;
	}

	.Sweep__link:hover {
		opacity: 1;
	}

	/* --- Waterfall (white) --- */
	.Fall {
		background: #ffffff;
		color: #000000;
		padding-top: clamp(70px, 10vh, 130px);
		padding-bottom: clamp(70px, 10vh, 130px);
	}

	.Fall__label {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.55; /* matches --color-text-mute; keeps 11px text at AA contrast */
		margin: 0 0 26px;
	}

	.Fall__rows {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--color-line);
	}

	.Fall__row {
		display: flex;
		align-items: baseline;
		gap: clamp(14px, 3vw, 40px);
		padding: clamp(10px, 1.6vh, 18px) 0;
		border-bottom: 1px solid var(--color-line);
	}

	.Fall__no {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		width: 26px;
		flex-shrink: 0;
	}

	.Fall__word {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(30px, 4.6vw, 64px);
		line-height: 1.15;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-decoration: none;
		flex: 1;
		min-width: 0;
		transition: color 0.2s ease;
	}

	.Fall__word:hover {
		color: var(--red);
	}

	.Fall__wght {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		opacity: 0.55;
		flex-shrink: 0;
	}

	/* --- Tester (gray) --- */
	.Try {
		background: var(--color-bg-gray);
		color: #000000;
		padding-top: clamp(70px, 10vh, 130px);
		padding-bottom: clamp(70px, 10vh, 130px);
	}

	.Try__label {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.55;
		margin: 0 0 26px;
	}

	.Try__stage {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(34px, 5.4vw, 84px);
		line-height: 1.12;
		margin: 0;
		outline: none;
		min-height: 1.2em;
		caret-color: var(--red);
	}

	.Try__controls {
		display: flex;
		align-items: center;
		gap: clamp(16px, 3vw, 36px);
		margin-top: clamp(28px, 4.5vh, 48px);
		font-family: 'Steiner', sans-serif;
	}

	.Try__wght {
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		min-width: 120px;
	}

	.Try__range {
		flex: 1;
		max-width: 420px;
		appearance: none;
		-webkit-appearance: none;
		height: 1px;
		background: #000000;
		outline: none;
	}

	.Try__range::-webkit-slider-thumb {
		appearance: none;
		-webkit-appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--red);
		cursor: ew-resize;
	}

	.Try__range::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border: 0;
		border-radius: 50%;
		background: var(--red);
		cursor: ew-resize;
	}

	.Try__link {
		font-size: 13px;
		font-weight: var(--fw-ui);
		color: #000000;
		text-decoration: none;
		opacity: 0.7;
		transition: opacity 0.2s ease;
		margin-left: auto;
	}

	.Try__link:hover {
		opacity: 1;
	}

	/* --- Buy (red) --- */
	.Buy {
		background: var(--red);
		color: #ffffff;
		min-height: 70vh;
		display: flex;
		align-items: center;
		padding-top: clamp(70px, 10vh, 130px);
		padding-bottom: clamp(70px, 10vh, 130px);
	}

	.Buy :global(*) {
		color: #ffffff;
	}

	.Buy__inner {
		max-width: 640px;
	}

	.Buy__eyebrow {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.9; /* white on the red needs near-full opacity for AA */
		margin: 0 0 20px;
	}

	.Buy__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(40px, 7vw, 88px);
		line-height: 1.02;
		margin: 0 0 28px;
	}

	.Buy__body {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		margin: 0 0 36px;
	}

	.Buy__cta {
		display: inline-block;
		font-family: 'Steiner', sans-serif;
		font-size: 15px;
		font-weight: var(--fw-ui);
		background: #000000;
		padding: 16px 34px;
		text-decoration: none;
		transition: background 0.2s ease;
	}

	.Buy__cta:hover {
		background: #1c1c1c;
	}

	@media (min-width: 768px) {
		.Buy__body {
			font-size: 16px;
		}
	}

	/* --- Custom type service (black) — unchanged from v1 --- */
	.Home__custom {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		background: #000000;
		color: #ffffff;
		padding-inline: var(--padding);
		padding-block: 120px;
	}

	.Home__custom :global(*) {
		color: #ffffff;
	}

	.Custom__inner {
		max-width: 640px;
	}

	.Custom__eyebrow {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0 0 20px;
	}

	.Custom__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(28px, 5vw, 44px);
		line-height: 1.15;
		margin: 0 0 28px;
	}

	.Custom__body {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		opacity: 0.85;
		margin: 0 0 32px;
	}

	@media (min-width: 768px) {
		.Custom__body {
			font-size: 16px;
		}
	}

	.Custom__cta {
		display: inline-block;
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.4);
		padding-bottom: 4px;
		transition: border-color 0.2s ease;
	}

	.Custom__cta:hover {
		border-bottom-color: #ffffff;
	}

	/* --- Design office band — unchanged from v1 --- */
	.Office {
		min-height: 300px;
		background: #ffffff;
		color: #000000;
		display: flex;
		align-items: center;
		padding-top: 48px;
		padding-bottom: 48px;
	}

	.Office__inner {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 540px;
	}

	.Office__label {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.5;
		margin: 0;
	}

	.Office__text {
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-variation-settings: 'wght' 360;
		line-height: 1.5;
		margin: 0;
	}

	.Office__link {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.Office__link:hover {
		opacity: 1;
	}
</style>
