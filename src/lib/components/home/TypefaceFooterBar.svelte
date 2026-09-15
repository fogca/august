<!-- Mobile-only persistent footer bar for the Home page's typeface sections
     (Figma 7:887/7:906's own per-section footer bar, per the user's
     instruction: "これは固定のイメージで、それぞれにあるってよりかはそれは
     変わらず、中身や色だけ変わる" — one fixed bar, not one per section; only
     its content and colour switch). Rendered once in +page.svelte, sitting
     outside every TypefaceSection; reads which typeface is currently
     centred in the viewport from activeTypeface.svelte.ts, which each
     TypefaceSection reports itself into via its own IntersectionObserver. -->
<script lang="ts">
	import { activeTypeface } from '$lib/state/activeTypeface.svelte';
	import Arrow from '$lib/components/Arrow.svelte';

	const tf = $derived(activeTypeface.current);
	const hs = $derived(tf?.homeSection);
</script>

{#if tf && hs}
	<a
		class="TypefaceFooterBar"
		class:is-visible={activeTypeface.visible}
		href="/fonts/{tf.slug}"
		style="--panel-bg: {hs.panelBg}; --panel-fg: {hs.panelFg};"
	>
		<div class="TypefaceFooterBar__text">
			<p class="TypefaceFooterBar__name">{tf.name} Ôgast</p>
			<p class="TypefaceFooterBar__tagline">{tf.tagline}</p>
		</div>
		<div class="TypefaceFooterBar__cta">
			<Arrow size={11} />
		</div>
	</a>
{/if}

<style>
	.TypefaceFooterBar {
		display: none;
	}

	@media (max-width: 767.98px) {
		.TypefaceFooterBar {
			display: flex;
			align-items: stretch;
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 50;
			height: 58px;
			text-decoration: none;
			transform: translateY(100%);
			transition: transform 0.3s ease;
		}

		.TypefaceFooterBar.is-visible {
			transform: translateY(0);
		}

		.TypefaceFooterBar__text {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			gap: 1px;
			padding-left: 15px;
			min-width: 0;
			background: #f1f0ef;
		}

		.TypefaceFooterBar__name {
			font-family: 'Norma', sans-serif;
			font-size: 16px;
			line-height: 1.25;
			color: #000000;
			margin: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.TypefaceFooterBar__tagline {
			font-family: 'Norma', sans-serif;
			font-size: 10px;
			line-height: 1.25;
			font-weight: var(--fw-light);
			color: #000000;
			opacity: 0.6;
			margin: 0;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.TypefaceFooterBar__cta {
			flex-shrink: 0;
			width: 79px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: var(--panel-bg);
			color: var(--panel-fg);
			transition:
				background-color 0.3s ease,
				color 0.3s ease;
		}
	}
</style>
