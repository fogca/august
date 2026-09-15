<!-- Legal Notice — disclosure required under Japan's Act on Specified Commercial
     Transactions (特定商取引法). Facts must stay accurate; only the
     presentation changed (2026-08 English; 2026-09 Figma 3:671 long-form
     layout via PageSection `flow`, brand macron). -->
<script lang="ts">
	import PageSection from '$lib/components/PageSection.svelte';
</script>

<svelte:head>
	<title>Legal Notice — Ōgast</title>
	<meta name="description" content="Specified Commercial Transactions Act disclosure for Ōgast." />
</svelte:head>

<main class="Legal">
	<PageSection
		title="Legal Notice"
		as="h1"
		subtitle="Specified Commercial Transactions Act — last updated July 2026"
		flow
	>
		<p>
			This notice discloses information about Ōgast's font sales as required under Japan's Act on
			Specified Commercial Transactions (特定商取引法).
		</p>

		<dl class="Legal__facts">
			<div class="Legal__fact">
				<dt>Seller</dt>
				<dd>Mirai Service Co., Ltd. (trading as Ōgast)</dd>
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
				<dd>
					Applications that support OpenType (.otf / .ttf), and web browsers that support WOFF2.
				</dd>
			</div>
		</dl>
	</PageSection>
</main>

<style>
	.Legal {
		background: #f1f0ef;
	}

	.Legal__facts {
		display: flex;
		flex-direction: column;
		gap: 18px;
		margin: 2.5em 0 0;
	}

	.Legal__fact {
		display: grid;
		grid-template-columns: 220px 1fr;
		gap: 16px;
	}

	.Legal__fact dt {
		opacity: 0.5;
	}

	.Legal__fact dd {
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 640px) {
		.Legal__fact {
			grid-template-columns: 1fr;
			gap: 2px;
		}
	}
</style>
