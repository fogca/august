<!-- Full-viewport editorial section for the site's own pages — About,
     Custom, Licensing, Contact, the legal pages, Fonts and Buy — per Figma
     node 3:671 ("ogast", file UEy0lKKtgP8jN4x2DWZUOB): a large title on the
     left (Elio 350, 100px at the 1440 design width, left edge at 50), the
     body copy in a right-hand column (from x=599 to the header's own 20px
     right margin), and a small sub-heading (32px). Per the user's own
     framing of that frame: "大見出しがあって、左下のテキストがそれぞれの
     セクションの小見出し" — a page is a stack of these, one per section.

     Three layouts:
     - default: one viewport, vertically centred, sub-heading pinned to the
       bottom-left (the frame as drawn).
     - `flow`: long-form — the title and sub-heading stay put (sticky) in the
       left column while the body runs on down the right one, as long as it
       needs to. For the legal pages ("本文はそのままスクロールで続けて良い").
     - `full`: long-form with the body running the full width BELOW the
       title row (an optional `intro` snippet sits beside the title), for
       layouts with their own internal grid — the catalogue, the checkout.

     Set in Elio: the frame's own type is Elio at weight 350 throughout, and
     Elio is the site's brand typeface (see app.html's --font-en note). Pass
     `nativeBody` to leave the body entirely alone — its own components keep
     their fonts and colours (the checkout keeps Norma for prices, since
     Elio's currency glyphs aren't finished; the catalogue's cards set their
     specimens in each typeface's own face). Body copy is passed as children
     so each page keeps its own EN/FR/DA paragraphs and language toggles.

     --ps-inset-left/right are exposed so a body can bleed to the section's
     edges (the catalogue's hairline grid) without repeating these values. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import WeightReveal from '$lib/components/WeightReveal.svelte';

	interface Props {
		title: string;
		/** Small line — bottom-left in the default layout, under the title in
		 *  the long-form ones. The section's own sub-heading. */
		subtitle?: string;
		/** First section on a page gets the h1. */
		as?: 'h1' | 'h2';
		id?: string;
		/** Long-form: no vertical centring; title/sub-heading stick while the
		 *  body scrolls on in the right column. */
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
		flow = false,
		full = false,
		nativeBody = false,
		head,
		intro,
		children
	}: Props = $props();

	const isFlow = $derived(flow || full);
</script>

<section class="PageSection" class:is-flow={isFlow} class:is-full={full} {id}>
	<div class="PageSection__head">
		<!-- `to` tracks --brand-weight, which is what this title rests at. -->
		<svelte:element this={as} class="PageSection__title">
			<WeightReveal text={title} to={350} />
		</svelte:element>
		{#if subtitle && isFlow}
			<p class="PageSection__sub PageSection__sub--inline">{subtitle}</p>
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
	{#if subtitle && !isFlow}
		<p class="PageSection__sub">{subtitle}</p>
	{/if}
</section>

<style>
	.PageSection {
		--brand-weight: 350;
		--ps-inset-left: 20px;
		--ps-inset-right: 20px;
		position: relative;
		min-height: 100vh;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		/* Overrides base.css's global `section { padding-inline: var(--padding) }`
		   — this layout carries its own, Figma-derived insets. */
		padding: calc(96px + env(safe-area-inset-top, 0px)) var(--ps-inset-right) 40px
			var(--ps-inset-left);
		font-family: var(--font-elio), sans-serif;
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
		font-family: var(--font-elio), sans-serif;
	}

	.PageSection__title {
		font-size: clamp(56px, 6.94vw, 100px);
		line-height: 1.25;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		margin: 0 0 32px;
		overflow-wrap: anywhere;
	}

	.PageSection__body,
	.PageSection__intro {
		font-size: 14px;
		line-height: 1.5;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		max-width: 60ch;
	}

	.PageSection__body.is-native {
		max-width: none;
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

	.PageSection__body:not(.is-native) :global(h3) {
		font-size: inherit;
		line-height: inherit;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
		margin: 1.75em 0 0.35em;
	}

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

	/* Mobile: flex child pushed to the bottom of the 100svh section by
	   margin-top:auto (PC pins it absolutely, below). */
	.PageSection__sub {
		font-size: clamp(22px, 2.22vw, 32px);
		line-height: 1.25;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		letter-spacing: 0;
		margin: auto 0 0;
		padding-top: 48px;
	}

	/* Long-form: the sub-heading sits right under the title instead. */
	.PageSection__sub--inline {
		margin: -12px 0 32px;
		padding-top: 0;
		opacity: 0.6;
	}

	.PageSection__head-extra {
		margin-bottom: 32px;
	}

	@media (min-width: 768px) {
		.PageSection {
			--ps-inset-left: clamp(24px, 3.47vw, 50px);
			display: grid;
			/* 50 -> 599 for the title, 599 -> 1420 for the copy, at the 1440
			   design width; the header's own 20px right margin closes it. */
			grid-template-columns: 549fr 821fr;
			align-content: center;
			padding: calc(64px + env(safe-area-inset-top, 0px)) var(--ps-inset-right) 96px
				var(--ps-inset-left);
		}

		.PageSection__head {
			grid-column: 1;
			padding-right: 24px;
		}

		.PageSection__title {
			margin: 0;
		}

		.PageSection__body,
		.PageSection__intro {
			grid-column: 2;
			font-size: 16px;
			line-height: 1.4;
			/* The frame's copy starts 96px below the title's own top edge. */
			padding-top: clamp(24px, 10.7vh, 96px);
			max-width: none;
		}

		.PageSection__sub {
			position: absolute;
			left: var(--ps-inset-left);
			bottom: 36px;
			margin: 0;
			padding-top: 0;
		}

		.PageSection__sub--inline {
			position: static;
			margin: 20px 0 0;
		}

		.PageSection__head-extra {
			margin: 40px 0 0;
		}

		/* ── flow: title/sub-heading stay put while the body scrolls on ── */
		.PageSection.is-flow {
			align-content: start;
			padding-top: calc(96px + env(safe-area-inset-top, 0px));
		}

		.PageSection.is-flow .PageSection__head {
			position: sticky;
			top: calc(96px + env(safe-area-inset-top, 0px));
			align-self: start;
		}

		/* ── full: title row, then the body across both columns ── */
		.PageSection.is-full {
			grid-template-rows: auto 1fr;
		}

		.PageSection.is-full .PageSection__head {
			position: static;
			grid-row: 1;
		}

		.PageSection.is-full .PageSection__intro {
			grid-row: 1;
			margin-bottom: 0;
		}

		.PageSection.is-full .PageSection__body {
			grid-column: 1 / -1;
			grid-row: 2;
			padding-top: 0;
			margin-top: clamp(48px, 8vh, 96px);
		}
	}
</style>
