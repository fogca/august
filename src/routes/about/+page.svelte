<svelte:head>
	<title>About — August Type Foundry</title>
	<meta
		name="description"
		content="August Type Foundry — an independent type foundry from Tokyo. Studio statement and philosophy."
	/>
</svelte:head>

<main class="About">
	<div class="About__inner">
		<!-- 1 — Foundry -->
		<section class="block">
			<h2 class="gq">August Type Foundry</h2>
			<p class="en" lang="en">
				August Type Foundry is an independent type foundry, founded in Tokyo in 2026. We cross
				histories, cultures, and eras, reinterpret their context, and draw type through a
				contemporary eye. Anchored in retail families and bespoke commissions, we keep searching for
				forms not yet seen.
			</p>
			<p class="ja" lang="ja">
				オーガストタイプは、東京を拠点に2026年に設立した独立系のタイプファウンドリーです。歴史・文化・時代を交差させ、その文脈を読み替えながら、現代の視点で書体を描きます。リテール書体とビスポーク書体を軸に、まだ見ぬ形を探求し続けます。
			</p>
		</section>

		<!-- 2 — Steiner (aligned with the Steiner page) -->
		<section class="block">
			<h2>Steiner — the formative forces of the word, made visible</h2>
			<p class="en" lang="en">
				Our first release, Steiner, is a twenty-weight neo-humanist sans-serif variable font. It
				takes its name — and its temperament — from Rudolf Steiner: a Goethean reading of nature,
				where form is never fixed but always in metamorphosis, and an anthroposophy that holds the
				human being as the measure of things. The letters are made to feel grown rather than
				constructed — organic in their curves, human in their proportion. Its humanist lineage runs
				quietly beneath — Johnston's 1916 Underground alphabet, Gill Sans, Neuzeit, Otl Aicher's
				Rotis — never the surface, only the soil.
			</p>
			<p class="ja" lang="ja">
				第一弾の Steiner は、20ウェイトのネオ・ヒューマニスト・サンセリフ（可変フォント）です。その名と気質はルドルフ・シュタイナーに由来します——形を固定されたものでなく絶えざる変容として見るゲーテ的な自然観と、人間を万物の尺度とする人智学。文字は「構築された」のではなく「育った」ように、曲線は有機的に、プロポーションは人間的に。ヒューマニストの系譜は表層ではなく土壌として静かに息づいています——ジョンストンの1916年ロンドン地下鉄書体、Gill Sans、Neuzeit、オトル・アイヒャーの Rotis。
			</p>
			<p class="en" lang="en">
				A typeface is never the meaning itself. It is the medium meaning passes through — doing the
				quiet work of carrying a thought from one mind to another.
			</p>
			<p class="ja" lang="ja">
				書体は決して意味そのものではありません。意味が通り抜ける媒体として、ある思考を一つの心から別の心へと静かに運びます。
			</p>
		</section>

		<!-- 3 — How we draw -->
		<section class="block">
			<h2>How we draw</h2>
			<p class="en" lang="en">
				We ship spacing tight by default. A face set loose can never be tightened back, but a face
				set tight leaves the operator room to breathe. Constraint, we believe, is what generates the
				freedom of use. We keep the same discipline in the catalogue itself — a small, considered
				library rather than a sprawling one — so every release stays measured and intentional.
			</p>
			<p class="ja" lang="ja">
				字間は詰めた状態で出荷します。緩く組んだ書体を後から締めることはできませんが、締めて組んだ書体は使い手に呼吸の余地を残します。制約こそが使用の自由を生む、と私たちは考えます。同じ規律をカタログ自体にも保ち——肥大したライブラリではなく、小さく吟味されたライブラリとして——すべてのリリースを抑制的で意図的なものに保ちます。
			</p>
		</section>

		<!-- 4 — How we release -->
		<section class="block">
			<h2>How we release</h2>
			<p class="en" lang="en">
				Variable font first, sold as a family. Licences are perpetual — pay once, use forever, with
				no subscription. Desktop, Web, App and Books licences are available, and bespoke commissions
				— a proprietary typeface tuned to a single identity — sit alongside the retail library.
			</p>
			<p class="ja" lang="ja">
				まず可変フォントとして、ファミリー単位で販売します。ライセンスは買い切り——一度の支払いで永続利用、サブスクリプションはありません。Desktop / Web / App / Books
				の各ライセンスを用意し、ビスポーク（単一のアイデンティティに調律した専用書体）の制作も、リテール・ライブラリと並んで承ります。
			</p>
		</section>

		<!-- 5 — Contact -->
		<section class="block">
			<h2>Contact</h2>
			<p class="en" lang="en">
				For licensing, custom commissions, or anything else, write to
				<a href="mailto:hi@august.tf">hi@august.tf</a>. We are based in Tokyo, Japan.
			</p>
			<p class="ja" lang="ja">
				ライセンス、カスタム制作、その他のお問い合わせは
				<a href="mailto:hi@august.tf">hi@august.tf</a> までご連絡ください。東京を拠点に活動しています。
			</p>
		</section>
	</div>
</main>

<style>
	/* Dark theme — scoped to About only. base.css applies color directly to
	   div / p / span / a / h1-h6, so the parent color loses the cascade;
	   override every descendant with :global(*). Uses base.css dark tokens. */
	.About {
		min-height: 100vh;
		padding-block: 96px;
		padding-inline: 0;
		background: var(--color-bg-dark);
		color: var(--white);
	}

	.About :global(*) {
		color: var(--white);
	}

	@media (min-width: 768px) {
		.About {
			padding-top: 120px;
		}
	}

	.About__inner {
		max-width: 640px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	.block {
		margin-bottom: 48px;
	}

	.block:last-child {
		margin-bottom: 0;
	}

	.About h2 {
		margin: 0 0 12px;
	}

	/* English (Latin) — base p size (Steiner). */
	.About .en {
		margin: 0 0 6px;
	}

	/* Japanese — Tazugane Light, ~1.75px smaller than the Latin so the two
	   scripts read at a matched visual size. Latin runs inside JA keep Steiner. */
	.About .ja {
		font-family: 'Steiner', 'TazuganeGothicStdN-Light', 'Tazugane Gothic StdN',
			'Tazugane Gothic', 'Hiragino Sans W3', 'Hiragino Sans', 'Yu Gothic', sans-serif;
		font-weight: 300;
		font-size: calc(var(--fs-p) - 1.75px);
		line-height: 1.85;
		margin: 0 0 28px;
	}

	/* Last JA in a section shouldn't add extra trailing space before block gap */
	.About .ja:last-child {
		margin-bottom: 0;
	}

	/* Foundry wordmark in gQ (Mokuseki Sans) */
	.About .gq {
		font-family: 'Mokuseki Sans', 'Steiner', sans-serif;
	}

	.About a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
