<!--
  DRAFT — 特定商取引法に基づく表記.
  Requires founder input ([運営責任者名], phone-disclosure choice) and a final
  check (advisor + the tax-inclusive JPY price display). noindex until signed off.
-->
<svelte:head>
	<title>特定商取引法に基づく表記 — August Type Foundry</title>
	<meta name="description" content="Specified Commercial Transactions Act disclosure for August Type Foundry." />
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Legal">
	<div class="Legal__inner">
		<h1>特定商取引法に基づく表記</h1>
		<p class="Legal__lead">
			本表記は、特定商取引法（通信販売）に基づき、August Type Foundry のフォント販売について開示するものです。
		</p>

		<dl class="Legal__facts">
			<div class="Legal__fact">
				<dt>販売事業者</dt>
				<dd>株式会社みらいサービス（屋号：August Type Foundry）</dd>
			</div>
			<div class="Legal__fact">
				<dt>運営統括責任者</dt>
				<dd>磯部 拓巳</dd>
			</div>
			<div class="Legal__fact">
				<dt>所在地</dt>
				<dd>〒451-0034 愛知県名古屋市西区樋の口町1-16</dd>
			</div>
			<div class="Legal__fact">
				<dt>電話番号</dt>
				<dd>お客様からのご請求があった場合、遅滞なく電子メールにて開示いたします。</dd>
			</div>
			<div class="Legal__fact">
				<dt>メールアドレス</dt>
				<dd><a href="mailto:hi@august.tf">hi@august.tf</a></dd>
			</div>
			<div class="Legal__fact">
				<dt>販売価格</dt>
				<dd>
					各ライセンスの料金は購入ページに表示します（消費税込）。価格はライセンスの種別（Desktop / Web /
					App / Books）および利用規模により異なります。
				</dd>
			</div>
			<div class="Legal__fact">
				<dt>商品代金以外の必要料金</dt>
				<dd>ダウンロード販売のため送料はかかりません。インターネット接続料金等はお客様のご負担となります。</dd>
			</div>
			<div class="Legal__fact">
				<dt>お支払い方法</dt>
				<dd>クレジットカード決済（Stripe）</dd>
			</div>
			<div class="Legal__fact">
				<dt>お支払い時期</dt>
				<dd>ご注文確定時にお支払いが確定します。</dd>
			</div>
			<div class="Legal__fact">
				<dt>商品の引渡し時期</dt>
				<dd>決済完了後、ダウンロードリンクを記載したメールにて速やかに提供いたします。</dd>
			</div>
			<div class="Legal__fact">
				<dt>返品・キャンセルについて</dt>
				<dd>
					デジタル商品の性質上、提供（ダウンロード）後の返品・返金はお受けできません。提供データに不具合が
					ある場合は、速やかに対応いたします。
				</dd>
			</div>
			<div class="Legal__fact">
				<dt>動作環境</dt>
				<dd>OpenType（.otf / .ttf）対応のアプリケーション、および WOFF2 対応のウェブブラウザ。</dd>
			</div>
		</dl>

		<p class="Legal__note" lang="ja">最終更新：2026年——／本表記は確定前のドラフトです。</p>
	</div>
</main>

<style>
	.Legal {
		min-height: 100vh;
		padding-block: 96px;
	}

	@media (min-width: 768px) {
		.Legal {
			padding-top: 120px;
		}
	}

	.Legal__inner {
		max-width: 680px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	.Legal h1 {
		margin: 0 0 24px;
	}

	.Legal__lead {
		margin-bottom: 36px;
	}

	.Legal__facts {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.Legal__fact {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 16px;
	}

	.Legal__fact dt {
		opacity: 0.5;
	}

	.Legal__fact dd {
		margin: 0;
		line-height: 1.7;
	}

	.Legal__note {
		margin-top: 40px;
		font-size: 11px;
		opacity: 0.5;
	}

	.Legal a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (max-width: 640px) {
		.Legal__fact {
			grid-template-columns: 1fr;
			gap: 2px;
		}
	}
</style>
