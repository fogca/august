<!-- The Apres Guerre wordmark at its large, top-of-page size (2026-10
     redesign, Figma "II-ii" 1:635 / 175:178 PC, 7:782 / 7:874 SP): PC sets it
     on one line, 40px in from each side and 35px down; SP stacks the two
     words, GUERRE spanning the width with a 6.33% margin each side and APRES
     centred above it at the same scale.

     Each word is its own <svg> — a horizontal crop of the one 1360x156
     artwork (see $lib/data/logo.ts) — so the two can be moved independently:
     the Header shrinks them into its compact one-line lockup, which on SP
     means pulling the stacked words back onto one line.

     Positioned absolutely against the nearest positioned ancestor, which must
     span the viewport's width from its top-left corner (the fixed Header, the
     home page's opening overlay). Both render this same component, so the
     two marks land on exactly the same pixels — the opening hands over to
     the Header without a visible seam. Sizes use container units against
     this element (itself the full width of that ancestor) rather than vw, so
     a classic scrollbar can't push the right edge out of line. -->
<script lang="ts">
	import { LOGO_LETTERS, LOGO_WORDS, LOGO_VIEWBOX_H } from '$lib/data/logo';

	interface Props {
		/** The two word wrappers (APRES, GUERRE), for callers that move them. */
		wordEls?: HTMLElement[];
		/** All eleven letter paths, left to right, for callers that animate them. */
		letterEls?: SVGPathElement[];
	}

	let { wordEls = $bindable([]), letterEls = $bindable([]) }: Props = $props();
</script>

<span class="Logo" aria-hidden="true">
	{#each LOGO_WORDS as word, w (word.word)}
		<span class="Logo__word Logo__word--{word.word.toLowerCase()}" bind:this={wordEls[w]}>
			<svg
				viewBox="{word.x0} 0 {word.x1 - word.x0} {LOGO_VIEWBOX_H}"
				preserveAspectRatio="xMinYMin meet"
				xmlns="http://www.w3.org/2000/svg"
			>
				<!-- --i: the letter's left-to-right index, for callers that stagger. -->
				{#each LOGO_LETTERS.slice(word.from, word.to) as letter, i (i)}
					<path bind:this={letterEls[word.from + i]} d={letter.d} style="--i: {word.from + i}" />
				{/each}
			</svg>
		</span>
	{/each}
</span>

<style>
	.Logo {
		/* Static on purpose: the words resolve their absolute positions
		   against the caller's own positioned box, while this element only
		   supplies the container that the cqw units below measure. */
		display: block;
		width: 100%;
		container-type: inline-size;

		/* PC: one line, 40px side margins, 35px from the top. */
		--logo-side: 40px;
		--logo-top: calc(35px + env(safe-area-inset-top, 0px));
		/* One viewBox unit, in px: the line runs 1360 units edge to edge. */
		--u: calc((100cqw - 2 * var(--logo-side)) / 1360);
	}

	.Logo__word {
		position: absolute;
		top: var(--logo-top);
		display: block;
		height: calc(156 * var(--u));
		color: var(--brand-blue);
		transform-origin: 0 0;
	}

	.Logo__word svg {
		display: block;
		width: 100%;
		height: 100%;
		fill: currentColor;
	}

	/* x ranges from LOGO_WORDS (0–564.78, 612.92–1360). */
	.Logo__word--apres {
		left: var(--logo-side);
		width: calc(564.78 * var(--u));
	}

	.Logo__word--guerre {
		left: calc(var(--logo-side) + 612.92 * var(--u));
		width: calc(747.08 * var(--u));
	}

	/* SP: two lines. GUERRE (747.08 units) spans the width inside a 6.33%
	   margin; APRES (564.78) centred above it; 29.4 units between the lines.
	   All measured off Figma 7:782 at its 395px frame width. */
	@media (max-width: 767.98px) {
		.Logo {
			--logo-side: 6.33cqw;
			--logo-top: calc(28px + env(safe-area-inset-top, 0px));
			--u: calc((100cqw - 2 * var(--logo-side)) / 747.08);
		}

		.Logo__word--apres {
			left: calc(var(--logo-side) + (747.08 - 564.78) / 2 * var(--u));
		}

		.Logo__word--guerre {
			left: var(--logo-side);
			top: calc(var(--logo-top) + (156 + 29.4) * var(--u));
		}
	}
</style>
