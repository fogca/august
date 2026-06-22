<!--
  DRAFT — Privacy Policy. Needs a final legal/advisor review and confirmation of
  every processor actually used at launch (Stripe + email + Cloudflare).
  noindex until signed off.
-->
<svelte:head>
	<title>Privacy Policy — August Type Foundry</title>
	<meta name="description" content="How August Type Foundry collects and uses personal data." />
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Legal">
	<div class="Legal__inner">
		<h1>Privacy Policy</h1>
		<p class="Legal__lead">
			August Type Foundry is a brand operated by Mirai Service Co., Ltd. (株式会社みらいサービス).
			This policy explains what personal data we collect when you buy a licence or contact us, and how
			we use it.
		</p>

		<section class="Legal__block">
			<h2>Data we collect</h2>
			<p>
				When you purchase a licence we collect your name, email address, and billing details, and a
				record of what you licensed. Card details are entered directly with our payment processor
				and are never stored on our servers. If you sign up to our newsletter we collect your email
				address. If you email us we keep that correspondence.
			</p>
		</section>

		<section class="Legal__block">
			<h2>How we use it</h2>
			<p>
				To process your order, deliver your fonts and licence documents, provide support, keep
				records required by law (tax, accounting), and — only if you opt in — send foundry updates.
				We do not sell your data, and we do not track the users of websites that license our fonts.
			</p>
		</section>

		<section class="Legal__block">
			<h2>Processors we share data with</h2>
			<p>
				We rely on a small number of service providers who process data on our behalf: Stripe
				(payment processing), our email provider (order and licence delivery), and Cloudflare
				(hosting and security logs). Each processes data under its own terms and security measures.
			</p>
		</section>

		<section class="Legal__block">
			<h2>Legal basis &amp; retention</h2>
			<p>
				We process order data to perform our contract with you and to meet legal obligations, and
				newsletter data on the basis of your consent. We keep order and tax records for the period
				required by law, and you can unsubscribe from the newsletter at any time.
			</p>
		</section>

		<section class="Legal__block">
			<h2>Your rights</h2>
			<p>
				You may request access to, correction of, or deletion of your personal data, subject to our
				legal record-keeping obligations. To make a request, or for any privacy question, contact
				<a href="mailto:hi@august.tf">hi@august.tf</a>.
			</p>
		</section>

		<p class="Legal__note">Last updated: 2026 — — · Draft pending review.</p>
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
		max-width: 60ch;
	}

	.Legal__block {
		margin-bottom: 28px;
		max-width: 64ch;
	}

	.Legal__block h2 {
		margin: 0 0 8px;
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
</style>
