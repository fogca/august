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
	const LINES_LG = [
		'ABCDEFGHIJKLM',
		'NOPQRSTUVWXYZ',
		'abcdefghijklm',
		'nopqrstuvwxyz',
		'0123456789',
		'$ € ¥ £ % & @ § №'
	];

	// Phones get shorter lines. The wght axis runs to Ultra, where every glyph
	// is far wider than at Hair, so the break has to clear the *heaviest*
	// state: at 48px the longest line below measures 298px against 338px of
	// available width on a 375pt screen.
	const LINES_SM = [
		'ABCDEFGHI',
		'JKLMNOPQR',
		'STUVWXYZ',
		'abcdefghi',
		'jklmnopqr',
		'stuvwxyz',
		'0123456789',
		'$ € ¥ £ %',
		'& @ § №'
	];

	let wrapEl = $state<HTMLElement>();
	let wght = $state(WGHT_MIN);
	let isSmall = $state(false);
	const LINES = $derived(isSmall ? LINES_SM : LINES_LG);

	onMount(() => {
		const mq = window.matchMedia('(max-width: 767px)');
		isSmall = mq.matches;
		const onChange = () => (isSmall = mq.matches);
		mq.addEventListener('change', onChange);
		// Belt and braces: some embedded/emulated viewports resize without
		// firing the media-query change event.
		window.addEventListener('resize', onChange);

		const update = () => {
			if (!wrapEl) return;
			const rect = wrapEl.getBoundingClientRect();
			const range = rect.height - (window.visualViewport?.height ?? window.innerHeight);
			if (range <= 0) return;
			const progress = Math.min(1, Math.max(0, -rect.top / range));
			wght = Math.round(WGHT_MIN + progress * (WGHT_MAX - WGHT_MIN));
		};
		update();
		const stopScroll = onScroll(update);
		return () => {
			mq.removeEventListener('change', onChange);
			window.removeEventListener('resize', onChange);
			stopScroll();
		};
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
		height: 300dvh;
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

	/* Phones: 58px flat, set solid. A-Z in three lines is already the tightest
	   split there is (9/9/8 — searched every contiguous break), and at Ultra the
	   widest line measures 360px, so a 375pt screen has to give up its gutters
	   entirely for the type to run at this size. */
	@media (max-width: 767px) {
		.GlyphSpecimen__text {
			font-size: 58px;
			line-height: 1;
		}

		/* base.css carries a bare `section { padding-inline: var(--padding) }`;
		   both that and the pin's own gutter come off here. */
		.GlyphSpecimen,
		.GlyphSpecimen__pin {
			padding-inline: 0;
		}
	}

	/* Below 375pt there is no width left to give, so the type scales instead. */
	@media (max-width: 374px) {
		.GlyphSpecimen__text {
			font-size: 15.4vw;
		}
	}

	.GlyphSpecimen__line {
		display: block;
	}
</style>
