<!-- Load-in for a page title (2026-09, at the user's request — "ロードアニ
     メーションを追加で読み込まれた時wght0でスタートしてstaggerで少しずつ
     指定のウェイトにする"): each character starts at the face's lightest
     weight and thickens to the resting one, one after another.

     `from` defaults to 150 rather than the 0 asked for because 150 IS this
     face's zero — Elio's wght axis runs 150-850 (Norma's runs 1-950), and a
     browser clamps anything below an axis floor. Animating from 0 would
     spend the first 43% of the run on 0-150, where nothing visibly changes,
     and only then start moving. Passing the real floor keeps every
     millisecond of the animation doing something.

     Per character rather than per element, so the weight arrives as a sweep
     across the word — the same gesture the foundry's own specimens use.

     Split text is hidden from assistive tech: the readable copy is the
     visually-hidden span, the animated characters are decorative. -->
<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		text: string;
		/** The weight to settle at — whatever the element rests at in CSS. */
		to?: number;
		/** The weight to start from; clamped by the font's own axis floor. */
		from?: number;
		/** Wait before the first character starts (2026-09, at the user's
		 *  request — "wghtアニメーション始めるのを少し遅らせて"). Measured, not
		 *  a guess: on a client-side navigation PageTransition fades the new
		 *  page in over 0.3s delay + 0.9s, and at mount it is still at opacity
		 *  0 — the first characters used to finish their whole sweep before
		 *  the page was visible at all. 500ms starts the sweep at roughly 0.7
		 *  page opacity. On a hard load it just reads as a short pause. */
		delay?: number;
		/** Delay added per character. */
		stagger?: number;
		/** How long one character takes. */
		duration?: number;
		/** Called once the last character has landed — or straight away when
		 *  there is nothing to animate (reduced motion, empty text). A caller
		 *  hiding content until then relies on this ALWAYS firing, so every
		 *  exit path below calls it. */
		onDone?: () => void;
	}
	let {
		text,
		to = 350,
		from = 150,
		delay = 500,
		stagger = 45,
		duration = 700,
		onDone = undefined
	}: Props = $props();

	/** How long to wait for the real face before animating regardless. A
	 *  caller is holding content hidden until onDone — a slow font must not
	 *  be able to hold it indefinitely. */
	const FONT_WAIT_CAP = 2500;

	const chars = $derived(Array.from(text));

	let rootEl: HTMLElement | undefined = $state();

	onMount(() => {
		if (!rootEl) return;
		// base.css's reduced-motion blanket only zeroes CSS durations — a Web
		// Animations timeline has to opt out by hand.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			onDone?.();
			return;
		}

		const els = Array.from(rootEl.querySelectorAll<HTMLElement>('[data-char]'));
		if (!els.length) {
			onDone?.();
			return;
		}

		let cancelled = false;
		let started = false;
		const running: Animation[] = [];

		// Hold the light state from the very first frame. Without this the
		// title paints once at its resting weight and only then snaps thin,
		// which reads as a glitch rather than an entrance.
		for (const el of els) el.style.fontVariationSettings = `'wght' ${from}`;

		/** Weight back to the stylesheet, and tell the caller. Clears the
		 *  inline hold FIRST, so cancelling the (fill:both) animations reveals
		 *  the CSS value rather than a frame of `from`. */
		function finish() {
			if (cancelled) return;
			for (const el of els) el.style.fontVariationSettings = '';
			for (const a of running) a.cancel();
			onDone?.();
		}

		function play() {
			if (cancelled || started) return;
			started = true;
			try {
				for (const [i, el] of els.entries()) {
					running.push(
						el.animate(
							[
								{ fontVariationSettings: `'wght' ${from}` },
								{ fontVariationSettings: `'wght' ${to}` }
							],
							{
								duration,
								delay: delay + i * stagger,
								easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
								fill: 'both'
							}
						)
					);
				}
			} catch {
				// No Web Animations support: skip straight to the resting state
				// rather than leave the caller's content hidden.
				finish();
				return;
			}
			running[running.length - 1]?.finished.then(finish).catch(() => {
				/* cancelled on unmount — nothing to hand back */
			});
		}

		// The fallback face has no wght axis at all, so running this before the
		// real one arrives would animate nothing and then jump. Resolves
		// immediately on a warm cache, which is every navigation after the
		// first — capped, so a slow font can't hold the caller's content back.
		const fontCap = window.setTimeout(play, FONT_WAIT_CAP);
		if (document.fonts?.ready) void document.fonts.ready.then(play);
		else play();

		return () => {
			cancelled = true;
			window.clearTimeout(fontCap);
			for (const a of running) a.cancel();
		};
	});
</script>

<!-- prettier-ignore -->
<span class="WeightReveal" bind:this={rootEl}><span class="WeightReveal__sr">{text}</span><span
		class="WeightReveal__chars"
		aria-hidden="true"
	>{#each chars as ch, i (i)}{#if ch === ' '}{' '}{:else}<span data-char>{ch}</span>{/if}{/each}</span></span>

<style>
	/* Everything here inherits: the point is that the split is invisible to
	   layout, so the title reads exactly as it did as a single text node. */
	.WeightReveal,
	.WeightReveal__chars {
		font: inherit;
		letter-spacing: inherit;
		color: inherit;
	}

	.WeightReveal [data-char] {
		font: inherit;
		letter-spacing: inherit;
		color: inherit;
		/* Deliberately NOT inline-block: staying inline keeps the characters in
		   one inline formatting context, so line breaking still works on the
		   whole word the way it does for ordinary text. */
	}

	/* Same shape as .Footer__sr — the real, readable copy. */
	.WeightReveal__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
