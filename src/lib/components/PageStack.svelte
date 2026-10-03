<!-- A page built from several body sections that share ONE pinned identity
     column — for Custom and Licensing (2026-09, at the user's request: "左側の
     セクションは全て位置固定で本文がスクロールされていくイメージで"). The
     page's own name (`title`) stays put the whole time, while a sub-heading
     line beside it tracks whichever body section is currently in view,
     crossfading from one section's to the next ("フェード系にして"). Each
     section's own heading lives inline at the top of its own body.

     Laid out per Figma 3:671 (2026-10 Apres Guerre redesign), the same as
     PageSection.svelte's pinned layout: blue on peach, the title set large
     (Ango Regular, 120px at 1440) pinned to the bottom-left of the screen,
     the body running down the right-hand column from x=584 (28px headings,
     16px/1.4 text). SP stacks title, sub-heading and body and pins nothing.
     Falls back to a plain text swap under prefers-reduced-motion or before
     gsap has loaded (see setSubtitleText's own comment). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import WeightReveal from '$lib/components/WeightReveal.svelte';

	interface StackItem {
		/** Drives the pinned subtitle line while this item's body is the one
		 *  currently in view. */
		subtitle: string;
		body: Snippet;
	}

	interface Props {
		/** The page's own name — pinned, constant, never shuffles. */
		title: string;
		as?: 'h1' | 'h2';
		items: StackItem[];
	}

	let { title, as = 'h1', items }: Props = $props();

	let activeIndex = $state(0);
	let subtitleEl: HTMLElement | undefined = $state();
	let itemEls: HTMLElement[] = [];
	/** Flips once the title's weight sweep lands — the subtitle and body
	 *  fade in after it (2026-09, at the user's request — "wghtアニメーション
	 *  終わってから、本文や小見出しfade-inするようにして"). */
	let revealed = $state(false);

	/** Plain textContent until gsap is ready below — the very first paint
	 *  shows items[0]'s subtitle directly (seeded by the template), so
	 *  there is nothing to animate yet; only a LATER change (the reader
	 *  scrolling to a new section) should ever crossfade. */
	let setSubtitleText: (text: string) => void = (text) => {
		if (subtitleEl) subtitleEl.textContent = text;
	};

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const idx = itemEls.indexOf(entry.target as HTMLElement);
					if (idx !== -1) activeIndex = idx;
				}
			},
			// Counts a section "active" once it has cleared a line a bit
			// below the pinned head, and before the next one arrives —
			// tracks what the reader is actually looking at rather than
			// whatever merely touches the viewport's edge.
			{ rootMargin: '-15% 0px -70% 0px', threshold: 0 }
		);
		itemEls.forEach((el) => el && observer.observe(el));

		let cancelled = false;
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			import('gsap').then(({ gsap }) => {
				if (cancelled) return;
				setSubtitleText = (text) => {
					if (!subtitleEl) return;
					// Plain crossfade: out, swap the text underneath while
					// invisible, back in.
					gsap
						.timeline()
						.to(subtitleEl, { opacity: 0, duration: 0.22, ease: 'power1.in' })
						.call(() => {
							if (subtitleEl) subtitleEl.textContent = text;
						})
						.to(subtitleEl, { opacity: 0.6, duration: 0.32, ease: 'power1.out' });
				};
			});
		}

		return () => {
			cancelled = true;
			observer.disconnect();
		};
	});

	// Fires once immediately on mount (index 0 — skipped, already seeded by
	// the template) and again each time activeIndex actually changes.
	let firstRun = true;
	$effect(() => {
		const text = items[activeIndex]?.subtitle;
		if (text === undefined) return;
		if (firstRun) {
			firstRun = false;
			return;
		}
		setSubtitleText(text);
	});
</script>

