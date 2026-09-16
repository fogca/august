<!-- A page built from several body sections that share ONE pinned identity
     column, rather than PageSection.svelte's one-section-per-100vh-viewport
     pattern — for About, Custom and Licensing (2026-09, at the user's
     request: "左側のセクションは全て位置固定で本文がスクロールされていく
     イメージで"). The page's own name (`title`) stays put the whole time —
     it never changes — while a subtitle line beneath it tracks whichever
     body section is currently in view, transitioning between one section's
     subtitle and the next's via a character-scramble animation rather than
     a hard cut ("Bespoke type for corporate identityがHow We Workに
     テキストシャッフルアニメーションする感じ"). Each section's OWN more
     specific heading (e.g. "How We Work") lives inline at the top of its
     own body instead of duplicated in the pinned column — the pinned
     column's job is just "which part of the page am I looking at", the
     inline heading is the part itself.

     The body runs as one continuous, naturally-lengthed scroll — no
     artificial 100vh floor per section — which is the other half of the
     request: these are long-form "other pages", not one-beat-per-viewport
     compositions like the top page's typeface sections.

     Uses gsap's ScrambleTextPlugin (present in this repo's own gsap
     install — a Club GreenSock plugin, not the free core) for the shuffle;
     falls back to a plain text swap under prefers-reduced-motion or before
     the plugin has loaded (the very first paint needs no animation at all —
     see setSubtitleText's own comment). -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

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

	/** Plain textContent until the scramble plugin is ready below — the very
	 *  first paint shows items[0]'s subtitle directly (seeded by the
	 *  template), so there is nothing to animate yet; only a LATER change
	 *  (the reader scrolling to a new section) should ever scramble. */
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
			Promise.all([import('gsap'), import('gsap/ScrambleTextPlugin')]).then(
				([{ gsap }, { ScrambleTextPlugin }]) => {
					if (cancelled) return;
					gsap.registerPlugin(ScrambleTextPlugin);
					setSubtitleText = (text) => {
						if (!subtitleEl) return;
						gsap.to(subtitleEl, {
							duration: 0.7,
							ease: 'none',
							scrambleText: { text, chars: 'upperAndLowerCase', speed: 0.4, revealDelay: 0.15 }
						});
					};
				}
			);
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
		<svelte:element this={as} class="PageStack__title">{title}</svelte:element>
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
		   owns that clearance itself now, as its own padding-top, so its
		   opaque background covers the SAME region while sticky. See that
		   rule's own comment for why. */
		padding: 0 20px 96px;
		font-family: var(--font-elio), sans-serif;
		font-weight: var(--brand-weight);
	}

	.PageStack :global(*) {
		color: var(--color-text);
		font-family: var(--font-elio), sans-serif;
	}

	/* Sticky on every breakpoint (unlike PageSection's `flow`, which only
	   pins on desktop) — the user asked for the identity column to stay put
	   full stop, phones included.

	   Mobile bug this fixes: sticking at `top: 64px` (a plain visual offset)
	   left the band from y=0 to y=64 uncovered by anything opaque — the
	   real fixed Header is deliberately transparent everywhere on this site
	   (mix-blend-mode:difference, see Header.svelte), so whatever body text
	   the page had ALSO scrolled to that exact band showed straight through
	   it, overlapping this head's own title (confirmed live: a "What You
	   Get" heading rendering at y=34, above this head's y=64 top edge).
	   Fix: `top: 0` plus this element's OWN padding-top for the clearance,
	   so its opaque background (matching the page's own — white, currently
	   every page that uses this component) is what covers y=0 down to where
	   the title visually starts, not a gap before an offset that only the text
	   itself respected. (.PageStack's own top padding moved here to match —
	   see that rule's comment — so the unstuck, top-of-page position is
	   unchanged.) Desktop doesn't need this: the head sits in its own grid
	   column there, never sharing horizontal space with the scrolling body
	   column, so nothing can render "above" it in the first place. */
	.PageStack__head {
		position: sticky;
		top: 0;
		z-index: 2;
		background: #ffffff;
		padding-top: calc(96px + env(safe-area-inset-top, 0px));
		padding-bottom: 24px;
		margin-bottom: 24px;
	}

	.PageStack__title {
		font-size: clamp(32px, 9vw, 100px);
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
		margin: 0 0 20px;
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
		margin: 0 0 1em;
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
			padding: calc(64px + env(safe-area-inset-top, 0px)) 20px 96px clamp(24px, 3.47vw, 50px);
		}

		.PageStack__head {
			grid-column: 1;
			/* Desktop gets its top clearance from .PageStack's own padding-top
			   above instead (the mobile-only fix's padding-top would double up
			   with it otherwise) — see .PageStack__head's base rule comment. */
			padding-top: 0;
			padding-right: 24px;
			padding-bottom: 0;
			margin-bottom: 0;
			background: transparent;
			align-self: start;
		}

		.PageStack__body {
			grid-column: 2;
			padding-top: clamp(24px, 10.7vh, 96px);
		}

		.PageStack__title {
			font-size: clamp(56px, 6.94vw, 100px);
			line-height: 1.25;
		}

		.PageStack__subtitle {
			font-size: clamp(22px, 2.22vw, 32px);
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
