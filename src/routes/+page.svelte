<script lang="ts">
	import TypefaceHero from '$lib/components/TypefaceHero.svelte';
	import { maskReveal } from '$lib/actions/maskReveal';
	import { coverReveal } from '$lib/actions/coverReveal';
	import { getTypeface } from '$lib/data/typefaces';

	// Transition scheme:
	//   Top → font01 (steiner) : v2 reveal (maskReveal)
	//   font01 → font02 (gQ)   : normal scroll
	//   font02 → About         : normal scroll
	//   About → Custom          : v1 cover (coverReveal on Custom)
	//   Custom → Design office  : v1 cover (coverReveal on Office)
	const steiner = getTypeface('steiner')!;
	const gq = getTypeface('gq')!;
</script>

<svelte:head>
	<title>August Type Foundry — Steiner, gQ</title>
	<meta
		name="description"
		content="August Type Foundry — an independent type foundry from Tokyo. Steiner and gQ."
	/>
</svelte:head>

<main class="Home">
	<!-- Reveal A: Top KV clips away to reveal font 01 -->
	<section class="Reveal" use:maskReveal={{ scale: 1.06 }}>
		<div class="Reveal__layer Home__kv" data-layer>
			<p class="Home__kv-mark">A.tf</p>
			<div class="Home__kv-bottom">
				<p class="Home__kv-name">August type foundry</p>
				<p class="Home__kv-statement">
					August Type Foundry is an independent type foundry from Tokyo. We draw humanist
					typefaces that treat the letter as the medium meaning passes through — retail
					families and bespoke type for those who value the power of design.
				</p>
				<div class="Home__kv-foot">
					<p class="Home__kv-label">Independent Type Foundry</p>
					<div class="Home__kv-meta">
						<span>Tokyo, Japan</span>
						<span>Est. 2026</span>
						<span class="Home__kv-debut">august.tf</span>
					</div>
				</div>
			</div>
		</div>
		<div class="Reveal__layer" data-layer>
			<TypefaceHero typeface={steiner} total={2} />
		</div>
	</section>

	<!-- font 02 (gQ) — normal scroll; gQ → About is a normal scroll -->
	<TypefaceHero typeface={gq} total={2} />

	<!-- About (white) — normal scroll -->
	<section class="Home__about">
		<div class="About__inner">
			<p class="About__statement">
				August Type Foundry is an independent type foundry from Tokyo, shaping new
				typographic culture for those who value the power of design. We treat a typeface
				not as the meaning itself, but as the medium meaning passes through — so we
				research, draw, and refine each letterform as an integrated whole. Our first
				release, <em>Steiner</em>, folds seventy years of humanist tradition into a single
				contemporary voice. We believe type with intelligence and culture is not a privilege
				for a few, but something inherently essential for everyone who reads, designs, and
				builds.
			</p>
		</div>
	</section>

	<!-- Custom type service (black) — v1 cover reveal over About -->
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

	<!-- Design office band — v1 cover reveal over Custom -->
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
	/* --- Reveal wrappers (v2) ---
	   Flow fallback by default (relative, stacked). The maskReveal action overlaps
	   the layers (absolute) only when active, so reduced-motion / no-JS render
	   every layer as a plain scrollable section. */
	.Reveal {
		position: relative;
		overflow: hidden;
	}

	.Reveal__layer {
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
	}

	/* --- Top KV (white) — big A.tf mark at top, name/statement/meta clustered bottom --- */
	.Home__kv {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 100vh;
		min-height: 100dvh;
		background: #ffffff;
		color: #000000;
		padding: var(--gutter);
	}

	.Home__kv-mark {
		font-family: 'Mokuseki Sans', 'Steiner', sans-serif;
		font-size: clamp(140px, 50vw, 300px);
		line-height: 1;
		letter-spacing: 0;
		white-space: nowrap;
		margin: 0;
	}

	/* name + statement + meta, pushed to the bottom */
	.Home__kv-bottom {
		margin-top: auto;
	}

	.Home__kv-name {
		font-family: 'Mokuseki Sans', 'Steiner', sans-serif;
		font-size: clamp(20px, 6vw, 28px);
		line-height: 1.2;
		letter-spacing: 0;
		margin: 0 0 10px;
	}

	.Home__kv-statement {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.6;
		letter-spacing: 0.01em;
		max-width: 340px;
		margin: 0;
	}

	.Home__kv-foot {
		margin-top: 48px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.Home__kv-label {
		font-family: 'Steiner', sans-serif;
		font-size: 9px;
		line-height: 1.5;
		letter-spacing: 0;
		opacity: 0.9;
		margin: 0;
	}

	.Home__kv-meta {
		display: flex;
		gap: 14px;
		align-items: baseline;
		font-family: 'Steiner', sans-serif;
		font-size: 10px;
		line-height: 1.4;
		letter-spacing: 0;
	}

	.Home__kv-debut {
		margin-left: auto;
	}

	/* --- About (white) — covered panel for the Custom cover, so ~100vh --- */
	.Home__about {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		background: #ffffff;
		color: #000000;
		padding-inline: var(--padding);
		padding-block: 120px;
	}

	.About__inner {
		max-width: 540px;
	}

	.About__statement {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		margin: 0;
	}

	.About__statement em {
		font-style: italic;
	}

	@media (min-width: 768px) {
		.About__statement {
			font-size: 16px;
		}
	}

	/* --- Custom type service (black) — covers About, and is covered by Office --- */
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
		letter-spacing: 0;
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
		letter-spacing: 0;
		text-decoration: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.4);
		padding-bottom: 4px;
		transition: border-color 0.2s ease;
	}

	.Custom__cta:hover {
		border-bottom-color: #ffffff;
	}

	/* --- Design office band --- */
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
		letter-spacing: 0;
		margin: 0;
	}

	.Office__link {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		text-decoration: none;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.Office__link:hover {
		opacity: 1;
	}
</style>
