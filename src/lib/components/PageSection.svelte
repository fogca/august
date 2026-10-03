<!-- Editorial page shell for the site's own pages — Contact, the legal
     pages, Fonts and Buy — per Figma 3:671 (file UEy0lKKtgP8jN4x2DWZUOB, the
     2026-10 Apres Guerre redesign): blue on peach, the page title set large
     (Ango Regular, 120px at the 1440 width) and pinned to the bottom-left of
     the screen, the copy running down a right-hand column from x=584 (28px
     headings, 16px/1.4 text).

     Two layouts:
     - default (`flow` is accepted and means the same): the title, any
       sub-heading and the `head` snippet stay pinned bottom-left while the
       body scrolls on in the right column, as long as it needs to.
     - `full`: the title row sits at the top (an optional `intro` snippet
       beside it) and the body runs the full width below — for layouts with
       their own internal grid, the catalogue and the checkout.

     The page's top clears the Header's large wordmark through the layout's
     own masthead spacer (base.css --masthead-h); the pinned column reaches
     back up over that spacer so its bottom edge lines up with the screen's.

     Pass `nativeBody` to leave the body entirely alone — its own components
     keep their fonts and colours (the checkout keeps Norma for prices, since
     Ango's currency glyphs aren't finished; the catalogue's cards set their
     specimens in each typeface's own face). Body copy is passed as children
     so each page keeps its own EN/FR paragraphs and language toggles.

     --ps-inset-left/right are exposed so a body can bleed to the section's
     edges (the catalogue's hairline grid) without repeating these values. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import WeightReveal from '$lib/components/WeightReveal.svelte';

	interface Props {
		title: string;
		/** Small line beside the title — the section's own sub-heading. */
		subtitle?: string;
		/** First section on a page gets the h1. */
		as?: 'h1' | 'h2';
		id?: string;
		/** Accepted for compatibility: every non-`full` section is long-form
		 *  now (title pinned, body scrolling on). */
		flow?: boolean;
		/** Long-form with the body spanning full width below the title row.
		 *  Implies `flow`. */
		full?: boolean;
		/** Don't force the brand font/colour onto the body (its own components
		 *  keep theirs). */
		nativeBody?: boolean;
		/** Extra content under the title/sub-heading (e.g. a section nav). */
		head?: Snippet;
		/** Copy beside the title in the `full` layout; the body runs below. */
		intro?: Snippet;
		children: Snippet;
	}

	let {
		title,
		subtitle,
		as = 'h2',
		id,
		full = false,
		nativeBody = false,
		head,
		intro,
		children
	}: Props = $props();

	/** Flips once the title's weight sweep lands — everything but the title
	 *  fades in after it (2026-09, at the user's request — "wghtアニメーション
	 *  終わってから、本文や小見出しfade-inするようにして"). */
	let revealed = $state(false);
</script>

<section class="PageSection" class:is-full={full} class:is-revealed={revealed} {id}>
	<!-- DOM order title → sub-heading → extra, for reading order; the pinned
	     PC layout stacks them the other way up (see .PageSection__head). -->
	<div class="PageSection__head">
		<!-- `to` tracks --brand-weight, which is what this title rests at. -->
		<svelte:element this={as} class="PageSection__title">
			<WeightReveal text={title} to={400} onDone={() => (revealed = true)} />
		</svelte:element>
		{#if subtitle}
			<p class="PageSection__sub">{subtitle}</p>
		{/if}
		{#if head}
			<div class="PageSection__head-extra">{@render head()}</div>
		{/if}
	</div>
	{#if intro}
		<div class="PageSection__intro">{@render intro()}</div>
	{/if}
	<div class="PageSection__body" class:is-native={nativeBody}>
		{@render children()}
	</div>
</section>

<style>
	.PageSection {
		--brand-weight: 400;
		/* The page's side inset — the wordmark's own margin (base.css --padding). */
		--ps-inset-left: var(--padding);
		--ps-inset-right: var(--padding);
		/* Bottom gap under the pinned title (11px in the 900px frame). */
		--ps-title-bottom: 11px;
		position: relative;
		display: flex;
		flex-direction: column;
		/* Overrides base.css's global `section { padding-inline: var(--padding) }`
		   — this layout carries its own, Figma-derived insets. Top: the
		   layout's masthead spacer already clears the Header. */
		padding: 0 var(--ps-inset-right) 64px var(--ps-inset-left);
		font-family: var(--font-ango), sans-serif;
		font-weight: var(--brand-weight);
		color: var(--color-text);
	}

	/* base.css sets color/font-family directly on p/h1/h2/a/span, which beats
	   inheriting from the section — assert both on every descendant of the
	   parts this component owns. A `nativeBody` is left alone entirely. */
	.PageSection__head :global(*),
	.PageSection__intro :global(*),
	.PageSection__body:not(.is-native) :global(*) {
		color: var(--color-text);
		font-family: var(--font-ango), sans-serif;
	}

	.PageSection__head {
		display: flex;
		flex-direction: column;
		margin-bottom: 32px;
	}

	.PageSection__title {
		/* 120px at the 1440 design width. */
		font-size: clamp(48px, 8.33vw, 120px);
		line-height: 1.25;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		margin: 0;
		overflow-wrap: anywhere;
	}

	.PageSection__sub {
		font-size: 16px;
		line-height: 1.4;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		opacity: 0.6;
		margin: 8px 0 0;
	}

	.PageSection__head-extra {
		margin-top: 24px;
	}

	.PageSection__body,
	.PageSection__intro {
		font-size: 16px;
		line-height: 1.4;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
	}

	.PageSection__body:not(.is-native) :global(p),
	.PageSection__intro :global(p) {
		font-size: inherit;
		line-height: inherit;
		font-weight: inherit;
		font-variation-settings: inherit;
		letter-spacing: 0;
		margin: 0 0 1em;
	}

	.PageSection__body:not(.is-native) :global(p:last-child),
	.PageSection__intro :global(p:last-child) {
		margin-bottom: 0;
	}

	/* Section headings — 28px in the frame. */
	.PageSection__body:not(.is-native) :global(h2) {
		font-size: 28px;
		line-height: 1.25;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		margin: 2em 0 10px;
	}

	.PageSection__body:not(.is-native) :global(h3) {
		font-size: inherit;
		line-height: inherit;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
		margin: 1.75em 0 0.35em;
	}

	.PageSection__body:not(.is-native) :global(h2:first-child),
	.PageSection__body:not(.is-native) :global(h3:first-child) {
		margin-top: 0;
	}

	.PageSection__body:not(.is-native) :global(a),
	.PageSection__intro :global(a) {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.PageSection__intro {
		margin-bottom: 40px;
	}

	/* Everything but the title is held back until the title's weight sweep
	   lands, then faded in (see `revealed`). Same mechanism as PageStack's —
	   see its own note for the reasoning: a `from`-only keyframe animates to
	   each element's OWN opacity (the subtitle rests at 0.6) rather than
	   overwriting it; `backwards` so it stops holding the property once it
	   ends; and the hold is itself a 5s animation, present from the
	   server-rendered first paint but self-releasing if JS never arrives. */
	.PageSection:not(.is-revealed) .PageSection__sub,
	.PageSection:not(.is-revealed) .PageSection__head-extra,
	.PageSection:not(.is-revealed) .PageSection__intro,
	.PageSection:not(.is-revealed) .PageSection__body {
		animation: pagesection-hold 5s backwards;
	}

	.PageSection.is-revealed .PageSection__sub,
	.PageSection.is-revealed .PageSection__head-extra,
	.PageSection.is-revealed .PageSection__intro,
	.PageSection.is-revealed .PageSection__body {
		animation: pagesection-reveal 0.6s ease backwards;
	}

	@keyframes pagesection-hold {
		from {
			opacity: 0;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes pagesection-reveal {
		from {
			opacity: 0;
		}
	}

	@media (min-width: 768px) {
		.PageSection {
			display: grid;
			/* Title column 40 → 584, copy 584 → 1400, at the 1440 width. */
			grid-template-columns: 544fr 816fr;
			grid-template-rows: auto 1fr;
			align-items: start;
			padding-bottom: 120px;
		}

		/* Pinned bottom-left: a full-screen-tall sticky box with its content
		   pushed to the bottom. It reaches back up over the masthead spacer
		   (negative margin), so its box starts at the top of the document
		   and its bottom edge — the title's baseline area — sits on the
		   screen's bottom from the very first frame. */
		.PageSection__head {
			grid-column: 1;
			grid-row: 1 / -1;
			position: sticky;
			top: 0;
			height: 100vh;
			height: 100svh;
			margin: calc(-1 * var(--masthead-h)) 0 0;
			padding: 0 24px var(--ps-title-bottom) 0;
			justify-content: flex-end;
			/* Transparent box over the masthead's own area — never in the way
			   of the page beneath (the Header sits above it anyway). */
			pointer-events: none;
		}

		.PageSection__head > * {
			pointer-events: auto;
		}

		/* Bottom up: extra, sub-heading, then the title on the baseline. */
		.PageSection__head-extra {
			order: 0;
			margin: 0 0 24px;
		}

		.PageSection__sub {
			order: 1;
			margin: 0 0 8px;
		}

		.PageSection__title {
			order: 2;
		}

		.PageSection__body,
		.PageSection__intro {
			grid-column: 2;
			min-width: 0;
		}

		.PageSection__intro {
			grid-row: 1;
		}

		.PageSection__body {
			grid-row: 2;
		}

		/* ── full: title row on top, then the body across both columns ── */
		.PageSection.is-full .PageSection__head {
			grid-row: 1;
			position: static;
			height: auto;
			margin: 0;
			padding-bottom: 0;
			justify-content: flex-start;
		}

		.PageSection.is-full .PageSection__title {
			order: 0;
		}

		.PageSection.is-full .PageSection__sub {
			order: 1;
			margin: 8px 0 0;
		}

		.PageSection.is-full .PageSection__head-extra {
			order: 2;
			margin: 24px 0 0;
		}

		.PageSection.is-full .PageSection__intro {
			align-self: end;
			margin-bottom: 0;
		}

		.PageSection.is-full .PageSection__body {
			grid-column: 1 / -1;
			grid-row: 2;
			margin-top: clamp(48px, 8vh, 96px);
		}
	}
</style>