<div class="PageStack" class:is-revealed={revealed}>
	<div class="PageStack__head">
		<!-- `to` tracks --brand-weight, which is what this title rests at. -->
		<svelte:element this={as} class="PageStack__title">
			<WeightReveal text={title} to={400} onDone={() => (revealed = true)} />
		</svelte:element>
		<p class="PageStack__subtitle" bind:this={subtitleEl}>{items[0]?.subtitle ?? ''}</p>
	</div>
	<div class="PageStack__body">
		{#each items as item, i (i)}
			<section class="PageStack__item" bind:this={itemEls[i]}>
				{@render item.body()}
			</section>
		{/each}
	</div>
</div>

<style>
	.PageStack {
		--brand-weight: 400;
		/* Bottom gap under the pinned title (11px in the 900px frame). */
		--title-bottom: 11px;
		/* Top: the layout's masthead spacer already clears the Header. */
		padding: 0 var(--padding) 64px;
		font-family: var(--font-ango), sans-serif;
		font-weight: var(--brand-weight);
	}

	.PageStack :global(*) {
		color: var(--color-text);
		font-family: var(--font-ango), sans-serif;
	}

	.PageStack__head {
		display: flex;
		flex-direction: column;
		margin-bottom: 32px;
	}

	.PageStack__title {
		/* 120px at the 1440 design width. */
		font-size: clamp(48px, 8.33vw, 120px);
		line-height: 1.25;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		margin: 0;
	}

	.PageStack__subtitle {
		font-size: 16px;
		line-height: 1.4;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		opacity: 0.6;
		margin: 8px 0 0;
		/* Holds its line while the text crossfades. */
		min-height: 1.4em;
	}

	.PageStack__item {
		/* A <section>: base.css's bare `section { padding-inline: var(--padding) }`
		   would inset every item's content off the column's own edge. */
		padding-inline: 0;
		margin-bottom: 56px;
	}

	.PageStack__item:last-child {
		margin-bottom: 0;
	}

	/* Section headings — 28px in the frame. */
	.PageStack__item :global(h2) {
		font-size: 28px;
		line-height: 1.25;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		margin: 0 0 10px;
	}

	.PageStack__item :global(h3) {
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		margin: 1.75em 0 0.35em;
	}

	.PageStack__item :global(p) {
		font-size: 16px;
		line-height: 1.4;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		margin: 0 0 3px;
	}

	.PageStack__item :global(p:last-child) {
		margin-bottom: 0;
	}

	.PageStack__item :global(a) {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* Held back until the title's weight sweep lands, then faded in (see
	   `revealed`). Keyframe animations rather than an opacity transition, for
	   two reasons: the subtitle's own opacity is driven by GSAP inline styles
	   (its text crossfade) and a CSS transition on opacity would drag every one
	   of those tweens; and a `from`-only keyframe animates to whatever the
	   element's OWN opacity is (0.6 for the subtitle, 1 for the body) instead
	   of overwriting it. `backwards`, not `both`, so neither animation keeps
	   holding the property once it ends — GSAP gets it back.

	   The hold is itself an animation that ends after 5s: it is present from
	   the server-rendered first paint (so there's no flash of content before
	   hydration hides it), but if JS never arrives it releases on its own
	   rather than leaving the page blank. Reduced motion zeroes both in
	   base.css, and WeightReveal reports done immediately there. */
	.PageStack:not(.is-revealed) .PageStack__subtitle,
	.PageStack:not(.is-revealed) .PageStack__body {
		animation: pagestack-hold 5s backwards;
	}

	.PageStack.is-revealed .PageStack__subtitle,
	.PageStack.is-revealed .PageStack__body {
		animation: pagestack-reveal 0.6s ease backwards;
	}

	@keyframes pagestack-hold {
		from {
			opacity: 0;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes pagestack-reveal {
		from {
			opacity: 0;
		}
	}

	@media (min-width: 768px) {
		.PageStack {
			display: grid;
			/* Title column 40 → 584, copy 584 → 1400, at the 1440 width. */
			grid-template-columns: 544fr 816fr;
			align-items: start;
			padding: 0 var(--padding) 120px;
		}

		/* Pinned bottom-left — see PageSection.svelte's .PageSection__head for
		   the mechanism (a full-screen-tall sticky box reaching back up over
		   the masthead spacer, its content pushed to the bottom). */
		.PageStack__head {
			grid-column: 1;
			position: sticky;
			top: 0;
			height: 100vh;
			height: 100svh;
			margin: calc(-1 * var(--masthead-h)) 0 0;
			padding: 0 24px var(--title-bottom) 0;
			justify-content: flex-end;
			/* A long subtitle must not widen this column into the body's. */
			min-width: 0;
			pointer-events: none;
		}

		.PageStack__head > * {
			pointer-events: auto;
		}

		/* Sub-heading above the title, which sits on the baseline. */
		.PageStack__subtitle {
			order: -1;
			margin: 0 0 8px;
		}

		.PageStack__body {
			grid-column: 2;
			min-width: 0;
		}

		.PageStack__item {
			margin-bottom: 40px;
		}
	}
</style>
