<script lang="ts">
	import { onMount } from 'svelte';
	import { coverReveal } from '$lib/actions/coverReveal';
	import Arrow from '$lib/components/Arrow.svelte';

	// Top page v2 — red / black / white, type-first.
	// Scheme:
	//   Hero (black, video specimen) — Norma wght-axis sweep + Discover — normal scroll
	//   Alfred (ochre) / Asta (blue) — announced, unreleased siblings
	//   Buy (red) / Custom (black) / Office (white) : v1 cover reveals (unchanged)

	// CSS animation-play-state has no effect on native <video> — pause it by
	// hand for users who asked the OS for less motion. SSR still renders
	// `autoplay`; this stops it on the client before the user notices.
	let heroVideo: HTMLVideoElement | undefined = $state();
	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			heroVideo?.pause();
		}
	});
</script>

<svelte:head>
	<title>August Type Foundry — Norma</title>
	<meta
		name="description"
		content="August Type Foundry — an independent type foundry from Tokyo. Norma, a 20-weight neo-humanist variable typeface."
	/>
</svelte:head>

<main class="Home">
	<!-- Hero (black) — Norma variable-weight video specimen -->
	<section class="Hero">
		<p class="Hero__headline">Debut typeface</p>
		<p class="Hero__name">
			<span class="Title__face">Norma</span> <span class="Title__foundry">August</span>
		</p>
		<div class="Hero__specimen">
			<!-- Norma's wght axis, 1 (Hair) -> 950 (Ultra), swept across a row of
			     "a"s (STN services_type_VF_animation source, re-encoded with its
			     90deg display-matrix rotation baked into the pixels — browsers are
			     inconsistent about honouring rotation side-data on <video>). Shown
			     upright at every breakpoint. -->
			<video
				bind:this={heroVideo}
				class="Hero__video"
				src="/videos/asger_vf_aa.mp4"
				autoplay
				loop
				muted
				playsinline
				aria-label="Norma variable weight axis, sweeping from Hair to Ultra"
			></video>
		</div>
		<div class="Hero__bottom">
			<div class="Hero__meta">
				<div class="Hero__meta-left">
					<p class="Hero__meta-name">Norma</p>
					<p class="Hero__meta-class">Neo Humanist Sans</p>
				</div>
				<span class="Hero__meta-version">v1.00000</span>
			</div>
			<a class="Hero__cta" href="/fonts/norma"><span class="CtaLabel">Discover</span></a>
		</div>
	</section>

	<!-- Alfred (ochre) — title in Norma at the Hero's name position, logotype
	     large and centred in the specimen slot below it. -->
	<section class="Alfred">
		<p class="Alfred__name">
			<span class="Title__face">Alfred</span> <span class="Title__foundry">August</span>
		</p>
		<div class="Alfred__specimen">
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
		</div>
		<div class="Alfred__bottom">
			<div class="Alfred__meta">
				<div class="Alfred__meta-left">
					<p class="Alfred__meta-name">Alfred August</p>
					<p class="Alfred__meta-class">Neo Classic</p>
				</div>
				<span class="Alfred__meta-version">In development</span>
			</div>
			<!-- Deliberately a span, not an <a>: there is no Alfred page yet, so the
			     control must not be clickable, focusable, or announced as a link. -->
			<span class="Alfred__cta" aria-disabled="true"><span class="CtaLabel">Coming Soon</span></span>
		</div>
	</section>

	<!-- Asta (white) — same composition as Alfred, one section down. -->
	<section class="Asta">
		<p class="Asta__name">
			<span class="Title__face">Asta</span> <span class="Title__foundry">August</span>
		</p>
		<div class="Asta__specimen">
			<svg
				class="Asta__mark"
				viewBox="0 0 266.08 113.28"
				role="img"
				aria-label="Asta"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill="currentColor"
					d="M0,112L44.48,0h6.24l44.48,112h-7.36l-17.12-43.36H24.32L7.36,112H0ZM26.88,62.24h41.44L47.52,9.44l-20.64,52.8Z"
				/>
				<path
					fill="currentColor"
					d="M163.88,36.32l-7.52-4.67v-1.41h41.4v1.51l-1.32,4.57h-32.55ZM198.4,111.04c-3.2.96-6.4,1.38-9.6,1.28-3.2-.11-6.05-.93-8.56-2.48-2.51-1.54-4.51-3.89-6-7.04-1.49-3.14-2.24-7.17-2.24-12.08V13.8l5.89-5.64h.74v80.32c0,5.65,1.47,9.81,3.29,12.48,1.81,2.67,4.18,4.24,7.12,4.72,2.93.48,6.05.35,9.36-.4v5.76Z"
				/>
				<path
					fill="currentColor"
					d="M147.76,79.6c-1.97-2.96-4.77-5.26-8.05-7.23s-6.57-3.78-9.86-5.09c-3.61-1.48-6.9-3.12-10.02-4.6-2.96-1.64-5.59-3.61-7.56-5.92-1.81-2.14-2.79-4.93-2.79-8.38,0-5.75,4.6-13.64,18.07-13.64,10.02,0,14.95,4.44,18.07,7.89v-7.72c-4.11-3.45-9.2-6.41-18.24-6.41-15.61,0-25.3,10.02-25.3,20.54,0,4.11,1.15,7.56,3.29,10.35s4.77,5.26,8.22,7.07c3.29,1.81,6.57,3.61,10.19,5.26,3.29,1.31,6.57,2.79,9.69,4.44,2.96,1.48,5.59,3.45,7.56,5.75s2.79,5.42,2.79,9.69c0,10.68-9.69,15.12-20.54,15.12-8.54,0-16.6-4.93-21.52-9.53v9.69c4.77,2.79,13.47,6.41,21.52,6.41,16.43,0,27.6-8.05,27.6-22.18,0-4.6-.99-8.38-3.12-11.5Z"
				/>
				<path
					fill="currentColor"
					d="M266.08,58.42c0-16.77-9.77-28.49-27.84-28.49-13.68,0-19.38,4.4-22.8,7v8.47c4.07-4.56,10.58-9.61,22.8-9.61,13.51,0,20.52,9.28,20.84,22.8v7.49c-1.79.16-4.07.33-6.84.65-2.93.16-7.16.81-12.86,1.63-10.1,1.3-17.91,4.23-22.96,8.79-5.05,4.23-7.49,9.61-7.49,15.63,0,3.91.81,7.33,2.44,9.77,1.63,2.77,3.58,4.72,5.86,6.19,2.44,1.63,4.72,2.61,7.33,3.26,2.28.49,4.4.81,6.02.81,4.88,0,8.79-.65,12.37-2.12,3.58-1.63,6.51-3.58,9.28-6.19,2.61-2.61,4.72-5.37,6.84-8.63l.98,16.12h6.02v-53.57ZM259.07,72.26v7.82c0,3.58-.65,6.68-2.28,9.93-1.3,3.26-3.09,6.02-5.54,8.47-2.28,2.61-4.88,4.4-7.98,6.02-2.93,1.47-6.02,2.12-9.28,2.12-1.47,0-3.09-.16-5.21-.65-1.95-.33-3.75-.98-5.86-1.95-1.79-.98-3.42-2.44-4.56-4.23-1.47-1.95-2.12-4.23-2.12-7.16,0-3.09.98-5.86,2.93-8.47,1.95-2.44,4.72-4.72,8.3-6.35,3.75-1.79,7.98-3.09,12.7-3.75,3.26-.33,6.35-.65,8.96-.98s5.05-.49,6.68-.65,2.77-.16,3.26-.16Z"
				/>
			</svg>
		</div>
		<div class="Asta__bottom">
			<div class="Asta__meta">
				<div class="Asta__meta-left">
					<p class="Asta__meta-name">Asta August</p>
					<p class="Asta__meta-class">Sibling to Norma</p>
				</div>
				<span class="Asta__meta-version">In development</span>
			</div>
			<!-- Deliberately a span, not an <a>: there is no Asta page yet, so the
			     control must not be clickable, focusable, or announced as a link. -->
			<span class="Asta__cta" aria-disabled="true"><span class="CtaLabel">Coming Soon</span></span>
		</div>
	</section>

	<!-- Buy (red) — the license, plainly -->
	<section class="Buy">
		<div class="Buy__inner">
			<p class="Buy__eyebrow">License</p>
			<h2 class="Buy__heading">Make it yours.</h2>
			<p class="Buy__body">
				Every typeface in our library ships as a single variable font, delivered with statics for
				desktop and web alike. Licenses are perpetual — pay once, use forever, with no
				subscription, no seat renewals, and no expiry. Desktop, Web, App and Books licenses are
				available, priced per typeface you choose.
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
				Beyond our retail library, August Type Foundry designs bespoke typefaces for brands and
				institutions — a proprietary voice, drawn from the first sketch to a fully realised family.
				A custom typeface is the most enduring asset a brand can own: it travels across every
				screen, surface, and language while remaining unmistakably yours.
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
				August Type Foundry is the pragmatic type design practice led by a creative office in Tokyo.
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
		/* Section titles run one step above --fw-base (320) at every
		   breakpoint. Kept as a token so the two title rules stay in sync
		   rather than hardcoding a weight per component. */
		--display-fw: 350;
		/* Section titles read as two words at two weights: the typeface name
		   carries, the foundry name recedes. Norma is variable (wght 1–950),
		   so these are real interpolated weights, not synthetic. */
		--title-fw-face: 400;
		--title-fw-foundry: 200;
		/* Titles drop to a 36px floor on phones — one step under the
		   shared --display-fs floor, which the other sections keep. */
		--title-fs: clamp(36px, min(7vw, 9.5vh), 88px);
	}

	@media (max-width: 767.98px) {
		.Home {
			/* Fixed, not fluid — the clamp's vw/vh terms only matter once the
			   title has room to grow past 36px, which doesn't happen inside the
			   phone range anyway (see the clamp above); pin it so every SP width
			   reads at the same size instead of drifting toward the 767px edge. */
			--title-fs: 36px;
			/* A touch heavier than desktop at this size — 400/200 read thin
			   this small. */
			--title-fw-face: 500;
			--title-fw-foundry: 300;
		}
	}

	/* --- Hero (black) — Norma variable-weight video specimen --- */
	.Hero {
		display: flex;
		flex-direction: column;
		min-height: 100svh;
		/* Pure black, matching the video's own ground exactly — the frame edge
		   should disappear, not read as a lighter rectangle on black. */
		background: #000000;
		color: #ffffff;
		padding-top: clamp(48px, 8vh, 72px);
		padding-bottom: var(--gutter);
		padding-inline: var(--gutter);
	}

	/* base.css sets color directly on div/p/span/etc, which breaks inheritance
	   from .Hero's own `color` — force every descendant white, same pattern as
	   .Buy/.Home__custom below. .Hero__cta re-asserts black afterwards. */
	.Hero :global(*) {
		color: #ffffff;
	}

	/* Typeface name leads, set at h2 scale in sentence case. */
	.Hero__name {
		font-family: 'Norma', sans-serif;
		font-size: var(--title-fs);
		line-height: var(--lh-h2);
		font-weight: var(--display-fw);
		text-align: center;
		margin: 0;
	}

	.Title__face {
		font-weight: var(--title-fw-face);
	}

	.Title__foundry {
		font-weight: var(--title-fw-foundry);
	}

	.Hero__headline {
		font-family: 'Norma', sans-serif;
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

	/* Shown as encoded (landscape, 1350:1080) on every breakpoint — scaled to
	   fit the flex:1 specimen area without overflowing it, same pattern as
	   .Alfred__mark. No rotation: upright at both PC and SP. */
	/* Bigger than before (was min(900px,78vw)) to read closer to the size the
	   same video plays at on the font-detail page. Still width-driven, NOT
	   height:100% — .Hero__specimen's height comes from flex:1 inside a
	   min-height (not height) container, so it's never a definite value;
	   percentage-height on the video resolved against that indeterminate
	   height and fed back into it, ballooning the whole Hero section past
	   the viewport. max-height is capped in vh (viewport-relative, not a
	   percentage of the flex parent) to sidestep that loop entirely. */
	.Hero__video {
		display: block;
		width: min(1200px, 90vw);
		height: auto;
		max-height: 65vh;
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
		font-family: 'Norma', sans-serif;
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

	/* Shared by every fixed-height link box on this page (Discover / both
	   Coming Soon labels) — the box itself stays put; only the text glyphs
	   nudge down 1.5px to sit optically centred. */
	.CtaLabel {
		display: inline-block;
		transform: translateY(1.5px);
		/* base.css sets color directly on every span, including this one —
		   without this it hardcodes black regardless of context. Hero's CTA is
		   black-on-white already, so that bug was invisible there; Alfred/Asta's
		   Coming Soon is white-on-black, so it disappeared. Inherit for real. */
		color: inherit;
	}

	.Hero__cta {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		background: #ffffff;
		color: #000000;
		font-family: 'Norma', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		text-transform: uppercase;
		letter-spacing: 0.025em;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	/* .Hero :global(*) painted every descendant white; re-assert black text on
	   the button's own white ground. */
	.Hero__cta :global(*) {
		color: #000000;
	}

	.Hero__cta:hover {
		opacity: 0.8;
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

	/* --- Alfred (ochre) — mirrors the Hero's composition exactly --- */
	.Alfred {
		display: flex;
		flex-direction: column;
		min-height: 100svh;
		background: #d59514;
		color: #000000;
		padding-top: clamp(48px, 8vh, 72px);
		padding-bottom: var(--gutter);
		padding-inline: var(--gutter);
	}

	/* Same slot and scale as .Hero__name, set in Norma. */
	.Alfred__name {
		font-family: 'Norma', sans-serif;
		font-size: var(--title-fs);
		line-height: var(--lh-h2);
		font-weight: var(--display-fw);
		text-align: center;
		margin: 0;
	}

	.Alfred__specimen {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
	}

	/* The logotype is the specimen — sized off the viewport like .Hero__aa. */
	.Alfred__mark {
		display: block;
		width: min(1040px, 82vw);
		height: auto;
		max-height: 100%;
	}

	.Alfred__bottom {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.Alfred__meta {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20px;
		font-family: 'Norma', sans-serif;
	}

	.Alfred__meta-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.Alfred__meta-name {
		font-size: 11px;
		font-weight: var(--fw-ui);
		margin: 0;
	}

	.Alfred__meta-class {
		font-size: 11px;
		opacity: 0.55;
		margin: 0;
	}

	.Alfred__meta-version {
		font-size: 11px;
		opacity: 0.55;
		font-variant-numeric: tabular-nums;
	}

	/* Same box as .Hero__cta, held in a disabled state — no hover, no pointer,
	   no focus, and it never receives events. */
	.Alfred__cta {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		background: #000000;
		color: #ffffff;
		font-family: 'Norma', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		text-transform: uppercase;
		letter-spacing: 0.025em;
		text-decoration: none;
		cursor: default;
		pointer-events: none;
		user-select: none;
	}

	/* --- Asta (white) — mirrors .Alfred exactly, one section down --- */
	.Asta {
		display: flex;
		flex-direction: column;
		min-height: 100svh;
		background: #cdd6e6;
		color: #ffffff;
		padding-top: clamp(48px, 8vh, 72px);
		padding-bottom: var(--gutter);
		padding-inline: var(--gutter);
	}

	/* base.css sets color directly on div/p/span/etc, which breaks inheritance
	   from .Asta's own `color` — force every descendant white, same pattern as
	   .Hero above. .Asta__cta is already white-on-black and unaffected. */
	.Asta :global(*) {
		color: #ffffff;
	}

	/* Same slot and scale as .Hero__name / .Alfred__name, set in Norma. */
	.Asta__name {
		font-family: 'Norma', sans-serif;
		font-size: var(--title-fs);
		line-height: var(--lh-h2);
		font-weight: var(--display-fw);
		text-align: center;
		margin: 0;
	}

	.Asta__specimen {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
	}

	/* The logotype is the specimen — sized off the viewport like .Alfred__mark. */
	.Asta__mark {
		display: block;
		width: min(600px, 82vw);
		height: auto;
		max-height: 100%;
	}

	.Asta__bottom {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.Asta__meta {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 20px;
		font-family: 'Norma', sans-serif;
	}

	.Asta__meta-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.Asta__meta-name {
		font-size: 11px;
		font-weight: var(--fw-ui);
		margin: 0;
	}

	.Asta__meta-class {
		font-size: 11px;
		opacity: 0.55;
		margin: 0;
	}

	.Asta__meta-version {
		font-size: 11px;
		opacity: 0.55;
		font-variant-numeric: tabular-nums;
	}

	/* Same box as .Alfred__cta, held in a disabled state — no hover, no pointer,
	   no focus, and it never receives events. */
	.Asta__cta {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		background: #ffffff;
		color: #cdd6e6;
		font-family: 'Norma', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		text-transform: uppercase;
		letter-spacing: 0.025em;
		text-decoration: none;
		cursor: default;
		pointer-events: none;
		user-select: none;
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
		font-family: 'Norma', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.9; /* white on the red needs near-full opacity for AA */
		margin: 0 0 20px;
	}

	.Buy__heading {
		font-family: 'Norma', sans-serif;
		font-size: var(--display-fs);
		line-height: 1.02;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		margin: 0 0 28px;
	}

	.Buy__body {
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0 0 20px;
	}

	/* Matches .Buy__heading — the section titles share one display size. */
	.Custom__heading {
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
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
