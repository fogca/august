<svelte:head>
	<title>Company — August Type Foundry</title>
	<meta name="description" content="August Type Foundry — company information." />
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
				<dd>Mirai Service Co., Ltd.</dd>
			</div>
			<div class="Company__fact">
				<dt>Registered office</dt>
				<dd>1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan</dd>
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
		min-height: 100dvh;
		padding-block: 96px;
	}

	@media (min-width: 768px) {
		.Company {
			padding-top: 120px;
		}
	}

	.Company__inner {
		max-width: 640px;
		padding-inline: var(--padding);
	}

	/* PC: the block sits inside the right 75% of the viewport — the title
	   (and everything else, left-aligned by default) starts flush at that
	   25% seam rather than being centered on the page. */
	@media (min-width: 768px) {
		.Company__inner {
			margin-left: 25%;
			margin-right: 0;
		}
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
