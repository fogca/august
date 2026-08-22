<script lang="ts">
	import { coverReveal } from '$lib/actions/coverReveal';
	import Arrow from '$lib/components/Arrow.svelte';

	// Hero specimen wave. A leads; "a" trails it by 0.3s of the 9s cycle, so the
	// weight travels across the pair as a tight chase (per STN-M09_aaaa-wave).
	// The delay is negative — lag 0.3s == 8.7s ahead — so the loop is already in
	// phase at first paint instead of sitting still for a beat.
	const AA: { glyph: string; delay: string }[] = [
		{ glyph: 'A', delay: '0s' },
		{ glyph: 'a', delay: '-8.7s' }
	];

	// Top page v2 — red / black / white, type-first.
	// Scheme:
	//   Hero (white, Figma 313:176) — Steiner "Aa" specimen + Discover — normal scroll
	//   Buy (red) / Custom (black) / Office (white) : v1 cover reveals (unchanged)
</script>

<svelte:head>
	<title>Andersen — Steiner</title>
	<meta
		name="description"
		content="Andersen — an independent type foundry from Tokyo. Steiner, a 20-weight neo-humanist variable typeface."
	/>
</svelte:head>

<main class="Home">
	<!-- Hero (white) — the Steiner "Aa" specimen, per Figma 313:176 -->
	<section class="Hero">
		<p class="Hero__name">Steiner Sans</p>
		<p class="Hero__headline">Our very first typeface</p>
		<div class="Hero__specimen">
			<!-- Each glyph sits in a fixed-width cell: an invisible Ultra-weight
			     ghost reserves the widest box, and the animated glyph is centred
			     on top of it. Without this the advance width grows with the
			     weight and the pair visibly drifts apart mid-animation. -->
			<p class="Hero__aa">
				{#each AA as { glyph, delay } (glyph)}
					<span class="Hero__cell">
						<span class="Hero__ghost" aria-hidden="true">{glyph}</span>
						<span class="Hero__live" style="animation-delay: {delay};">{glyph}</span>
					</span>
				{/each}
			</p>
		</div>
		<div class="Hero__bottom">
			<div class="Hero__meta">
				<div class="Hero__meta-left">
					<p class="Hero__meta-name">Steiner Sans</p>
					<p class="Hero__meta-class">Neo Humanist Sans</p>
				</div>
				<span class="Hero__meta-version">v1.00000</span>
			</div>
			<a class="Hero__cta" href="/fonts/steiner">Discover</a>
		</div>
	</section>

	<!-- Buy (red) — the license, plainly -->
	<section class="Buy">
		<div class="Buy__inner">
			<p class="Buy__eyebrow">License</p>
			<h2 class="Buy__heading">Make it yours.</h2>
			<p class="Buy__body">
				Steiner Complete gathers the whole family — 20 weights from Hair to Ultra, drawn as
				a single variable font and delivered with statics, for desktop and web alike. One
				perpetual license from €420: no seat renewals, no page-view tiers, no expiry. Buy it
				once and it stays yours, across every project you take on.
			</p>
			<a class="Buy__cta" href="/buy">Buy Steiner <Arrow size={10} /></a>
		</div>
	</section>

	<!-- Custom type service (black) — v1 cover reveal -->
	<section class="Home__custom" use:coverReveal>
		<div class="Custom__inner">
			<p class="Custom__eyebrow">Bespoke</p>
			<!-- Spans, not <br>: they stay inline on desktop and become the three
			     designed lines on phones. -->
			<h2 class="Custom__heading">
				<span>Custom type</span> <span>for corporate</span> <span>identity</span>
			</h2>
			<p class="Custom__body">
				Beyond our retail library, Andersen designs bespoke typefaces for brands and
				institutions — a proprietary voice, drawn from the first sketch to a fully realised
				family. A custom typeface is the most enduring asset a brand can own: it travels
				across every screen, surface, and language while remaining unmistakably yours.
			</p>
			<a class="Custom__cta" href="mailto:hi@august.tf?subject=Custom%20typeface%20enquiry">
				Enquire <Arrow size={10} />
			</a>
		</div>
	</section>

	<!-- Design office band — v1 cover reveal -->
	<section class="Office" use:coverReveal>
		<div class="Office__inner">
			<p class="Office__label">Design Office</p>
			<p class="Office__text">
				Andersen is the pragmatic type design practice led by a creative office
				in Tokyo.
			</p>
			<div class="Office__links">
				<a class="Office__link" href="/about">About type foundry <Arrow size={9} /></a>
				<a
					class="Office__link"
					href="https://takumiisobe.com"
					target="_blank"
					rel="noopener noreferrer">About design office <Arrow size={9} /></a
				>
			</div>
		</div>
	</section>
</main>

<style>
	/* Page-scoped alias — the shared token lives at base.css :root so Header.svelte
	   (a sibling, not a descendant, of .Home) can use the same red for the logo. */
	.Home {
		--red: var(--color-signal);
		/* One display size shared by every section title (Make it yours / Custom
		   type… / Andersen is…). Bounded by viewport HEIGHT as well as
		   width, so a long statement still wraps inside its 100dvh section on a
		   short laptop instead of pushing the section taller. */
		--display-fs: clamp(40px, min(7vw, 9.5vh), 88px);
	}

	/* --- Hero (white) — Steiner "Aa" specimen --- */
	.Hero {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		min-height: 100dvh;
		background: #ffffff;
		color: #000000;
		padding-top: clamp(48px, 8vh, 72px);
		padding-bottom: var(--gutter);
		padding-inline: var(--gutter);
	}

	/* Typeface name leads, set at h2 scale in sentence case. */
	.Hero__name {
		font-family: 'Steiner', sans-serif;
		font-size: var(--display-fs);
		line-height: var(--lh-h2);
		font-weight: var(--fw-base);
		text-align: center;
		margin: 0;
	}

	.Hero__headline {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(15px, 1.6vw, 21px);
		line-height: 1.4;
		font-weight: 400;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		margin: 0;
	}

	.Hero__specimen {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
	}

	.Hero__aa {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(160px, 32vw, 420px);
		line-height: 1;
		margin: 0;
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	/* Seamless wght loop: 1 (Hair) → 950 (Ultra) → 1. Both glyphs share this one
	   keyframe; only their animation-delay differs (set inline, see AA above). */
	@keyframes steinerBreath {
		0%,
		100% {
			font-variation-settings: 'wght' 1;
		}
		50% {
			font-variation-settings: 'wght' 950;
		}
	}

	.Hero__cell {
		position: relative;
		display: inline-block;
	}

	/* The Ultra-weight ghost reserves the widest box, which leaves the pair a
	   touch loose at lighter weights — pull the second glyph back in. */
	.Hero__cell + .Hero__cell {
		margin-left: -8px;
	}

	/* Reserves the box at the heaviest weight — never painted, never announced. */
	.Hero__ghost {
		visibility: hidden;
		font-variation-settings: 'wght' 950;
	}

	/* Centred on the fixed cell, so the glyph thickens in place instead of
	   pushing its neighbour along. */
	.Hero__live {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		font-variation-settings: 'wght' 1;
		animation: steinerBreath 9s ease-in-out infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.Hero__live {
			animation: none;
			font-variation-settings: 'wght' 400;
		}
	}

	.Hero__bottom {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.Hero__meta {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20px;
		font-family: 'Steiner', sans-serif;
	}

	.Hero__meta-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.Hero__meta-name {
		font-size: 11px;
		font-weight: var(--fw-ui);
		margin: 0;
	}

	.Hero__meta-class {
		font-size: 11px;
		opacity: 0.55;
		margin: 0;
	}

	.Hero__meta-version {
		font-size: 11px;
		opacity: 0.55;
		font-variant-numeric: tabular-nums;
	}

	.Hero__cta {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		background: #000000;
		color: #ffffff;
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		text-transform: uppercase;
		letter-spacing: 0.025em;
		text-decoration: none;
		transition: background 0.2s ease;
	}

	.Hero__cta:hover {
		background: #1c1c1c;
	}

	@media (min-width: 768px) {
		.Hero {
			padding-top: clamp(96px, 14vh, 160px);
			padding-bottom: clamp(32px, 5vh, 56px);
		}

		.Hero__cta {
			align-self: center;
			min-width: 280px;
		}
	}

	/* --- Buy (red) --- */
	.Buy {
		background: var(--red);
		color: #ffffff;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		padding-inline: var(--padding);
		padding-top: clamp(70px, 10vh, 130px);
		padding-bottom: clamp(70px, 10vh, 130px);
	}

	.Buy :global(*) {
		color: #ffffff;
	}

	.Buy__inner {
		max-width: 640px;
		/* SP: centered, per the current brief. Reset to left at desktop below. */
		text-align: center;
		margin-inline: auto;
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
		font-size: var(--display-fs);
		line-height: 1.02;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		margin: 0 0 28px;
	}

	.Buy__body {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		/* Narrow column — wraps sooner, so the copy block reads tall, not wide. */
		max-width: 80%;
		margin: 0 auto 36px;
	}

	/* Same text-plus-arrow treatment as the Bespoke / Design Office links,
	   in white against the red band. */
	.Buy__cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		color: #ffffff;
		transition: opacity 0.2s ease;
	}

	.Buy__cta:hover {
		opacity: 0.7;
	}

	@media (min-width: 768px) {
		.Buy__inner {
			text-align: left;
			margin-inline: 0;
		}

		.Buy__body {
			font-size: 16px;
			margin-inline: 0;
		}
	}

	/* --- Custom type service (black) --- */
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
		/* SP: centered, per the current brief. Reset to left at desktop below. */
		text-align: center;
		margin-inline: auto;
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

	/* Matches .Buy__heading — the section titles share one display size. */
	.Custom__heading {
		font-family: 'Steiner', sans-serif;
		font-size: var(--display-fs);
		line-height: 1.02;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		margin: 0 0 28px;
	}

	/* Phones: break to the designed three lines instead of wrapping freely. */
	@media (max-width: 767.98px) {
		.Custom__heading span {
			display: block;
		}
	}

	.Custom__body {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		opacity: 0.85;
		max-width: 80%;
		margin: 0 auto 32px;
	}

	.Custom__cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		color: var(--red);
		transition: opacity 0.2s ease;
	}

	/* The section paints every descendant white via `.Home__custom :global(*)`,
	   which also catches the arrow SVG. Re-assert red inside the CTA. */
	.Custom__cta :global(*) {
		color: var(--red);
	}

	.Custom__cta:hover {
		opacity: 0.7;
	}

	@media (min-width: 768px) {
		.Custom__inner {
			text-align: left;
			margin-inline: 0;
		}

		.Custom__body {
			font-size: 16px;
			margin-inline: 0;
		}
	}

	/* --- Design office (white) — full screen, centered, uppercase --- */
	.Office {
		min-height: 100vh;
		min-height: 100dvh;
		background: #ffffff;
		color: #000000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-inline: var(--padding);
		padding-top: clamp(70px, 10vh, 130px);
		padding-bottom: clamp(70px, 10vh, 130px);
	}

	.Office__inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		/* Wide enough that the statement, set at the display size, still wraps
		   inside one screen — at 800px it ran to 9 lines and pushed the section
		   past 100dvh on a laptop. */
		max-width: 1060px;
		text-align: center;
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

	/* Matches .Buy__heading — this statement is the section's title, so it gets
	   the full column (the 80% cap is for body copy) and wraps in fewer lines. */
	.Office__text {
		font-family: 'Steiner', sans-serif;
		font-size: var(--display-fs);
		font-variation-settings: 'wght' 360;
		line-height: 1.02;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		margin: 0;
	}

	.Office__links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px 28px;
	}

	.Office__link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-ui);
		text-decoration: none;
		color: var(--red);
		transition: opacity 0.2s ease;
	}

	.Office__link:hover {
		opacity: 0.7;
	}
</style>
