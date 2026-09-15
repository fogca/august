<!-- Full-viewport editorial section for the site's own pages — About,
     Custom, Licensing, Contact — per Figma node 3:671 ("ogast", file
     UEy0lKKtgP8jN4x2DWZUOB): a large title on the left (Elio 350, 100px at
     the 1440 design width, left edge at 50), the body copy in a right-hand
     column (from x=599 to the header's own 20px right margin), and a small
     sub-heading pinned to the bottom-left (32px). Per the user's own
     framing of that frame: "大見出しがあって、左下のテキストがそれぞれの
     セクションの小見出し" — a page is a stack of these, one per section.

     Set in Elio: the frame's own type is Elio at weight 350 throughout, and
     Elio is the site's brand typeface (see app.html's --font-en note). Body
     copy is passed as children so each page keeps its own EN/FR/DA
     paragraphs and language toggles. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		/** Small line pinned bottom-left — the section's own sub-heading. */
		subtitle?: string;
		/** First section on a page gets the h1. */
		as?: 'h1' | 'h2';
		id?: string;
		children: Snippet;
	}

	let { title, subtitle, as = 'h2', id, children }: Props = $props();
</script>

<section class="PageSection" {id}>
	<svelte:element this={as} class="PageSection__title">{title}</svelte:element>
	<div class="PageSection__body">
		{@render children()}
	</div>
	{#if subtitle}
		<p class="PageSection__sub">{subtitle}</p>
	{/if}
</section>

<style>
	.PageSection {
		--brand-weight: 350;
		position: relative;
		min-height: 100vh;
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		/* Overrides base.css's global `section { padding-inline: var(--padding) }`
		   — this layout carries its own, Figma-derived insets. */
		padding: calc(96px + env(safe-area-inset-top, 0px)) 20px 40px;
		font-family: var(--font-elio), sans-serif;
		font-weight: var(--brand-weight);
		color: var(--color-text);
	}

	/* base.css sets color/font-family directly on p/h1/h2/a/span, which beats
	   inheriting from the section — assert both on every descendant. */
	.PageSection :global(*) {
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

	.PageSection__body {
		font-size: 14px;
		line-height: 1.5;
		font-weight: var(--brand-weight);
		font-variation-settings: 'wght' var(--brand-weight);
		max-width: 60ch;
	}

	.PageSection__body :global(p) {
		font-size: inherit;
		line-height: inherit;
		font-weight: inherit;
		font-variation-settings: inherit;
		letter-spacing: 0;
		margin: 0 0 1em;
	}

	.PageSection__body :global(p:last-child) {
		margin-bottom: 0;
	}

	.PageSection__body :global(h3) {
		font-size: inherit;
		line-height: inherit;
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
		margin: 1.75em 0 0.35em;
	}

	.PageSection__body :global(h3:first-child) {
		margin-top: 0;
	}

	.PageSection__body :global(a) {
		text-decoration: underline;
		text-underline-offset: 3px;
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

	@media (min-width: 768px) {
		.PageSection {
			display: grid;
			/* 50 -> 599 for the title, 599 -> 1420 for the copy, at the 1440
			   design width; the header's own 20px right margin closes it. */
			grid-template-columns: 549fr 821fr;
			align-content: center;
			padding: calc(64px + env(safe-area-inset-top, 0px)) 20px 96px clamp(24px, 3.47vw, 50px);
		}

		.PageSection__title {
			grid-column: 1;
			margin: 0;
			padding-right: 24px;
		}

		.PageSection__body {
			grid-column: 2;
			font-size: 16px;
			line-height: 1.4;
			/* The frame's copy starts 96px below the title's own top edge. */
			padding-top: clamp(24px, 10.7vh, 96px);
			max-width: none;
		}

		.PageSection__sub {
			position: absolute;
			left: clamp(24px, 3.47vw, 50px);
			bottom: 36px;
			margin: 0;
		}
	}
</style>
