<script lang="ts">
	// Internal OpenType reference page — an at-a-glance map of essential vs
	// recommended OpenType features, with live demos. Kept out of the Steiner
	// product page on purpose (the demos use Inter / EB Garamond). noindex.
	import OpenTypeReference from '$lib/components/fonts/OpenTypeReference.svelte';
</script>

<svelte:head>
	<title>OpenType — Reference — August Type Foundry</title>
	<meta name="description" content="A working reference of essential and recommended OpenType features." />
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="OTPage">
	<header class="OTPage__head">
		<p class="OTPage__eyebrow">Reference</p>
		<h1 class="OTPage__title">OpenType features</h1>
		<p class="OTPage__lead">
			A working map of the features a Latin typeface is expected to ship — split into the
			essentials every font should carry and the extras that add range. Each row toggles live, off →
			on.
		</p>
		<p class="OTPage__lead-ja" lang="ja">
			必須と推奨を一覧化したリファレンス。デモは実際にその機能を持つ Inter（サンセリフ）/ EB
			Garamond（セリフ）でレンダリングしています — Steiner は自前のサブセットを搭載しているため。原則は「数を増やすことではなく、空っぽの機能をゼロにすること」。なお
			mark / mkmk / ccmp（アクセントの合成・配置）は CSS でオン・オフできない常時オンの構造系のため、トグル一覧からは外しています（正しく載るか壊れるかの二択）。
		</p>
	</header>

	<OpenTypeReference />

	<nav class="OTPage__foot">
		<a href="/fonts/steiner">← Steiner</a>
	</nav>
</main>

<style>
	.OTPage {
		padding: 96px 0 120px;
	}

	@media (min-width: 768px) {
		.OTPage {
			padding-top: 132px;
		}
	}

	.OTPage__head {
		padding: 0 var(--padding);
		max-width: 720px;
		margin-bottom: 56px;
	}

	.OTPage__eyebrow {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text-mute);
		margin: 0 0 16px;
	}

	.OTPage__title {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(32px, 6vw, 48px);
		font-weight: var(--fw-base);
		line-height: 1.05;
		letter-spacing: 0;
		margin: 0 0 20px;
	}

	.OTPage__lead {
		font-family: 'Steiner', sans-serif;
		font-size: 15px;
		line-height: 1.5;
		letter-spacing: 0;
		color: var(--color-text);
		margin: 0;
		max-width: 60ch;
	}

	.OTPage__lead-ja {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-p);
		line-height: 1.75;
		letter-spacing: 0;
		color: rgba(0, 0, 0, 0.55);
		margin: 14px 0 0;
		max-width: 60ch;
	}

	.OTPage__foot {
		padding: 48px var(--padding) 0;
	}

	.OTPage__foot a {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		letter-spacing: 0;
		color: var(--color-text);
		text-decoration: none;
		opacity: 0.7;
		transition: opacity 0.15s ease;
	}

	.OTPage__foot a:hover {
		opacity: 1;
	}
</style>
