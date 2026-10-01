<script lang="ts">
	import { browser } from '$app/environment';
	import HomeTop from '$lib/components/home/HomeTop.svelte';
	import GlyphFill from '$lib/components/home/GlyphFill.svelte';
	import AboutSection from '$lib/components/home/AboutSection.svelte';
	import { TYPEFACES } from '$lib/data/typefaces';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { headerYield } from '$lib/state/headerYield.svelte';
	import { initScroll, getLenis, onScroll } from '$lib/scroll';
	import { onMount } from 'svelte';

	// Top page (2026-10 Apres Guerre redesign, Figma "II-ii"):
	//   opening + typeface heroes (HomeTop)  →  Custom  →  About  →  Contact  →  Footer

	// homeIntro is a module singleton, so an in-app navigation BACK to '/'
	// would otherwise still read last visit's `true` — arming the snap
	// mid-opening, the exact thing introComplete exists to prevent. HomeTop
	// sets it again once this visit's opening is done.
	if (browser) homeIntro.introComplete = false;

	const homeTypefaces = TYPEFACES.filter((tf) => !tf.hidden && tf.homeSection).sort(
		(a, b) => a.order - b.order
	);

	// ── Section-to-section snap ────────────────────────────────────────────
	// Referencing yadohouse.jp's own first-view feel at the user's request:
	// "少しのスクロール検知で自動でスナップする" — one small gesture commits one
	// full step. (Measured on that site: its first view is position:fixed and a
	// wheel gesture past a ~20 deltaY threshold slides it away over 1.2s on a
	// cubic-bezier(.165,.84,.44,1); the page scrolls normally underneath.)
	//
	// Steps here are: the top of the page → each typeface hero → the Custom
	// section. Below that (About / Contact / Footer) scrolling is completely
	// normal.
	//
	// This drives lenis.scrollTo() from a first-party wheel/touch detector
	// rather than lenis/snap. That companion was used before and dropped: none
	// of its three auto modes matches "any small gesture commits one full step"
	// ('mandatory'/'proximity' resolve to the NUMERICALLY NEAREST snap point, so
	// a small nudge falls back to where it started; 'lock' ignores touchmove
	// outright), and its goTo() indexes an array sorted by absolute offset
	// rather than registration order, which silently reorders steps. What is
	// left is one scrollTo call — with `lock: true`, which Snap only ever set in
	// its own 'lock' mode, and whose absence is why trackpad momentum arriving
	// mid-animation used to replace the in-flight scroll and strand the reader
	// between two steps.
	const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);
	const STEP_DURATION = 1; // seconds, matching yadohouse's own 1.2s-ish feel
	const WHEEL_THRESHOLD = 4;
	const TOUCH_THRESHOLD = 14;
	const QUIET_AFTER_STEP = 120; // ms of no input before another step is allowed
	const BUSY_BACKSTOP = 2000; // ms — an interrupted animation must never lock the page

	$effect(() => {
		if (!browser || !homeIntro.introComplete) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let cancelled = false;
		let detach: (() => void) | undefined;

		initScroll().then(() => {
			if (cancelled) return;
			const lenis = getLenis();
			if (!lenis) return;

			const heroEls = Array.from(document.querySelectorAll<HTMLElement>('.HomeHero'));
			const customEl = document.querySelector<HTMLElement>('.Home__custom');
			if (!heroEls.length || !customEl) return;

			// Absolute document offsets, measured rather than derived from
			// viewport units (the heroes are vh, the lead svh on SP).
			let targets: number[] = [];

			function measure() {
				if (!customEl) return;
				const y = window.scrollY;
				const top = (el: HTMLElement) => Math.round(el.getBoundingClientRect().top + y);
				targets = [0, ...heroEls.map(top), top(customEl)];
			}

			measure();
			if (targets.length < 2) return;

			let busy = false;
			/** True while WE hold Lenis stopped for the post-step quiet window. */
			let quietStopped = false;
			let quietTimer = 0;
			let backstopTimer = 0;
			let touchStartY = 0;
			let touchArmed = false;

			// Positional check PLUS one state check: with the mobile menu panel
			// open, a drag inside it would otherwise scroll-snap the page behind
			// it. Read off the Header's own `is-open` class rather than adding
			// another shared signal for one boolean.
			const armed = () =>
				targets.length > 1 &&
				window.scrollY <= targets[targets.length - 1] + 1 &&
				!document.querySelector('.Header.is-open');

			// "The last target whose midpoint from the previous one we've crossed."
			// For uniform one-screen spacing this is identical to the old
			// `rect.top <= innerHeight/2` rule, so the feel is unchanged; for any
			// non-uniform spacing it degrades to nearest-target. Recomputed fresh
			// on every gesture — never cached, because the reader can drift
			// between steps by scrollbar, keyboard or momentum, and a stale
			// counter then sends the next gesture to the wrong place.
			function currentIndex() {
				const s = window.scrollY;
				let idx = 0;
				for (let i = 1; i < targets.length; i++) {
					if (s >= (targets[i - 1] + targets[i]) / 2) idx = i;
				}
				return idx;
			}

			// Without this, a forward gesture at the last target would re-snap to
			// the same spot forever and trap the reader there with no way to
			// reach About/Contact/Footer by wheel at all.
			function canStep(direction: 1 | -1) {
				const current = currentIndex();
				return direction > 0 ? current < targets.length - 1 : current > 0;
			}

			function clearBusy() {
				busy = false;
				window.clearTimeout(quietTimer);
				window.clearTimeout(backstopTimer);
				quietTimer = 0;
				backstopTimer = 0;
			}

			/** Release the gesture guard, and let Lenis take input again. */
			function clearQuiet() {
				const l = getLenis();
				// Paired with the stop() in onComplete below. start() is a no-op
				// unless it was actually stopped, so this cannot resume a lock
				// that belongs to someone else (HomeTop's opening).
				if (l?.isStopped && quietStopped) l.start();
				quietStopped = false;
				clearBusy();
			}

			function step(direction: 1 | -1) {
				if (busy) return;
				const l = getLenis();
				// lenis.scrollTo() returns immediately while stopped (HomeTop's
				// opening lock), so without this the guard would be burned on a
				// no-op and swallow the reader's next real gesture.
				if (!l || l.isStopped) return;

				// Measured per gesture, not cached for the session: on iOS the
				// vh/svh-sized blocks above shift by the URL bar's height the
				// first time the reader scrolls, and the resize filter below
				// deliberately ignores exactly that change. A few
				// getBoundingClientRect reads per committed gesture is cheaper
				// than predicting when they moved, and it can't run
				// mid-animation (busy already returned above).
				measure();

				const target = Math.max(0, Math.min(currentIndex() + direction, targets.length - 1));
				busy = true;
				touchArmed = false;
				l.scrollTo(targets[target], {
					duration: STEP_DURATION,
					easing: EASE_OUT_CUBIC,
					// Lenis only bails out of onVirtualScroll on isStopped ||
					// isLocked, so without this, momentum arriving during the
					// animation replaces it and strands the reader mid-step.
					lock: true,
					onComplete: () => {
						// Lenis clears its own lock in reset() BEFORE calling this,
						// so from here until the quiet window closes the page would
						// otherwise be free to native-scroll off the target it just
						// landed on, carried by the tail of the same flick. stop()
						// holds it for that window; clearQuiet() starts it again.
						const cur = getLenis();
						if (cur && !cur.isStopped) {
							cur.stop();
							quietStopped = true;
						}
						window.clearTimeout(quietTimer);
						quietTimer = window.setTimeout(clearQuiet, QUIET_AFTER_STEP);
					}
				});
				// Backstop: if the animation is interrupted and onComplete never
				// fires, release the guard anyway — and un-lock Lenis by hand if
				// it somehow stayed locked, so the page can never end up frozen.
				backstopTimer = window.setTimeout(() => {
					const cur = getLenis();
					// stop()+start() is the public route to Lenis's own reset()
					// (start() only resets when it was stopped), which is what
					// clears isLocked. Only run it if the lock is genuinely still
					// held — otherwise this would kill an animation that is simply
					// slow (a backgrounded tab pauses rAF, so onComplete can arrive
					// long after the wall-clock backstop).
					if (cur?.isLocked) {
						cur.stop();
						cur.start();
					}
					clearQuiet();
				}, BUSY_BACKSTOP);
			}

			function onWheel(e: WheelEvent) {
				if (!armed()) return;
				if (busy) {
					// Momentum outliving the animation must not commit a second
					// step — every event while busy restarts the quiet window.
					if (quietTimer) {
						window.clearTimeout(quietTimer);
						quietTimer = window.setTimeout(clearQuiet, QUIET_AFTER_STEP);
					}
					return;
				}
				if (Math.abs(e.deltaY) <= WHEEL_THRESHOLD) return;
				const direction: 1 | -1 = e.deltaY > 0 ? 1 : -1;
				if (!canStep(direction)) return; // fall through to native scroll
				e.preventDefault();
				step(direction);
			}

			function onTouchStart(e: TouchEvent) {
				touchStartY = e.touches[0]?.clientY ?? 0;
				touchArmed = true;
			}

			function onTouchMove(e: TouchEvent) {
				if (!armed() || busy || !touchArmed) return;
				const dy = touchStartY - (e.touches[0]?.clientY ?? touchStartY);
				if (Math.abs(dy) <= TOUCH_THRESHOLD) return;
				const direction: 1 | -1 = dy > 0 ? 1 : -1;
				if (!canStep(direction)) return;
				e.preventDefault();
				step(direction);
			}

			// Re-measure when the layout can actually have moved: after the
			// variable fonts land (both are font-display:swap, and the headline
			// reflows when they arrive), and on a real resize. Width-or-big-
			// height-change only, debounced — an unfiltered listener re-measures
			// on every iOS URL-bar show/hide and shifts the targets under the
			// reader mid-scroll.
			let lastW = window.innerWidth;
			let lastH = window.innerHeight;
			let resizeTimer = 0;
			function onResize() {
				const w = window.innerWidth;
				const h = window.innerHeight;
				if (w === lastW && Math.abs(h - lastH) < 120) return;
				lastW = w;
				lastH = h;
				window.clearTimeout(resizeTimer);
				resizeTimer = window.setTimeout(measure, 200);
			}

			document.fonts?.ready.then(() => {
				if (!cancelled) measure();
			});

			window.addEventListener('wheel', onWheel, { passive: false });
			window.addEventListener('touchstart', onTouchStart, { passive: true });
			window.addEventListener('touchmove', onTouchMove, { passive: false });
			window.addEventListener('resize', onResize, { passive: true });

			detach = () => {
				window.removeEventListener('wheel', onWheel);
				window.removeEventListener('touchstart', onTouchStart);
				window.removeEventListener('touchmove', onTouchMove);
				window.removeEventListener('resize', onResize);
				window.clearTimeout(quietTimer);
				window.clearTimeout(backstopTimer);
				window.clearTimeout(resizeTimer);
			};
		});

		return () => {
			cancelled = true;
			detach?.();
		};
	});

	// The typeface heroes are full-bleed screens with their own tagline in
	// the top-left corner, right where the compact Header's nav would sit —
	// so the Header steps aside (headerYield) for as long as a hero is under
	// its bar, and comes back over the white sections either side.
	onMount(() => {
		const heroesEl = document.querySelector<HTMLElement>('.HomeHeroes');
		const barEl = document.querySelector<HTMLElement>('.Header__bar');
		if (!heroesEl) return;
		// Layout offsets, not getBoundingClientRect: the heroes may still carry
		// their entrance transform when this first runs (a reload that lands
		// on a hero), which would put them ~half a screen too low.
		const docTop = () => {
			let y = 0;
			for (let el: HTMLElement | null = heroesEl; el; el = el.offsetParent as HTMLElement | null) {
				y += el.offsetTop;
			}
			return y;
		};
		const update = () => {
			const line = barEl?.offsetHeight ?? 0;
			const top = docTop() - window.scrollY;
			headerYield.active = top < line && top + heroesEl.offsetHeight > line;
		};
		update();
		const off = onScroll(update);
		window.addEventListener('resize', update, { passive: true });
		return () => {
			off();
			window.removeEventListener('resize', update);
			headerYield.active = false;
		};
	});
