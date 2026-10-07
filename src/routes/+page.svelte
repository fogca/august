<script lang="ts">
	import { browser } from '$app/environment';
	import HomeTop from '$lib/components/home/HomeTop.svelte';
	import GlyphFill from '$lib/components/home/GlyphFill.svelte';
	import AboutSection from '$lib/components/home/AboutSection.svelte';
	import { TYPEFACES } from '$lib/data/typefaces';
	import { homeIntro } from '$lib/state/homeIntro.svelte';
	import { LOGO_LETTERS } from '$lib/data/logo';
	import { initScroll, getLenis, onScroll } from '$lib/scroll';
	import { onMount } from 'svelte';

	// Top page (2026-10 Apres Guerre redesign, Figma "II-ii"):
	//   opening + typeface heroes (HomeTop)  →  Custom (zoom)  →  Custom copy
	//   →  About  →  Contact  →  Footer

	// homeIntro is a module singleton, so an in-app navigation BACK to '/'
	// would otherwise still read last visit's `true` — arming the snap
	// mid-opening, the exact thing introComplete exists to prevent. HomeTop
	// sets it again once this visit's opening is done.
	if (browser) homeIntro.introComplete = false;

	const homeTypefaces = TYPEFACES.filter((tf) => !tf.hidden && tf.homeSection).sort(
		(a, b) => a.order - b.order
	);

	// The Custom section's pile: the wordmark's own A, P, G and R (2026-10, at
	// the user's request — "ロゴのsvgから抽出したもの…グリフはAPGRの4つ"),
	// as outlines at the logo's own proportions. Indices into LOGO_LETTERS
	// (A P R E S G U E R R E): A=0, P=1, R=2, G=5.
	//
	// Sized off the screen rather than fixed px (2026-10, "それぞれの文字もっと
	// 大きくして"): letter height is a share of the viewport height on PC, of
	// its width on phones (where height would make them too wide to tumble).
	const PILE_LETTERS = [0, 1, 5, 2];
	const PILE_HEIGHT_OF_VH = 0.4;
	const PILE_HEIGHT_OF_VW_SMALL = 0.5;
	const SMALL_SCREEN = 768;
	/** Cap height of the wordmark's letters, viewBox units. */
	const LETTER_UNITS = 146;
	function pileShapes() {
		const target =
			window.innerWidth < SMALL_SCREEN
				? window.innerWidth * PILE_HEIGHT_OF_VW_SMALL
				: window.innerHeight * PILE_HEIGHT_OF_VH;
		const scale = target / LETTER_UNITS;
		return PILE_LETTERS.map((i) => {
			const l = LOGO_LETTERS[i];
			return {
				d: l.d,
				ox: l.x0,
				oy: l.y0,
				w: (l.x1 - l.x0) * scale,
				h: (l.y1 - l.y0) * scale,
				scale,
				core: l.core
			};
		});
	}

	// ── Custom: scroll zooms into the pile ─────────────────────────────────
	// (2026-10, at the user's request — "スクロールしていくと下に行かずに、どん
	// どんZoomしていってほしい…Zoomしてまた別のセクションになる"). The section
	// is a tall track with the glyph field pinned (sticky) inside it; scrolling
	// through the track zooms the field in (GlyphFill's `zoom`) instead of
	// moving it, until one letter's own stroke fills the screen with the brand
	// blue — which is the ground of the next section, so the zoom lands in it.
	let customTrackEl: HTMLElement | undefined = $state();
	let customStageEl: HTMLElement | undefined = $state();
	/** 0 when the stage pins, 1 when it lets go. */
	let customZoom = $state(0);

	onMount(() => {
		if (!customTrackEl || !customStageEl) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const track = customTrackEl;
		const stage = customStageEl;
		// Layout offsets, so nothing transformed (the heroes' entrance) skews it.
		const docTop = (el: HTMLElement) => {
			let y = 0;
			for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
				y += n.offsetTop;
			}
			return y;
		};
		const update = () => {
			const span = track.offsetHeight - stage.offsetHeight;
			const p = span > 0 ? (window.scrollY - docTop(track)) / span : 0;
			customZoom = Math.min(1, Math.max(0, p));
		};
		update();
		const off = onScroll(update);
		window.addEventListener('resize', update, { passive: true });
		return () => {
			off();
			window.removeEventListener('resize', update);
		};
	});

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

	<!-- 2. Custom type for business — a full-screen field of the wordmark's
	     own A P G R raining down and packing the screen (GlyphFill, in `shapes`
	     mode; without that prop it pours the typeset version), pinned while
	     scrolling zooms into it (see "Custom: scroll zooms into the pile"). -->
	<section class="Home__custom" id="custom" bind:this={customTrackEl}>
		<div class="Custom__stage" bind:this={customStageEl}>
			<GlyphFill shapes={pileShapes} color="var(--brand-blue)" zoom={customZoom} />
		</div>
	</section>

	<!-- 2b. Where the zoom lands: the same blue the stroke filled the screen
	     with. Carries the Custom copy that used to sit in a white card over
	     the field (2026-10, at the user's request, the card is gone from the
	     field — "白背景・テキストエリア削除"). -->
	<section class="Home__customCopy" aria-labelledby="custom-heading">
		<div class="Custom__inner">
			<p class="Custom__eyebrow">Bespoke</p>
			<!-- Spans, not <br>: they stay inline on desktop and become the three
			     designed lines on phones. -->
			<h2 class="Custom__heading" id="custom-heading">
				<span>Custom Type</span> <span>for Corporate</span> <span>Identity</span>
			</h2>
			<p class="Custom__body">
				Beyond our retail library, Apres Guerre designs bespoke typefaces for brands and
				institutions — a proprietary voice, drawn from the first sketch to a fully realised family.
				A custom typeface is the most enduring asset a brand can own: it travels across every
				screen, surface, and language while remaining unmistakably yours.
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
		/* One display size shared by every section title. Bounded by viewport
		   HEIGHT as well as width, so a long statement still wraps inside its
		   own screen on a short laptop instead of pushing the section taller. */
		--display-fs: clamp(40px, min(7vw, 9.5vh), 88px);
	}

	/* --- 2. Custom type for business (glyph field) --- */
	/* A tall track: one screen for the pinned stage plus --zoom-span of
	   scroll that drives the zoom. No overflow clipping here — a clipping
	   ancestor is exactly what kills position:sticky. */
	.Home__custom {
		--zoom-span: 180vh;
		position: relative;
		height: calc(100vh + var(--zoom-span));
		height: calc(100lvh + var(--zoom-span));
		background: #ffffff;
		/* Full-bleed: base.css's global `section { padding-inline }` would
		   otherwise inset the canvas from both edges. */
		padding: 0;
	}

	.Custom__stage {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100lvh;
		overflow: hidden;
		background: #ffffff;
	}

	@media (max-width: 767.98px) {
		.Home__custom {
			--zoom-span: 150vh;
		}
	}

	/* No zoom without motion: just the one screen of the field. */
	@media (prefers-reduced-motion: reduce) {
		.Home__custom {
			--zoom-span: 0px;
		}
	}

	/* --- 2b. Where the zoom lands --- */
	.Home__customCopy {
		min-height: 100vh;
		min-height: 100lvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--brand-blue);
		padding-block: clamp(96px, 12vh, 140px);
		text-align: center;
	}

	/* base.css re-asserts a colour on each text element individually. */
	.Home__customCopy :global(*) {
		color: var(--brand-paper);
	}

	.Custom__inner {
		max-width: 760px;
	}

	.Custom__eyebrow {
		font-family: var(--font-en), sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.7;
		margin: 0 0 20px;
	}

	.Custom__heading {
		font-family: var(--font-en), sans-serif;
		font-size: clamp(36px, min(6vw, 8vh), 80px);
		line-height: 1.02;
		/* Title case in the copy itself now, not CSS text-transform (2026-09,
		   at the user's request — "uppercase外して、Custom Type for
		   Corporate Identityに変更"). */
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
		font-size: 15px;
		font-variation-settings: 'wght' 360;
		line-height: 1.7;
		letter-spacing: 0.02em;
		/* Centred, not justified (2026-09, at the user's request —
		   "Custom文章justifyからcenterへ"). */
		text-align: center;
		max-width: 56ch;
		margin: 0 auto 32px;
	}

	/* Solid, square-cornered box link (2026-09, at the user's request —
	   "Top AboutとCustomセクションのボタンもContact同様ボックスリンクに変更")
	   — replaces the Arrow.svelte + text pattern. Brand blue on the brand
	   orange (2026-10, at the user's request — was white on the signal red). */
	.Home__customCopy .Custom__cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 16px 32px;
		font-family: var(--font-en), sans-serif;
		font-size: 15px;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		color: var(--brand-blue);
		background: var(--brand-orange);
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
		color: var(--brand-blue);
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
