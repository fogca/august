<script lang="ts">
	// Order confirmation — only rendered for a verified, paid Stripe session
	// (see +page.server.ts). `order` is null only in the local dev stub.
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const order = $derived(data.order);

	// EUR only — matches $lib/data/pricing's formatPrice locale choice.
	function formatAmount(amount: number): string {
		return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
	}
</script>

<svelte:head>
	<title>Order Received — August Type Foundry</title>
	<meta name="description" content="Order confirmation — August Type Foundry." />
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Success">
	<div class="Success__inner">
		<h1 class="Success__heading">Order Received</h1>

		{#if order}
			<dl class="Success__facts">
				<div class="Success__fact">
					<dt>Order reference</dt>
					<dd>{order.reference}</dd>
				</div>
				{#if order.licenses}
					<div class="Success__fact">
						<dt>Licenses</dt>
						<dd>{order.licenses}{order.educational ? ' · Educational' : ''}</dd>
					</div>
				{/if}
				{#if order.licenseeName}
					<div class="Success__fact">
						<dt>Licensed to</dt>
						<dd>{order.licenseeName}{order.clientName ? ` (for ${order.clientName})` : ''}</dd>
					</div>
				{/if}
				<div class="Success__fact">
					<dt>Total</dt>
					<dd>{formatAmount(order.amount)}</dd>
				</div>
			</dl>
		{/if}

		<p class="Success__body">
			Thank you for purchasing Asger.
			{#if order?.email}
				Your fonts, EULA, and license certificate will be delivered to
				<strong>{order.email}</strong> within 24 hours.
			{:else}
				Your fonts, EULA, and license certificate will be delivered by email within 24 hours.
			{/if}
			A Stripe receipt has been sent separately as immediate proof of purchase.
		</p>

		<p class="Success__support">
			Questions, or nothing arrived? Write to
			<a href="mailto:hi@august.tf">hi@august.tf</a>{#if order}&nbsp;quoting your order reference{/if}.
		</p>

		<a href="/" class="Success__home">← Back to August Type Foundry</a>
	</div>
</main>

<style>
	.Success {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		padding-top: 80px;
		padding-inline: 24px;
	}

	.Success__inner {
		max-width: 520px;
	}

	.Success__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(28px, 5vw, 48px);
		letter-spacing: 0;
		line-height: 1.1;
		margin-bottom: 20px;
	}

	.Success__facts {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0 0 24px;
		padding: 16px 18px;
		background: var(--color-bg-gray);
	}

	.Success__fact {
		display: grid;
		grid-template-columns: 130px 1fr;
		gap: 12px;
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		line-height: 1.5;
	}

	.Success__fact dt {
		color: var(--color-text-mute);
	}

	.Success__fact dd {
		margin: 0;
	}

	.Success__body {
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 350;
		line-height: 1.65;
		margin-bottom: 16px;
	}

	.Success__support {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		line-height: 1.6;
		color: var(--color-text-mute);
		margin-bottom: 32px;
	}

	.Success__support a {
		color: var(--color-text);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.Success__home {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-ui);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
