<svelte:head>
	<title>Company — August Type Foundry</title>
	<meta name="description" content="August Type Foundry — company information." />
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Company">
	<div class="Company__inner">
		<h1>Company</h1>

		<p class="Company__lead">
			August Type Foundry is a brand operated by Mirai Service Co., Ltd.
		</p>

		<dl class="Company__facts">
			<div class="Company__fact">
				<dt>Operating company</dt>
				<dd>株式会社みらいサービス（Mirai Service Co., Ltd.）</dd>
			</div>
			<div class="Company__fact">
				<dt>Registered office</dt>
				<dd>〒451-0034 名古屋市西区樋の口町1-16</dd>
			</div>
			<div class="Company__fact">
				<dt>Capital</dt>
				<dd>¥10,000,000</dd>
			</div>
			<div class="Company__fact">
				<dt>Established</dt>
				<dd>2005.07.20</dd>
			</div>
			<div class="Company__fact">
				<dt>Contact</dt>
				<dd><a href="mailto:hi@august.tf">hi@august.tf</a></dd>
			</div>
		</dl>
	</div>
</main>

<style>
	/* Text appearance comes from base.css; only layout spacing here. */
	.Company {
		min-height: 100vh;
		padding-block: 96px;
	}

	@media (min-width: 768px) {
		.Company {
			padding-top: 120px;
		}
	}

	.Company__inner {
		max-width: 640px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	.Company h1 {
		margin: 0 0 24px;
	}

	.Company__lead {
		margin-bottom: 36px;
	}

	.Company__facts {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.Company__fact {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 16px;
	}

	.Company__fact dt {
		opacity: 0.5;
	}

	.Company__fact dd {
		margin: 0;
	}

	.Company a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (max-width: 640px) {
		.Company__fact {
			grid-template-columns: 1fr;
			gap: 2px;
		}
	}
</style>
