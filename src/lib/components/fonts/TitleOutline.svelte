<!-- A typeface page's big name, drawn as it opens (2026-11-20, at the user's
     request, after nguyengobber.com/typefaces/sticks — "path animationから始め
     て欲しい"): every contour of every letter is traced as a thin line, all at
     once (no stagger — "staggerはなくていいよ", 2026-11-21), and then the
     letters fill in and the lines fade out.

     The outlines come from $lib/data/titlePaths.ts (scripts/build_title_paths.py);
     the viewBox is the name's ink box, so the SVG is exactly as wide as its
     parent, ink to ink. A letter has two kinds of path: one `fill` with every
     contour (a counter must stay open, so the fill can't be split) and one
     `line` per contour, each with pathLength 1 so one dash-offset animation
     traces any of them. Pure CSS: it runs from the server-rendered markup, and
     with reduced motion — or if animations never run — the name is simply
     there, filled.

     The line's width is 1.5px on screen whatever the size: the SVG's scale is
     measured and the width in viewBox units follows. -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { TitlePath } from '$lib/data/titlePaths';

	let { path }: { path: TitlePath } = $props();

	const LINE_PX = 1.5;
	// Until the SVG is measured: about 1.5px at a 1300px-wide name.
	const guess = $derived(Math.round(path.width * 0.00115 * 100) / 100);
	let measured = $state<number | null>(null);
	const lineWidth = $derived(measured ?? guess);

	let svg: SVGSVGElement;

	onMount(() => {
		const measure = () => {
			const px = svg.getBoundingClientRect().width;
			if (px > 0) measured = Math.round(((LINE_PX * path.width) / px) * 100) / 100;
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(svg);
		return () => observer.disconnect();
	});
</script>

<svg
	bind:this={svg}
	class="TitleOutline"
	viewBox="0 0 {path.width} {path.height}"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	style="--sw: {lineWidth}"
>
	{#each path.letters as letter, i (i)}
		<g>
			<path class="TitleOutline__fill" d={letter.d} />
			{#each letter.contours as contour, k (k)}
				<path class="TitleOutline__line" d={contour} pathLength="1" />
			{/each}
		</g>
	{/each}
</svg>

<style>
	/* Timeline: every line draws for DRAW seconds from 0; the fill comes in
	   once the strokes are round; the lines fade as the fill arrives. */
	.TitleOutline {
		--draw: 1.2s;
		--fill-at: 1s;

		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		fill: currentColor;
	}

	.TitleOutline__fill {
		fill: currentColor;
		animation: title-fill 0.45s ease-out var(--fill-at) both;
	}

	.TitleOutline__line {
		fill: none;
		stroke: currentColor;
		stroke-width: calc(var(--sw) * 1px);
		stroke-linejoin: round;
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation:
			title-draw var(--draw) cubic-bezier(0.65, 0, 0.35, 1) both,
			title-line-out 0.4s ease-out calc(var(--fill-at) + 0.25s) both;
	}

	@keyframes title-draw {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes title-fill {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes title-line-out {
		from {
			stroke-opacity: 1;
		}
		to {
			stroke-opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.TitleOutline__fill {
			animation: none;
		}

		.TitleOutline__line {
			display: none;
		}
	}
</style>
