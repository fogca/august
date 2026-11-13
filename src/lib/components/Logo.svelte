<!-- The wordmark at its large, top-of-page size (2026-10 redesign, Figma "II-ii"
     1:635 / 175:178 PC, 7:782 / 7:874 SP): PC sets it on one line, 40px in
     from each side and 35px down; SP stacks the two words, the second
     spanning the width with a 15px margin each side and the first centred
     above it at the same scale.

     Since 2026-11-05 the wordmark is the user's trial name in Maxa Regular,
     black — "Texmex Typefoundry Tokyo" on the first day, "CONTEXT"
     since 2026-11-06 (see $lib/data/wordmark.ts, generated from the font by
     scripts/build_wordmark.py). The words keep the layout's
     old names, `apres` (the first word) and `guerre` (the second): see
     LOGO_WORDS in $lib/data/logo.ts.

     Each word is its own <svg> — a horizontal crop of the one wordmark (its
     dimensions reach the CSS below as the --logo-* custom properties on
     :root) — so the two can be moved independently:
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
	import { LOGO_WORDS } from '$lib/data/logo';
	import { WORDMARK_H, WORDMARK_LETTERS, WORDMARK_TEXT } from '$lib/data/wordmark';

	interface Props {
		/** The two word wrappers (CON, TEXT), for callers that move them. */
		wordEls?: HTMLElement[];
		/** All the letter paths, left to right, for callers that animate them. */
		letterEls?: SVGPathElement[];
	}

	let { wordEls = $bindable([]), letterEls = $bindable([]) }: Props = $props();

	/** Each letter's word of the name (Time, Type, Tokyo — not the two
	 *  crops above, the second of which holds two) and its place in that word,
	 *  in WORDMARK_LETTERS' order (which leaves the spaces out). */
	const LETTER_POS = WORDMARK_TEXT.split(' ').flatMap((text, word) =>
		[...text].map((_, place) => ({ word, place }))
	);
</script>

<span class="Logo" aria-hidden="true">
	{#each LOGO_WORDS as word, w (word.key)}
		<span class="Logo__word Logo__word--{word.key}" bind:this={wordEls[w]}>
			<svg
				viewBox="{word.x0} 0 {word.x1 - word.x0} {WORDMARK_H}"
				preserveAspectRatio="xMinYMin meet"
				xmlns="http://www.w3.org/2000/svg"
			>
				<!-- For callers that stagger: --i is the letter's left-to-right index in
				     the whole name, --w the number of its word and --j its place in it. -->
				{#each WORDMARK_LETTERS.slice(word.from, word.to) as letter, i (i)}
					{@const pos = LETTER_POS[word.from + i]}
					<path
						bind:this={letterEls[word.from + i]}
						d={letter.d}
						style="--i: {word.from + i}; --w: {pos.word}; --j: {pos.place}"
					/>
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

		/* PC: one line, 40px side margins, 35px from the top. The side margin
		   is the page's own inset (base.css --padding: 40px PC, 15px SP), so
		   the rest of the page lines up with the wordmark. */
		--logo-side: var(--padding);
		--logo-top: calc(35px + env(safe-area-inset-top, 0px));
		/* One viewBox unit, in px: the line runs --logo-w units edge to edge. */
		--u: calc((100cqw - 2 * var(--logo-side)) / var(--logo-w));
	}

	/* Each word's box is also published as --word-left / --word-top, so that
	   the Header can work out where the word has to travel to without
	   measuring it (its pre-hydration compact state). */
	.Logo__word {
		--word-top: var(--logo-top);
		position: absolute;
		top: var(--word-top);
		left: var(--word-left);
		display: block;
		height: calc(var(--logo-h) * var(--u));
		/* Callers recolour via --logo-color (the Header follows its own text
		   colour); black otherwise (2026-11-05, with the new name). */
		color: var(--logo-color, var(--black));
		transform-origin: 0 0;
	}

	.Logo__word svg {
		display: block;
		width: 100%;
		height: 100%;
		fill: currentColor;
	}

	/* x ranges from LOGO_WORDS (the --logo-apres-* / --logo-guerre-* vars): the
	   first word and the second. */
	.Logo__word--apres {
		--word-left: var(--logo-side);
		width: calc(var(--logo-apres-w) * var(--u));
	}

	.Logo__word--guerre {
		--word-left: calc(var(--logo-side) + var(--logo-guerre-x) * var(--u));
		width: calc(var(--logo-guerre-w) * var(--u));
	}

	/* SP: the same one line, with its own top margin. (The old two-word name
	   stacked on two lines here; CONTEXT is short enough for one.) */
	@media (max-width: 767.98px) {
		.Logo {
			--logo-top: calc(28px + env(safe-area-inset-top, 0px));
		}
	}
</style>
