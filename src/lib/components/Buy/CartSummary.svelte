<script lang="ts">
	// Cart summary — read-only receipt of what Step 1 (About you) resolved,
	// plus the selected typeface package(s). There is nothing to pick here
	// any more: the licence is a consequence of the intake step's answers,
	// not a free choice, so no tier dropdown — only an "Edit" link back to
	// Step 1 for changing the answers themselves.
	import { enhance } from '$app/forms';
	import { formatPrice, getTierName, PROJECT_LICENSE_LABEL } from '$lib/data/pricing';
	import type { PackageDef } from '$lib/data/pricing';
	import type { CartItem, AppliedDiscount } from '$lib/data/discounts';
	import type { IntakeMeta } from '$lib/components/Buy/LicenseIntake.svelte';

	interface Props {
		items: CartItem[];
		/** Step 1's resolved answers — shown here for confirmation and sent to checkout. */
		intakeMeta: IntakeMeta;
		subtotal: number;
		discounts: AppliedDiscount[];
		total: number;
		/** All selected packages (multi-package support). */
		packageDefs: PackageDef[];
		mobileExpanded?: boolean;
		onMobileToggle?: () => void;
		/** Render as an always-open in-flow block (no collapsing sticky bar). */
		inline?: boolean;
		/** Educational discount active — forwarded to checkout. */
		isStudent?: boolean;
		/** Checkout action failure message (from the page's `form` prop). */
		errorMessage?: string | null;
	}

	let {
		items,
		intakeMeta,
		subtotal,
		discounts,
		total,
		packageDefs,
		mobileExpanded = false,
		onMobileToggle,
		inline = false,
		isStudent = false,
		errorMessage = null
	}: Props = $props();

	const hasItems = $derived(items.length > 0);

	// True while the checkout POST is in flight (until Stripe redirect unloads the page)
	let submitting = $state(false);

	// Only one selection is ever active — every package shares the same
	// kind/tier, so the first item represents the selection.
	const activeItem = $derived<CartItem | null>(items[0] ?? null);

	function licenseName(item: CartItem): string {
		return item.kind === 'project' ? PROJECT_LICENSE_LABEL : getTierName(item.tierIndex ?? 1);
	}

	/** Sum of charged (post-package) prices across selected packages. */
	function licensePrice(): number {
		return items.reduce((s, i) => s + i.basePrice, 0);
	}

	function editStep1() {
		document.getElementById('step-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<!-- bfcache: coming Back from Stripe restores the page with submitting=true —
     reset it so the Checkout button is usable again -->
<svelte:window onpageshow={(e) => { if (e.persisted) submitting = false; }} />

<aside
	class="CartSummary"
	class:is-expanded={mobileExpanded}
	class:is-inline={inline}
	role="region"
	aria-label="Cart summary"
>
	<!-- Mobile sticky bar header -->
	<button
		type="button"
		class="CartSummary__mobile-bar"
		onclick={onMobileToggle}
		aria-expanded={mobileExpanded}
		aria-controls="cart-details"
	>
		<span class="CartSummary__mobile-label">
			{hasItems ? 'License selected' : 'No license selected'}
		</span>
		<span class="CartSummary__mobile-total" aria-live="polite" role="status">
			{hasItems ? formatPrice(total) : '—'}
		</span>
		<span class="CartSummary__mobile-chevron" aria-hidden="true">
			{mobileExpanded ? '▾' : '▴'}
		</span>
	</button>

	<!-- Cart details panel -->
	<div class="CartSummary__details" id="cart-details" aria-live="polite" role="status">
		{#if !hasItems}
			<h3 class="CartSummary__heading">Your order</h3>
			<p class="CartSummary__empty">Answer Step 1 and choose a font package to begin.</p>
		{:else}
			<!-- License section -->
			{#if activeItem}
				<section class="CartSummary__section">
					<h3 class="CartSummary__heading">License</h3>
					<ul class="CartSummary__licences">
						<li class="CartSummary__licence">
							<div class="CartSummary__licence-main">
								<span class="CartSummary__licence-type">{licenseName(activeItem)}</span>
								<span class="CartSummary__licence-price">{formatPrice(licensePrice())}</span>
								<button type="button" class="CartSummary__edit" onclick={editStep1}>Edit</button>
							</div>
							{#if intakeMeta.licenseeName || intakeMeta.clientName}
								<p class="CartSummary__licensee">
									{#if intakeMeta.path === 'project'}
										{intakeMeta.licenseeName} → for {intakeMeta.clientName}
									{:else}
										{intakeMeta.licenseeName}
										{#if intakeMeta.usageBand}· {intakeMeta.usageBand} people{#if intakeMeta.totalHeadcount} (total {intakeMeta.totalHeadcount}){/if}{/if}
									{/if}
								</p>
							{/if}
						</li>
					</ul>
				</section>
			{/if}

			<!-- Fonts section — list all selected packages -->
			{#if packageDefs.length > 0}
				<section class="CartSummary__section">
					<h3 class="CartSummary__heading">Fonts</h3>
					<ul class="CartSummary__packages">
						{#each packageDefs as pkg (pkg.id)}
							<li class="CartSummary__package-row">
								<span class="CartSummary__package-name">{pkg.label}</span>
								<span class="CartSummary__package-detail">{pkg.detail}</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<!-- Totals — "Full price" is the gross (pre-discount) anchor; the per-line
			     license price above is the launch (post-package) price -->
			<section class="CartSummary__totals">
				<div class="CartSummary__row">
					<span>Full price</span>
					<span class="CartSummary__row-amount">{formatPrice(subtotal)}</span>
				</div>

				{#each discounts as discount (discount.id + discount.label)}
					<div class="CartSummary__row CartSummary__row--discount">
						<span>{discount.label}</span>
						<span class="CartSummary__row-amount">−{formatPrice(discount.amount)}</span>
					</div>
				{/each}

				<div class="CartSummary__row CartSummary__row--total">
					<span>Total</span>
					<span class="CartSummary__row-amount">{formatPrice(total)}</span>
				</div>
			</section>

			<!-- Checkout -->
			{#if errorMessage}
				<p class="CartSummary__error" role="alert">{errorMessage}</p>
			{/if}
			<form
				method="POST"
				action="?/checkout"
				class="CartSummary__form"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						// On failure the `form` prop updates in place — cart state survives.
						// On success SvelteKit follows the external redirect to Stripe.
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				<input type="hidden" name="educational" value={isStudent ? '1' : '0'} />
				<input type="hidden" name="licensee_name" value={intakeMeta.licenseeName} />
				<input type="hidden" name="client_name" value={intakeMeta.clientName} />
				<input type="hidden" name="total_headcount" value={intakeMeta.totalHeadcount ?? ''} />
				{#each packageDefs as pkg}
					<input type="hidden" name="package_id" value={pkg.id} />
				{/each}
				{#each items as item}
					<input type="hidden" name="item_kind" value={item.kind} />
					<input type="hidden" name="item_tier" value={item.tierIndex ?? ''} />
					<input type="hidden" name="item_price" value={item.basePrice} />
					<input type="hidden" name="item_package" value={item.packageId} />
				{/each}
				<button type="submit" class="CartSummary__checkout-btn" disabled={submitting}>
					{submitting ? 'Redirecting…' : 'Checkout'}
				</button>
			</form>
		{/if}
	</div>
</aside>

<style>
	.CartSummary {
		background: var(--color-bg);
		font-family: 'Steiner', sans-serif;
	}

	/* Inline mode: always-open in-flow block, no collapsing sticky bar */
	.CartSummary.is-inline .CartSummary__mobile-bar {
		display: none;
	}

	.CartSummary.is-inline,
	.CartSummary.is-inline .CartSummary__details {
		display: block;
		max-height: none;
		overflow: visible;
		padding: 0;
		background: transparent;
	}

	/* No white tiles inside the grey order-details box */
	.CartSummary.is-inline .CartSummary__licence,
	.CartSummary.is-inline .CartSummary__package-row {
		background: transparent;
	}

	.CartSummary.is-inline .CartSummary__licence-main,
	.CartSummary.is-inline .CartSummary__package-row {
		padding-left: 0;
		padding-right: 0;
	}

	/* ── Mobile sticky bar ── */
	.CartSummary__mobile-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 14px 20px;
		background: var(--color-text);
		color: var(--color-bg);
		border: 0;
		cursor: pointer;
		font-family: 'Steiner', sans-serif;
	}

	.CartSummary__mobile-label {
		font-size: 12px;
		font-variation-settings: 'wght' 350;
		flex: 1;
		text-align: left;
	}

	.CartSummary__mobile-total {
		font-size: 14px;
		font-weight: var(--fw-strong);
	}

	.CartSummary__mobile-chevron {
		font-size: 10px;
		opacity: 0.7;
	}

	/* ── Details panel ── */
	.CartSummary__details {
		display: none;
		padding: 24px 20px;
		background: var(--color-bg-gray);
	}

	/* Mobile expanded */
	.CartSummary.is-expanded .CartSummary__details {
		display: block;
		max-height: calc(100vh - 120px);
		max-height: calc(100dvh - 120px);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
	}

	@media (min-width: 768px) {
		.CartSummary__mobile-bar {
			display: none;
		}

		.CartSummary__details {
			display: block;
			position: sticky;
			top: 80px;
			max-height: none;
			overflow-y: visible;
		}
	}

	.CartSummary__section {
		margin-bottom: 28px;
	}

	.CartSummary__heading {
		font-size: 11px;
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin: 0 0 10px;
	}

	.CartSummary__empty {
		font-size: 13px;
		color: var(--color-text-mute);
		line-height: 1.5;
	}

	/* ── Licences ── */
	.CartSummary__licences {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.CartSummary__licence {
		background: var(--color-bg);
		font-size: 13px;
	}

	.CartSummary__licence-main {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
	}

	.CartSummary__licence-type {
		font-weight: var(--fw-ui);
		flex-shrink: 0;
	}

	.CartSummary__licence-price {
		flex-shrink: 0;
		margin-left: auto;
		font-size: 12px;
		font-variation-settings: 'wght' 450;
		white-space: nowrap;
	}

	/* Who the licence names — company/purchaser (+ client for Project License),
	   and the declared headcount for context. */
	.CartSummary__licensee {
		margin: 0;
		padding: 0 14px 10px;
		font-size: 11px;
		line-height: 1.5;
		color: var(--color-text-mute);
	}

	.CartSummary__edit {
		flex-shrink: 0;
		background: transparent;
		border: 0;
		font: inherit;
		font-size: 11px;
		color: var(--color-text-mute);
		cursor: pointer;
		padding: 0 4px;
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 120ms;
	}

	.CartSummary__edit:hover {
		color: var(--color-text);
	}

	/* ── Packages list (Fonts section) ── */
	.CartSummary__packages {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.CartSummary__package-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: var(--color-bg);
		font-size: 13px;
	}

	.CartSummary__package-name {
		font-weight: var(--fw-ui);
	}

	.CartSummary__package-detail {
		color: var(--color-text-mute);
		font-size: 12px;
	}

	/* ── Totals ── */
	.CartSummary__totals {
		padding-top: 20px;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}

	.CartSummary__row {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 12px;
		align-items: baseline;
		font-size: 13px;
	}

	.CartSummary__row-amount {
		font-weight: var(--fw-strong);
		min-width: 80px;
		text-align: right;
	}

	.CartSummary__row--discount {
		color: #2e7d32;
	}

	.CartSummary__row--total {
		padding-top: 10px;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		font-size: 16px;
		font-weight: var(--fw-strong);
	}

	.CartSummary__row--total .CartSummary__row-amount {
		font-size: 16px;
		font-weight: 550;
	}

	/* ── Checkout ── */
	.CartSummary__checkout-btn {
		display: block;
		width: 100%;
		padding: 16px 16px;
		background: var(--color-text);
		color: var(--color-bg);
		font-family: 'Steiner', sans-serif;
		font-size: 14px;
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		border: 0;
		cursor: pointer;
		text-align: center;
		transition: opacity 150ms;
	}

	.CartSummary__checkout-btn:hover {
		opacity: 0.86;
	}

	.CartSummary__checkout-btn:disabled {
		opacity: 0.55;
		cursor: default;
	}

	.CartSummary__form {
		margin: 0;
	}

	/* Checkout failure message — announced (role=alert) above the button */
	.CartSummary__error {
		margin: 0 0 10px;
		padding: 10px 12px;
		border: 1px solid var(--color-accent, #b33030);
		color: var(--color-accent, #b33030);
		font-size: 12px;
		line-height: 1.5;
	}
</style>
