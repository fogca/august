<!-- Legal Notice — disclosure required under Japan's Act on Specified Commercial
     Transactions (特定商取引法). Facts must stay accurate; only the
     presentation language changed (2026-08, English for now). -->
<svelte:head>
	<title>Legal Notice — August Type Foundry</title>
	<meta name="description" content="Specified Commercial Transactions Act disclosure for August Type Foundry." />
</svelte:head>

<main class="Legal">
	<div class="Legal__inner">
		<h1>Legal Notice</h1>
		<p class="Legal__lead">
			This notice discloses information about August Type Foundry's font sales as required under
			Japan's Act on Specified Commercial Transactions (特定商取引法).
		</p>

		<dl class="Legal__facts">
			<div class="Legal__fact">
				<dt>Seller</dt>
				<dd>Mirai Service Co., Ltd. (trading as August Type Foundry)</dd>
			</div>
			<div class="Legal__fact">
				<dt>Person in charge of operations</dt>
				<dd>Takumi Isobe</dd>
			</div>
			<div class="Legal__fact">
				<dt>Address</dt>
				<dd>1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi 451-0034, Japan</dd>
			</div>
			<div class="Legal__fact">
				<dt>Phone number</dt>
				<dd>Disclosed by email without delay upon customer request.</dd>
			</div>
			<div class="Legal__fact">
				<dt>Email address</dt>
				<dd><a href="mailto:hi@august.tf">hi@august.tf</a></dd>
			</div>
			<div class="Legal__fact">
				<dt>Selling price</dt>
				<dd>
					The price of each licence is shown on the purchase page (tax included). Price varies by
					licence type (Desktop / Web / App / Books) and scope of use.
				</dd>
			</div>
			<div class="Legal__fact">
				<dt>Charges other than the product price</dt>
				<dd>
					As these are digital downloads, no shipping charge applies. Internet connection charges
					and similar costs are the customer's responsibility.
				</dd>
			</div>
			<div class="Legal__fact">
				<dt>Payment method</dt>
				<dd>Credit card (Stripe)</dd>
			</div>
			<div class="Legal__fact">
				<dt>Payment timing</dt>
				<dd>Payment is finalised when your order is confirmed.</dd>
			</div>
			<div class="Legal__fact">
				<dt>Delivery timing</dt>
				<dd>A download link is delivered by email within 24 hours of payment completion.</dd>
			</div>
			<div class="Legal__fact">
				<dt>Returns &amp; cancellations</dt>
				<dd>
					Due to the nature of digital goods, we cannot accept returns or refunds once the files
					have been provided (downloaded). If there is a defect in the delivered files, we will
					address it promptly.
				</dd>
			</div>
			<div class="Legal__fact">
				<dt>System requirements</dt>
				<dd>Applications that support OpenType (.otf / .ttf), and web browsers that support WOFF2.</dd>
			</div>
		</dl>

		<p class="Legal__note">Last updated: July 2026.</p>
	</div>
</main>

<style>
	.Legal {
		min-height: 100vh;
		min-height: 100dvh;
		padding-block: 96px;
	}

	@media (min-width: 768px) {
		.Legal {
			padding-top: 120px;
		}
	}

	.Legal__inner {
		padding-inline: var(--padding);
	}

	/* PC: same offset mechanism as the EULA template — a viewport-relative
	   left inset rather than a percentage margin, and no width cap. */
	@media (min-width: 768px) {
		.Legal__inner {
			padding-left: 25vw;
		}
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

	/* Font size/weight per the EULA template: 14px mobile (base), 16px
	   desktop, light weight — applied to the lead paragraph and every fact's
	   value (dt labels stay at their existing muted style). */
	.Legal__lead,
	.Legal__fact dd {
		font-size: 14px;
		font-weight: var(--fw-light);
	}

	@media (min-width: 768px) {
		.Legal__lead,
		.Legal__fact dd {
			font-size: 16px;
		}
	}

	@media (max-width: 640px) {
		.Legal__fact {
			grid-template-columns: 1fr;
			gap: 2px;
		}
	}
</style>
