<!-- A page built from several body sections that share ONE pinned identity
     column, rather than PageSection.svelte's one-section-per-100vh-viewport
     pattern — for About, Custom and Licensing (2026-09, at the user's
     request: "左側のセクションは全て位置固定で本文がスクロールされていく
     イメージで"). The page's own name (`title`) stays put the whole time —
     it never changes — while a subtitle line beneath it tracks whichever
     body section is currently in view, transitioning between one section's
     subtitle and the next's with a plain crossfade (a character-scramble
     effect was tried first, at the user's own request, then dropped the
     same way — "フェード系にして"). Each section's OWN more specific
     heading (e.g. "How We Work") lives inline at the top of its own body
     instead of duplicated in the pinned column — the pinned column's job
     is just "which part of the page am I looking at", the inline heading
     is the part itself.

     The body runs as one continuous, naturally-lengthed scroll — no
     artificial 100vh floor per section — which is the other half of the
     request: these are long-form "other pages", not one-beat-per-viewport
     compositions like the top page's typeface sections.

     Desktop pins the identity column sticky AND vertically centred in the
     viewport, matching Figma 3:671's own default (centred) composition —
     see .PageStack__head's desktop rule for how (a plain `position:sticky`
     only pins to an EDGE, it has no native "stay centred" mode). Falls
     back to a plain text swap under prefers-reduced-motion or before gsap
     has loaded (the very first paint needs no animation at all — see
     setSubtitleText's own comment). -->
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

<div class="PageStack">
	<div class="PageStack__head">
		<!-- `to` tracks --brand-weight, which is what this title rests at. -->
		<svelte:element this={as} class="PageStack__title">
			<WeightReveal text={title} to={350} />
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
		--brand-weight: 350;
		/* No top padding here on mobile (unlike PageSection) — .PageStack__head
		   owns that clearance itself now, as its own padding-top, matching the
		   page's own left/right inset. See that rule's own comment for why. */
		padding: 0 20px 96px;
		font-family: var(--font-elio), sans-serif;
		font-weight: var(--brand-weight);
	}

	.PageStack :global(*) {
		color: var(--color-text);
		font-family: var(--font-elio), sans-serif;
	}

	/* Static on mobile (2026-09, at the user's request — "SPでは固定不要でそ
	   の背景白で本文が見える面積が減ってる"): a stuck white head was eating
	   into the small amount of screen a phone has for the body text, so it
	   just scrolls away with everything else there now. Desktop keeps the
	   sticky column — see that breakpoint's own rule for the mechanism (and
	   for why THIS clearance padding still applies at every size: the real
	   fixed Header is deliberately transparent everywhere on this site,
	   mix-blend-mode:difference, so page content has to clear it with its own
	   opaque space rather than the header pushing anything down itself —
	   confirmed live: a "What You Get" heading once rendered at y=34,
	   overlapping this head's own title). */
	.PageStack__head {
		background: #ffffff;
		padding-top: calc(96px + env(safe-area-inset-top, 0px));
		padding-bottom: 24px;
		margin-bottom: 24px;
	}

	.PageStack__title {
		font-size: clamp(36px, 11vw, 120px);
		line-height: 1.1;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		margin: 0;
	}

	.PageStack__subtitle {
		font-size: clamp(15px, 3.4vw, 32px);
		line-height: 1.25;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		opacity: 0.6;
		margin: 8px 0 0;
		/* The scramble plugin swaps in random characters mid-transition —
		   tabular-nums-style monospacing would look calmer, but this is
		   proportional running text, so just guard against the line
		   reflowing/jumping height as characters cycle. */
		min-height: 1.25em;
	}

	.PageStack__item {
		/* This is a <section>, and base.css still carries a bare
		   `section { padding-inline: var(--padding) }` — left alone it insets
		   every item's own content ~20px further right than .PageStack__title
		   (a plain element, not a section), which is exactly the misalignment
		   the user flagged (2026-09, "タイトルと本文でpadding inlineなのか
		   左がズレてる"). Same recurring gotcha documented elsewhere in this
		   codebase (Footer.svelte's own history). */
		padding-inline: 0;
		margin-bottom: 56px;
		max-width: 68ch;
	}

	.PageStack__item:last-child {
		margin-bottom: 0;
	}

	.PageStack__item :global(h2) {
		font-size: clamp(24px, 3.2vw, 36px);
		line-height: 1.2;
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
		font-size: 14px;
		line-height: 1.5;
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

	@media (min-width: 768px) {
		.PageStack {
			display: grid;
			grid-template-columns: 549fr 821fr;
			align-items: start;
			/* No top padding here any more (2026-09) — it used to be what made
			   the head "settle" into its stuck position only after ~80px of
			   scroll (a real, if slight, gap the user flagged: "固定される
			   まで僅かにギャップがある...最初から所定の位置にて固定されて
			   いて欲しい"). The head now carries its own clearance directly
			   (below), so its natural position already equals its stuck
			   position — nothing to settle into, it just reads as fixed from
			   the very first frame. The body regains the lost offset on its
			   own padding-top instead. */
			padding: 0 20px 96px clamp(24px, 3.47vw, 50px);
		}

		.PageStack__head {
			grid-column: 1;
			/* Own clearance now, not inherited from .PageStack's padding — see
			   that rule's comment on why removing the shared offset is what
			   kills the pre-stick gap. 100px and top-aligned (2026-09, the
			   user's own values) — was vertically centred in the viewport. */
			padding-top: 100px;
			padding-right: 24px;
			padding-bottom: 0;
			margin-bottom: 0;
			background: transparent;
			align-self: start;
			/* The sticky box keeps the viewport's own height, so the title stays
			   pinned at this padding from the top for as long as it's stuck. */
			position: sticky;
			top: 0;
			min-height: 100vh;
			min-height: 100svh;
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			/* Grid items default to a content-based minimum width, which lets
			   a long subtitle push this column wider than its 549fr share and
			   squeeze the body column beside it (observed live: the body's
			   own width visibly narrowed on a longer subtitle) — this opts
			   out, deferring entirely to the grid track's own fr sizing. */
			min-width: 0;
		}

		.PageStack__body {
			grid-column: 2;
			padding-top: calc(64px + env(safe-area-inset-top, 0px) + clamp(24px, 10.7vh, 96px));
			min-width: 0;
		}

		.PageStack__title {
			font-size: clamp(64px, 8vw, 140px);
			line-height: 1.25;
			/* Optical alignment (the user's own value): at this size the first
			   letter's left sidebearing reads as an indent against the
			   subtitle and body edge below it. */
			margin-left: -7.5px;
		}

		.PageStack__subtitle {
			font-size: 24px;
		}

		.PageStack__item {
			max-width: none;
			margin-bottom: 96px;
		}

		.PageStack__item :global(p) {
			font-size: 16px;
			line-height: 1.4;
		}
	}
</style>