</script>

<svelte:head>
	<title>Apres Guerre — Norma</title>
	<meta
		name="description"
		content="Apres Guerre — an independent type foundry. Norma, a 20-weight neo-humanist variable typeface."
	/>
</svelte:head>

<main class="Home">
	<!-- 1. Opening, then the typeface heroes (see HomeTop.svelte). -->
	<HomeTop typefaces={homeTypefaces} />

	<!-- 2. Custom type for business — the copy over a full-screen field of
	     the wordmark's own letters raining down and packing the screen
	     (GlyphFill). -->
	<section class="Home__custom" id="custom">
		<GlyphFill />
		<div class="Custom__inner">
			<p class="Custom__eyebrow">Bespoke</p>
			<!-- Spans, not <br>: they stay inline on desktop and become the three
			     designed lines on phones. -->
			<h2 class="Custom__heading">
				<span>Custom Type</span> <span>for Corporate</span> <span>Identity</span>
			</h2>
			<p class="Custom__body">
				Beyond our retail library, Apres Guerre designs bespoke typefaces for brands and institutions — a
				proprietary voice, drawn from the first sketch to a fully realised family. A custom typeface
				is the most enduring asset a brand can own: it travels across every screen, surface, and
				language while remaining unmistakably yours.
			</p>
			<a class="Custom__cta" href="/custom">Explore custom type</a>
		</div>
	</section>

	<!-- 3. About — one screen of running text, set well above body size. -->
	<AboutSection />

	<!-- 4. Contact — no in-page form (2026-09, at the user's request, "トップに
	     問い合わせフォームを設置する必要はない"); a plain button in the form's old
	     spot hands off to /contact instead. -->
	<section class="Home__contact" id="contact">
		<div class="Contact__inner">
			<p class="Contact__eyebrow">Contact</p>
			<h2 class="Contact__heading">Licensing, custom type, general enquiries.</h2>
			<p class="Contact__body">
				For license questions, enterprise requirements (1,000+ users / 100M+ PV), bespoke typefaces,
				or anything else — please get in touch. We will respond within five business days.
			</p>
			<a class="Contact__cta" href="/contact">Contact us</a>
		</div>
	</section>
</main>

<style>
	.Home {
		--red: var(--color-signal);
		/* One display size shared by every section title. Bounded by viewport
		   HEIGHT as well as width, so a long statement still wraps inside its
		   own screen on a short laptop instead of pushing the section taller. */
		--display-fs: clamp(40px, min(7vw, 9.5vh), 88px);
	}

	/* --- 2. Custom type for business (glyph field) --- */
	.Home__custom {
		/* Header clearance for the glyph pile now lives inside GlyphFill.svelte
		   itself (topClearance) rather than as a CSS crop here — see that
		   file's own comment. */
		position: relative;
		/* Fixed, not min-height (2026-09, at the user's request, "100vhで",
		   then refined to "100lvhで" — the large viewport unit, so this
		   doesn't shrink when the mobile URL bar is showing) — the card's own
		   content used to be able to push this taller than one screen;
		   overflow:hidden below now clips it back to exactly one screen. */
		height: 100vh;
		height: 100lvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ffffff;
		/* Full-bleed: base.css's global `section { padding-inline: var(--padding) }`
		   would otherwise inset the canvas from both edges. */
		padding-inline: 0;
		padding-block: clamp(96px, 12vh, 140px);
		overflow: hidden;
	}

	/* The copy sits in its own card over the glyph field — the field is the
	   section's image, so the text needs its own ground to stay readable. */
	.Custom__inner {
		position: relative;
		z-index: 1;
		max-width: min(640px, calc(100% - 2 * var(--padding)));
		background: #ffffff;
		border: 1px solid #000000;
		padding: clamp(24px, 4vw, 44px);
		text-align: center;
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

	.Custom__heading {
		font-family: var(--font-en), sans-serif;
		font-size: clamp(32px, min(5.2vw, 7vh), 64px);
		line-height: 1.02;
		/* Title case in the copy itself now, not CSS text-transform (2026-09,
		   at the user's request — "uppercase外して、Custom Type for
		   Corporate Identityに変更"). */
		letter-spacing: 0.025em;
		margin: 0 0 24px;
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
		/* Centred, not justified (2026-09, at the user's request —
		   "Custom文章justifyからcenterへ"). */
		text-align: center;
		margin: 0 auto 28px;
	}

	/* Solid, square-cornered box link (2026-09, at the user's request —
	   "Top AboutとCustomセクションのボタンもContact同様ボックスリンクに変更")
	   — replaces the Arrow.svelte + text pattern. Keeps the brand red this
	   CTA already had, now as the box's own fill rather than the text colour. */
	.Custom__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 16px 32px;
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		color: #ffffff;
		background: var(--red);
		border: 0;
		border-radius: 0;
		text-decoration: none;
		transition: opacity 0.15s ease;
	}

	.Custom__cta:hover {
		opacity: 0.8;
	}

	/* --- 4. Contact --- */
	.Home__contact {
		/* Not a full screen (2026-09, at the user's request — "トップの
		   Contactセクションは100vhではなくて良いのでもう少し低く適切な
		   余白ーpadding-y 100pxとかで") — was min-height:100svh; sized by
		   its own content plus a plain top/bottom padding instead. */
		display: flex;
		align-items: center;
		/* Fixed dark grey, white text (2026-09, at the user's request — About
		   and Contact reading as the exact same colour was the problem, not
		   the colour itself, so Contact now gets its own fixed tone instead of
		   sharing the debug-switchable --summer-color with About/the /contact
		   page). */
		background: #333333;
		padding-block: 100px;
	}

	/* base.css §7 re-asserts a colour on div/p/span/a/h2/button/input
	   individually, so a plain `color` on the section would never reach them —
	   the same :global(*) pattern the Footer and the old Buy band use. */
	.Home__contact :global(*) {
		color: #ffffff;
	}

	.Contact__inner {
		width: 100%;
		max-width: 1440px;
		margin-inline: auto;
	}

	.Contact__eyebrow {
		font-family: var(--font-en), sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0 0 20px;
	}

	.Contact__heading {
		font-family: var(--font-en), sans-serif;
		font-size: var(--display-fs);
		line-height: 1.02;
		letter-spacing: 0.01em;
		max-width: 20ch;
		margin: 0 0 24px;
	}

	.Contact__body {
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		opacity: 0.8;
		max-width: 52ch;
		margin: 0;
	}

	/* Stands in for the form that used to start here — same 2em gap
	   ContactForm's own .ContactForm__form used. Square corners are
	   deliberate (unlike the pill-shaped submit button elsewhere on the
	   site). Light on the dark #333 ground now — wins over .Home__contact's
	   :global(*) white-out above by coming later in source order at equal
	   specificity. */
	.Contact__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-top: 2em;
		padding: 16px 32px;
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		color: #000000;
		background: #ffffff;
		border: 0;
		border-radius: 0;
		text-decoration: none;
		transition: opacity 0.15s ease;
	}

	.Contact__cta:hover {
		opacity: 0.8;
	}

	@media (max-width: 767.98px) {
		.Contact__cta {
			display: flex;
			width: 100%;
		}
	}
</style>
