<script lang="ts">
	// A single typeface hero section for the home page — a 100vh section.
	// Background media + centered wordmark + meta row + Discover button; the
	// whole section links to the typeface detail page.
	// When `cover` is true it slides up over the previous section as a
	// cover-reveal transition (see $lib/actions/coverReveal).
	import type { Typeface } from '$lib/data/typefaces';
	import { coverReveal } from '$lib/actions/coverReveal';

	interface Props {
		typeface: Typeface;
		total: number;
		/** Give this hero a cover-reveal entrance over the previous section. */
		cover?: boolean;
	}

	let { typeface: tf, total, cover = false }: Props = $props();
</script>

<a
	class="TypefaceHero"
	class:white={!!(tf.heroVideo || tf.thumbnail)}
	href={`/fonts/${tf.slug}`}
	style="background: {tf.theme.bg}; color: {tf.theme.fg};"
	aria-label={`${tf.name} — view typeface`}
	use:coverReveal={{ enabled: cover }}
>
	<div class="TypefaceHero__bg">
		{#if tf.heroVideo}
			<video
				class="TypefaceHero__media"
				src={tf.heroVideo}
				muted
				loop
				autoplay
				playsinline
				preload="auto"
				disablepictureinpicture
			></video>
		{:else if tf.thumbnail}
			<img class="TypefaceHero__media" src={tf.thumbnail} alt="" />
		{:else}
			<div class="TypefaceHero__placeholder" aria-hidden="true">
				<span class="TypefaceHero__placeholder-name">{tf.name}</span>
			</div>
		{/if}
	</div>

	<div class="TypefaceHero__center">
		{#if tf.hero.comingSoon}
			<div class="TypefaceHero__soon">
				{#if tf.hero.intro}
					<p class="TypefaceHero__soon-intro">{tf.hero.intro}</p>
				{/if}
				<span class="TypefaceHero__soon-name">{tf.name} — Coming Soon</span>
				{#if tf.hero.statement}
					<p class="TypefaceHero__soon-statement">{tf.hero.statement}</p>
				{/if}
			</div>
		{:else}
			<span
				class="TypefaceHero__name"
				class:is-large={tf.hero.large}
				style="font-family: '{tf.fontFamily}', 'Steiner', sans-serif;"
			>{tf.name}</span>
		{/if}
	</div>

	<div class="TypefaceHero__foot">
		<div class="TypefaceHero__info">
			<p class="TypefaceHero__label h6">{tf.hero.label}</p>
			<div class="TypefaceHero__meta h6">
				<span>{tf.hero.vol}</span>
				<span>{tf.name}</span>
				<span class="TypefaceHero__sub">{tf.hero.subtitle}</span>
				<span class="TypefaceHero__debut">{tf.hero.debut}</span>
			</div>
		</div>
		<span class="TypefaceHero__cta">Discover</span>
	</div>
</a>

<style>
	.TypefaceHero {
		position: relative;
		display: block;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
		text-decoration: none;
	}

	.TypefaceHero__bg {
		position: absolute;
		inset: 0;
	}

	.TypefaceHero__media {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.TypefaceHero__placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.TypefaceHero__placeholder-name {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(80px, 22vw, 360px);
		line-height: 1;
		letter-spacing: 0;
		color: currentColor;
		opacity: 0.1;
		user-select: none;
	}

	.TypefaceHero__center {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		z-index: 1;
	}

	.TypefaceHero__name {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(40px, 9vw, 120px);
		font-variation-settings: 'wght' 400;
		line-height: 1.2;
		letter-spacing: 0;
		color: currentColor;
	}

	/* Larger wordmark (e.g. gQ) */
	.TypefaceHero__name.is-large {
		font-size: clamp(80px, 22vw, 200px);
	}

	/* Coming-soon variant (e.g. Atom): intro + name + statement, no meta/Discover */
	.TypefaceHero__soon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
		padding: 0 var(--gutter);
		color: currentColor;
	}

	.TypefaceHero__soon-intro {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.5;
		letter-spacing: 0;
		opacity: 0.85;
		margin: 0;
	}

	.TypefaceHero__soon-name {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(22px, 6vw, 36px);
		font-variation-settings: 'wght' 400;
		line-height: 1.2;
		letter-spacing: 0;
	}

	.TypefaceHero__soon-statement {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		line-height: 1.5;
		letter-spacing: 0;
		opacity: 0.9;
		margin: 0;
	}

	.TypefaceHero__foot {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		/* Discover button sits 50px from the image's bottom edge (per Figma) */
		padding: var(--gutter) var(--gutter) 50px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		z-index: 2;
	}

	.TypefaceHero__info {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.TypefaceHero__cta {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		background: #000;
		color: #fff;
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-variation-settings: 'wght' 450;
		line-height: 1;
		letter-spacing: 0;
	}

	/* font-size / family / line-height come from the shared .h6 (10px) */
	.TypefaceHero__label {
		letter-spacing: 0;
		opacity: 0.9;
		margin: 0;
	}

	.TypefaceHero__meta {
		display: flex;
		gap: 14px;
		align-items: baseline;
		letter-spacing: 0;
	}

	.TypefaceHero__sub {
		opacity: 0.55;
	}

	.TypefaceHero__debut {
		margin-left: auto;
	}

	/* All hero text is plain white over media (via `.white` on the root) — no
	   colour inversion. The Discover button stays solid (kept out of __info). */
</style>
