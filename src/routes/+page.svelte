<script lang="ts">
	import { coverReveal } from '$lib/actions/coverReveal';
	import Arrow from '$lib/components/Arrow.svelte';
	import IntroHero from '$lib/components/home/IntroHero.svelte';
	import TypefaceSection from '$lib/components/home/TypefaceSection.svelte';
	import TypefaceFooterBar from '$lib/components/home/TypefaceFooterBar.svelte';
	import { TYPEFACES } from '$lib/data/typefaces';

	// Top page v3 (2026-09) — Figma nodes 3:699/3:733 (PC) + 7:887/7:906 (SP).
	// Scheme:
	//   Intro (logo entrance) — see IntroHero.svelte
	//   One TypefaceSection per non-hidden typeface with homeSection data
	//   (today: Norma, Elio) — see TypefaceSection.svelte for the redesign
	//   Buy (red) / Custom (black) / Office (white) : v1 cover reveals (unchanged)
	const homeTypefaces = TYPEFACES.filter((tf) => !tf.hidden && tf.homeSection);
</script>

<svelte:head>
	<title>Ōgast — Norma</title>
	<meta
		name="description"
		content="Ōgast — an independent type foundry from Tokyo. Norma, a 20-weight neo-humanist variable typeface."
	/>
</svelte:head>

<main class="Home">
	<!-- Entrance animation — small wordmark stagger-in, grows large with a
	     dark->light crossfade, Header reveals at the same beat. See
	     IntroHero.svelte's own header comment for the Figma sourcing. -->
	<IntroHero />

	<!-- Typeface sections — one 100vh section per non-hidden typeface with
	     homeSection data (Norma, Elio today; gQ/Alfred stay excluded while
	     hidden, same convention as /fonts). See TypefaceSection.svelte. -->
	{#each homeTypefaces as tf (tf.slug)}
		<TypefaceSection typeface={tf} />
	{/each}

	<!-- Mobile-only persistent footer bar for the typeface sections above —
	     see TypefaceFooterBar.svelte's own header comment. Fixed-position,
	     so its place in the DOM here is just for readability. -->
	<TypefaceFooterBar />

	<!-- Buy (red) — the license, plainly -->
	<section class="Buy">
		<div class="Buy__inner">
			<p class="Buy__eyebrow">License</p>
			<h2 class="Buy__heading">Make it yours.</h2>
			<p class="Buy__body">
				Every typeface in our library ships as a single variable font, delivered with statics for
				desktop and web alike. Licenses are perpetual — pay once, use forever, with no subscription,
				no seat renewals, and no expiry. Desktop, Web, App and Books licenses are available, priced
				per typeface you choose.
			</p>
			<a class="Buy__cta" href="/buy">Buy Typeface <Arrow size={10} /></a>
		</div>
	</section>

	<!-- Custom type service (black) — v1 cover reveal -->
	<section class="Home__custom" id="custom" use:coverReveal>
		<div class="Custom__inner">
			<p class="Custom__eyebrow">Bespoke</p>
			<!-- Spans, not <br>: they stay inline on desktop and become the three
			     designed lines on phones. -->
			<h2 class="Custom__heading">
				<span>Custom type</span> <span>for corporate</span> <span>identity</span>
			</h2>
			<p class="Custom__body">
				Beyond our retail library, Ōgast designs bespoke typefaces for brands and institutions — a
				proprietary voice, drawn from the first sketch to a fully realised family. A custom typeface
				is the most enduring asset a brand can own: it travels across every screen, surface, and
				language while remaining unmistakably yours.
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
				Ōgast is the pragmatic type design practice led by a creative office in Tokyo.
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
		   type… / Ōgast is…). Bounded by viewport HEIGHT as well as
		   width, so a long statement still wraps inside its 100dvh section on a
		   short laptop instead of pushing the section taller. */
		--display-fs: clamp(40px, min(7vw, 9.5vh), 88px);
	}

	/* --- Buy (red) --- */
	.Buy {
		background: var(--red);
		color: #ffffff;
		min-height: 100svh;
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
		font-family: var(--font-en), sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.9; /* white on the red needs near-full opacity for AA */
		margin: 0 0 20px;
	}

	.Buy__heading {
		font-family: var(--font-en), sans-serif;
		font-size: var(--display-fs);
		line-height: 1.02;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		margin: 0 0 28px;
	}

	.Buy__body {
		font-family: var(--font-en), sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		/* Magazine-style justification: stretch the SPACE BETWEEN words only.
		   text-justify defaults to inter-word in every browser that matters
		   here, but state it explicitly — inter-character (or its `distribute`
		   alias) is what produces the letter-by-letter gaps inside words that
		   make justified English look broken. hyphens:auto gives the line
		   breaker more places to break, so short justified lines don't have to
		   stretch a single word's spaces to fill the width. */
		text-align: justify;
		text-align-last: center;
		text-justify: inter-word;
		hyphens: auto;
		/* Narrow column — wraps sooner, so the copy block reads tall, not wide. */
		max-width: 90%;
		margin: 0 auto 36px;
	}

	/* Same text-plus-arrow treatment as the Bespoke / Design Office links,
	   in white against the red band. */
	.Buy__cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-en), sans-serif;
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
		min-height: 100svh;
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
		font-family: var(--font-en), sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0 0 20px;
	}

	/* Matches .Buy__heading — the section titles share one display size. */
	.Custom__heading {
		font-family: var(--font-en), sans-serif;
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
		font-family: var(--font-en), sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		opacity: 0.85;
		/* Same magazine-style justification as .Buy__body — see its comment. */
		text-align: justify;
		text-align-last: center;
		text-justify: inter-word;
		hyphens: auto;
		max-width: 90%;
		margin: 0 auto 32px;
	}

	.Custom__cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-en), sans-serif;
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
		min-height: 100svh;
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
		font-family: var(--font-en), sans-serif;
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
		font-family: var(--font-en), sans-serif;
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
		font-family: var(--font-en), sans-serif;
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
