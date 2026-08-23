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
	<title>August Type Foundry — Steiner</title>
	<meta
		name="description"
		content="August Type Foundry — an independent type foundry from Tokyo. Steiner, a 20-weight neo-humanist variable typeface."
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

	<!-- Alfred (ochre) — the next typeface, announced by its logotype alone -->
	<section class="Alfred">
		<svg
			class="Alfred__mark"
			viewBox="0 0 469 117"
			role="img"
			aria-label="Alfred"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fill="currentColor"
				d="M55.4 2.72998L90.05 98.88L99.22 116.33H78.44L76.94 101.55L68.5 77.38H28.44L20.01 101.53L18.42 116.33H0C0 116.33 7.18 104.72 9.71 97.7C11.38 93.08 35.41 28.28 35.41 28.28L34.57 16.76L55.4 2.72998ZM32.38 66.02H64.54L48.46 20.09L32.38 66.02Z"
			/>
			<path
				fill="currentColor"
				d="M312.87 116.33L318.54 91.28V20.09L312.87 4.33002H375.34L367.12 19.4L331.18 15.53V51.85H366.12L360.55 66.16L331.18 63.05V105.13C354.57 105.13 381.37 98.48 381.37 98.48L376.51 116.33H312.88H312.87Z"
			/>
			<path
				fill="currentColor"
				d="M117.52 63.05V105.13C140.91 105.13 167.71 98.48 167.71 98.48L162.85 116.33H99.22L104.89 91.28V20.09L99.22 9.99L117.52 0V63.05ZM117.52 15.53V51.85Z"
			/>
			<path
				fill="currentColor"
				d="M167.71 116.33L173.38 91.28V23.56L167.71 4.32001H230.18L221.96 19.39L186.02 15.52V51.84H220.96L215.39 66.15L186.02 63.04V98.03L188.87 116.32H167.71V116.33Z"
			/>
			<path
				fill="currentColor"
				d="M402.81 116.33H380.22L385.83 96.94V19.07L383.11 4.33002H407.95C435.99 4.33002 468.81 21.15 468.81 57.05C468.81 103.52 431.66 116.33 402.82 116.33H402.81ZM398.48 15.22V105.27H408.09C429.56 105.27 454.24 90.69 454.24 57.04C454.24 34.45 432.45 15.22 408.09 15.22H398.48Z"
			/>
			<path
				fill="currentColor"
				d="M232.76 4.34003L235.96 15.54V98.08L234.36 116.31H249.72L248.12 104.63V65.76L261.56 65.92L285.55 105.75V116.31H311.78L273.07 64.8C280.75 64.8 300.74 56.8 300.74 36.65C300.74 18.26 286.66 4.34003 232.76 4.34003ZM248.12 16.18C273.07 16.18 288.27 26.1 288.27 36.33C288.27 48.17 276.59 54.4 248.12 54.4V16.18Z"
			/>
		</svg>
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
				Beyond our retail library, August Type Foundry designs bespoke typefaces for brands and
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
				August Type Foundry is the pragmatic type design practice led by a creative office
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
		   type… / August Type Foundry is…). Bounded by viewport HEIGHT as well as
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

	/* --- Alfred (ochre) --- */
	.Alfred {
		background: #d59514;
		color: #000000;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-inline: var(--padding);
	}

	.Alfred__mark {
		display: block;
		/* Cap the mark at its drawn size on wide screens, let it fill the
		   column on narrow ones. */
		width: min(469px, 100%);
		height: auto;
	}

	@media (min-width: 768px) {
		.Alfred__mark {
			width: min(469px, 42vw);
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
