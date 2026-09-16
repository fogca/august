<script lang="ts">
	import { browser } from '$app/environment';
	import { coverReveal } from '$lib/actions/coverReveal';
	import Arrow from '$lib/components/Arrow.svelte';
	import IntroHero from '$lib/components/home/IntroHero.svelte';
	import TypefaceSection from '$lib/components/home/TypefaceSection.svelte';
	import TypefaceFooterBar from '$lib/components/home/TypefaceFooterBar.svelte';
	import { TYPEFACES } from '$lib/data/typefaces';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { initScroll, getLenis } from '$lib/scroll';
	import type Snap from 'lenis/snap';

	// Top page v3 (2026-09) — Figma nodes 3:699/3:733 (PC) + 7:887/7:906 (SP).
	// Scheme:
	//   Intro (logo entrance) — see IntroHero.svelte
	//   One TypefaceSection per non-hidden typeface with homeSection data
	//   (today: Norma, Elio) — see TypefaceSection.svelte for the redesign
	//   Buy (red) / Custom (black) / Office (white) : v1 cover reveals (unchanged)
	const homeTypefaces = TYPEFACES.filter((tf) => !tf.hidden && tf.homeSection);

	// Section-to-section snap (2026-09, referencing yadohouse.jp's own
	// top-page feel at the user's request): "少しのスクロールで次のセク
	// ションにピッタリとスナップ...それぞれのコンテンツが入れ替わる" — a
	// small scroll gesture snaps precisely to the next section (Intro, then
	// each TypefaceSection), rather than a normal continuous scroll, all the
	// way through the typeface sections; Buy/Custom/Office below keep
	// scrolling normally.
	//
	// Built on Lenis's own official Snap companion (`lenis/snap`) for its
	// bookkeeping — computing each section's snap offset, animating there
	// via Lenis's own scrollTo, tracking which one is "current" — but NOT
	// its own built-in auto-trigger (`snap.stop()` right after creation
	// disables that). Checked in the installed package's own source, not
	// just its docs: none of its three auto modes actually match "any
	// small gesture commits one full step" — 'mandatory'/'proximity' both
	// resolve to whichever snap point is NUMERICALLY NEAREST the scroll
	// position after the gesture settles, so a small nudge (nowhere near
	// halfway to the next section) just falls back to where it started;
	// 'lock' looked directional at a glance but only reacts to wheel input
	// (touchmove is explicitly ignored in its own onSnap) and its own
	// same-initiator guard against re-triggering during its animation
	// didn't reliably clear between gestures in testing. So this drives
	// `snap.goTo()` directly from a small first-party wheel/touch gesture
	// detector instead (same technique proven earlier this session for the
	// old single-boundary version of this feature) — simple direction + a
	// low threshold, no distance ambiguity.
	//
	// Armed only once `homeIntro.introComplete` is true — IntroHero.svelte
	// flips that the moment the OP's own business is finished (whichever of
	// its three paths got there), so a snap can never fire mid-OP, on top
	// of that file's own separate scroll lock for the same reason.
	//
	// `snapModule` kicks the `lenis/snap` chunk off loading at mount —
	// well before `introComplete` ever flips, given the OP's own ~3.5s
	// runway — rather than only starting that fetch once it's actually
	// needed. On a slow/cold load the fetch can otherwise still be in
	// flight right as the OP finishes, so the very first post-OP gesture
	// silently falls through as plain scroll instead of snapping (caught
	// live on the production deploy, not just locally where the dev
	// server already has the module warm).
	const snapModule = browser ? import('lenis/snap') : null;

	$effect(() => {
		if (!browser || !homeIntro.introComplete) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let snap: Snap | undefined;
		let observer: IntersectionObserver | undefined;
		let detachGesture: (() => void) | undefined;

		Promise.all([snapModule, initScroll()]).then(([mod]) => {
			if (cancelled || !mod) return;
			const SnapCtor = mod.default;
			const lenis = getLenis();
			if (!lenis) return;

			const introEl = document.querySelector<HTMLElement>('.IntroHero');
			const typefaceEls = Array.from(document.querySelectorAll<HTMLElement>('.TypefaceSection'));
			const sectionEls = [introEl, ...typefaceEls].filter((el): el is HTMLElement => !!el);
			// Nothing to snap between (e.g. every typeface is hidden) — leave
			// scrolling alone entirely rather than snap a single section.
			if (sectionEls.length < 2) return;

			snap = new SnapCtor(lenis, {
				duration: 1,
				easing: (t: number) => 1 - Math.pow(1 - t, 3)
			});
			snap.addElements(sectionEls, { align: 'start' });
			// Disable Snap's own automatic resolution entirely — see the
			// comment above; every step through this region is driven by the
			// gesture handlers below instead.
			snap.stop();

			// True only while the snap chain (Intro..last TypefaceSection) is
			// at least partly on screen — toggled by the IntersectionObserver
			// below. Outside it (scrolled into Buy/Custom/Office, or above
			// the very top), the gesture handlers do nothing and plain
			// scrolling behaves exactly as everywhere else on the site.
			let inRegion = true;
			let busy = false;
			let touchStartY = 0;
			const lastIndex = sectionEls.length - 1;

			// Which section the reader is actually looking at RIGHT NOW,
			// computed fresh from real scroll geometry every time — not
			// trusted from Snap's own `currentSnapIndex`, which only moves
			// when WE call next()/previous()/goTo() ourselves. That distinction
			// matters right at this region's edges: once a forward gesture at
			// the last section is allowed to fall through to plain scroll
			// (see canStep below), the reader can drift past this region, or
			// partway back into it, purely by native scrolling — and a stale
			// counter would then send the next gesture to the wrong section
			// (observed while testing: it happily overshot straight past the
			// last section back to the one before it). Each section is
			// exactly one viewport tall with no gaps, so "which one's top has
			// crossed the viewport's own vertical midpoint, last" is exactly
			// which one is current.
			function currentIndex(): number {
				let idx = 0;
				for (let i = 0; i < sectionEls.length; i++) {
					if (sectionEls[i].getBoundingClientRect().top <= window.innerHeight / 2) idx = i;
				}
				return idx;
			}

			// Whether a gesture in this direction should be intercepted at
			// all. Without this, a forward gesture at the LAST section would
			// keep re-triggering a snap to the same spot forever, permanently
			// trapping the reader there with no way to reach
			// Buy/Custom/Office by wheel/touch at all. Backward at the very
			// first section has no equivalent problem (there's nothing above
			// it to reveal either way) but is excluded for symmetry.
			function canStep(direction: 1 | -1) {
				const current = currentIndex();
				if (direction > 0) return current < lastIndex;
				return current > 0;
			}

			function step(direction: 1 | -1) {
				if (busy || !snap) return;
				const target = Math.max(0, Math.min(currentIndex() + direction, lastIndex));
				busy = true;
				snap.goTo(target);
				// Snap's own goTo() animates for `duration` seconds (1s, set
				// above) — hold the gesture guard a little past that so the
				// next real gesture (not the tail of this one) is what
				// registers.
				window.setTimeout(() => {
					busy = false;
				}, 1150);
			}

			function onWheel(e: WheelEvent) {
				if (!inRegion || busy) return;
				if (Math.abs(e.deltaY) > 4) {
					const direction = e.deltaY > 0 ? 1 : -1;
					if (!canStep(direction)) return; // let it fall through to native scroll
					e.preventDefault();
					step(direction);
				}
			}

			function onTouchStart(e: TouchEvent) {
				touchStartY = e.touches[0]?.clientY ?? 0;
			}

			function onTouchMove(e: TouchEvent) {
				if (!inRegion || busy) return;
				const dy = touchStartY - (e.touches[0]?.clientY ?? touchStartY);
				if (Math.abs(dy) > 14) {
					const direction = dy > 0 ? 1 : -1;
					if (!canStep(direction)) return;
					e.preventDefault();
					step(direction);
				}
			}

			window.addEventListener('wheel', onWheel, { passive: false });
			window.addEventListener('touchstart', onTouchStart, { passive: true });
			window.addEventListener('touchmove', onTouchMove, { passive: false });
			detachGesture = () => {
				window.removeEventListener('wheel', onWheel);
				window.removeEventListener('touchstart', onTouchStart);
				window.removeEventListener('touchmove', onTouchMove);
			};

			const lastEl = sectionEls[sectionEls.length - 1];
			observer = new IntersectionObserver(
				([entry]) => {
					// The last snap section has fully scrolled past the TOP of
					// the viewport (moved on into Buy/Custom/Office below) —
					// release the gesture takeover; re-arm if the reader
					// scrolls back up into it.
					inRegion = entry.isIntersecting || entry.boundingClientRect.top >= 0;
				},
				{ threshold: 0 }
			);
			observer.observe(lastEl);
		});

		return () => {
			cancelled = true;
			observer?.disconnect();
			detachGesture?.();
			snap?.destroy();
		};
	});
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
