<script lang="ts">
	// Pinned 100vh character specimen: A–Z, a–z, figures and currency.
	// The section pins (position: sticky) while the wrapper scrolls; scroll
	// progress drives the variable wght axis from 1 (Hair) to 950 (Ultra).
	import { onMount } from 'svelte';
	import { onScroll } from '$lib/scroll';

	interface Props {
		fontFamily: string;
	}

	let { fontFamily }: Props = $props();

	const WGHT_MIN = 1;
	const WGHT_MAX = 950;

	// Centered specimen lines — letters, then figures + currency/essential marks
	const LINES = [
		'ABCDEFGHIJKLM',
		'NOPQRSTUVWXYZ',
		'abcdefghijklm',
		'nopqrstuvwxyz',
		'0123456789',
		'$ € ¥ £ % & @ § №'
	];

	let wrapEl = $state<HTMLElement>();
	let wght = $state(WGHT_MIN);

	onMount(() => {
		const update = () => {
			if (!wrapEl) return;
			const rect = wrapEl.getBoundingClientRect();
			const range = rect.height - window.innerHeight;
			if (range <= 0) return;
			const progress = Math.min(1, Math.max(0, -rect.top / range));
			wght = Math.round(WGHT_MIN + progress * (WGHT_MAX - WGHT_MIN));
		};
		update();
		return onScroll(update);
	});
</script>

<section class="GlyphSpecimen" aria-label="Character specimen" bind:this={wrapEl}>
	<div class="GlyphSpecimen__pin">
		<p class="GlyphSpecimen__wght" aria-hidden="true">wght {wght}</p>
		<p
			class="GlyphSpecimen__text"
			style="font-family: '{fontFamily}', sans-serif; font-variation-settings: 'wght' {wght};"
		>
			{#each LINES as line}
				<span class="GlyphSpecimen__line">{line}</span>
			{/each}
		</p>
	</div>
</section>

<style>
	/* Tall wrapper provides the scroll distance for the wght animation */
	.GlyphSpecimen {
		height: 300vh;
		border-top: 1px solid var(--color-line);
	}

	.GlyphSpecimen__pin {
		position: sticky;
		top: 0;
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0 var(--padding);
		overflow: hidden;
	}

	.GlyphSpecimen__wght {
		position: absolute;
		top: 70px;
		left: var(--padding);
		font-family: var(--font-en), sans-serif;
		font-size: 10px;
		color: var(--color-text-mute);
		letter-spacing: 0;
		margin: 0;
		opacity: 0.7;
		font-variation-settings: normal;
	}

	.GlyphSpecimen__text {
		font-size: clamp(28px, 6.5vw, 88px);
		line-height: 1.25;
		letter-spacing: 0.01em;
		margin: 0;
		text-align: center;
		width: 100%;
	}

	.GlyphSpecimen__line {
		display: block;
	}
</style>
