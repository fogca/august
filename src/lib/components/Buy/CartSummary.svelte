<script lang="ts">
	// Cart summary — License > Fonts hierarchy.
	// Supports multiple selected packages.
	// Tier changes use arrow stepper instead of dropdown.
	import { formatPrice, getLicense, getTierLabel, TIER_DEFS, getPrice, getGrossPrice } from '$lib/data/pricing';
	import type { Currency, LicenseType, PackageDef } from '$lib/data/pricing';
	import type { CartItem, AppliedDiscount } from '$lib/data/discounts';

	interface Props {
		currency: Currency;
		items: CartItem[];
		subtotal: number;
		discounts: AppliedDiscount[];
		total: number;
		/** All selected packages (multi-package support). */
		packageDefs: PackageDef[];
		mobileExpanded?: boolean;
		onMobileToggle?: () => void;
		onremove: (licenseType: LicenseType) => void;
		/** Called when a tier is changed inline from the cart. */
		onTierChange: (item: CartItem) => void;
		/** Remove a font package from the order. */
		onremovepackage: (packageId: string) => void;
		/** Render as an always-open in-flow block (no collapsing sticky bar). */
		inline?: boolean;
		/** Educational discount active — forwarded to checkout. */
		isStudent?: boolean;
	}

	let {
		currency,
		items,
		subtotal,
		discounts,
		total,
		packageDefs,
		mobileExpanded = false,
		onMobileToggle,
		onremove,
		onTierChange,
		onremovepackage,
		inline = false,
		isStudent = false
	}: Props = $props();

	const hasItems = $derived(items.length > 0);

	// Deduplicated list of active license types (in cart)
	const activeLicenses = $derived<LicenseType[]>(
		[...new Set(items.map((i) => i.licenseType))]
	);

	/**
	 * Get current tier index for a given license+package combo.
	 * All packages share the same tier per license, so we can use any matching item.
	 */
	function currentTierIndex(lt: LicenseType): number {
		return items.find((i) => i.licenseType === lt)?.tierIndex ?? 1;
	}

	function tierOptionLabel(lt: LicenseType, tierIndex: number): string {
		return getTierLabel(getLicense(lt), tierIndex);
	}

	/**
	 * Set the tier for a license across all packages (from the cart dropdown).
	 */
	function setTier(lt: LicenseType, next: number) {
		const current = currentTierIndex(lt);
		if (next === current) return;

		const tier = TIER_DEFS.find((t) => t.index === next);
		if (tier?.multiplier === null) {
			window.location.href = '/contact';
			return;
		}

		const license = getLicense(lt);
		for (const pkg of packageDefs) {
			const price = getPrice(pkg, license, next, currency);
			const gross = getGrossPrice(pkg, license, next, currency);
			if (price === null || gross === null) continue;
			const existingItem = items.find((i) => i.licenseType === lt && i.packageId === pkg.id);
			if (!existingItem) continue;
			onTierChange({
				...existingItem,
				tierId: String(next),
				tierIndex: next,
				basePrice: price,
				grossPrice: gross
			});
		}
	}

	function licenseLabel(lt: LicenseType): string {
		return getLicense(lt).label;
	}
</script>

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
			{#if hasItems}
				{activeLicenses.length} licence{activeLicenses.length > 1 ? 's' : ''} selected
			{:else}
				No licence selected
			{/if}
		</span>
		<span class="CartSummary__mobile-total" aria-live="polite" role="status">
			{hasItems ? formatPrice(total, currency) : '—'}
		</span>
		<span class="CartSummary__mobile-chevron" aria-hidden="true">
			{mobileExpanded ? '▾' : '▴'}
		</span>
	</button>

	<!-- Cart details panel -->
	<div class="CartSummary__details" id="cart-details" aria-live="polite" role="status">
		{#if !hasItems}
			<h3 class="CartSummary__heading">Your order</h3>
			<p class="CartSummary__empty">Choose a licence type and font package to begin.</p>
		{:else}
			<!-- License section -->
			<section class="CartSummary__section">
				<h3 class="CartSummary__heading">License</h3>
				<ul class="CartSummary__licences">
					{#each activeLicenses as lt (lt)}
						{@const tierIndex = currentTierIndex(lt)}
						<li class="CartSummary__licence">
							<div class="CartSummary__licence-main">
								<span class="CartSummary__licence-type">{licenseLabel(lt)}</span>
								<!-- Tier select -->
								<select
									class="CartSummary__select"
									aria-label={`${licenseLabel(lt)} scale`}
									value={tierIndex}
									onchange={(e) => setTier(lt, Number(e.currentTarget.value))}
								>
									{#each TIER_DEFS as t (t.index)}
										<option value={t.index}>{tierOptionLabel(lt, t.index)}</option>
									{/each}
								</select>
								<button
									type="button"
									class="CartSummary__remove"
									onclick={() => onremove(lt)}
									aria-label={`Remove ${licenseLabel(lt)} license`}
								>×</button>
							</div>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Fonts section — list all selected packages -->
			{#if packageDefs.length > 0}
				<section class="CartSummary__section">
					<h3 class="CartSummary__heading">Fonts</h3>
					<ul class="CartSummary__packages">
						{#each packageDefs as pkg (pkg.id)}
							<li class="CartSummary__package-row">
								<span class="CartSummary__package-name">{pkg.label}</span>
								<span class="CartSummary__package-detail">{pkg.detail}</span>
								<button
									type="button"
									class="CartSummary__remove"
									onclick={() => onremovepackage(pkg.id)}
									aria-label={`Remove ${pkg.label}`}
								>×</button>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<!-- Totals -->
			<section class="CartSummary__totals">
				<div class="CartSummary__row">
					<span>Subtotal</span>
					<span class="CartSummary__row-currency">{currency}</span>
					<span class="CartSummary__row-amount">{formatPrice(subtotal, currency)}</span>
				</div>

				{#each discounts as discount (discount.id + discount.label)}
					<div class="CartSummary__row CartSummary__row--discount">
						<span>{discount.label}</span>
						<span class="CartSummary__row-currency">{currency}</span>
						<span class="CartSummary__row-amount">−{formatPrice(discount.amount, currency)}</span>
					</div>
				{/each}

				<div class="CartSummary__row CartSummary__row--total">
					<span>Total</span>
					<span class="CartSummary__row-currency">{currency}</span>
					<span class="CartSummary__row-amount">{formatPrice(total, currency)}</span>
				</div>
			</section>

			<!-- Checkout -->
			<form method="POST" action="?/checkout" class="CartSummary__form">
				<input type="hidden" name="currency" value={currency} />
				<input type="hidden" name="educational" value={isStudent ? '1' : '0'} />
				{#each packageDefs as pkg}
					<input type="hidden" name="package_id" value={pkg.id} />
				{/each}
				{#each items as item}
					<input type="hidden" name="item_license" value={item.licenseType} />
					<input type="hidden" name="item_tier" value={item.tierId} />
					<input type="hidden" name="item_price" value={item.basePrice} />
					<input type="hidden" name="item_package" value={item.packageId} />
				{/each}
				<button type="submit" class="CartSummary__checkout-btn">Checkout</button>
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

	/* ── Tier select (in cart) ── */
	.CartSummary__select {
		flex: 1;
		min-width: 0;
		max-width: 180px;
		margin-left: auto;
		padding: 6px 28px 6px 10px;
		background: var(--color-bg);
		border: 1px solid var(--color-line);
		border-radius: 0;
		cursor: pointer;
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		color: var(--color-text);
		letter-spacing: 0;
		-webkit-appearance: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23000' fill='none' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 10px center;
		transition: border-color 120ms;
	}

	.CartSummary__select:hover {
		border-color: var(--color-text);
	}

	.CartSummary__remove {
		background: transparent;
		border: 0;
		font: inherit;
		font-size: 18px;
		line-height: 1;
		color: var(--color-text-mute);
		cursor: pointer;
		padding: 0 4px;
		flex-shrink: 0;
		transition: color 120ms;
	}

	.CartSummary__remove:hover {
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

	.CartSummary__package-row .CartSummary__remove {
		margin-left: auto;
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
		grid-template-columns: 1fr auto auto;
		gap: 12px;
		align-items: baseline;
		font-size: 13px;
	}

	.CartSummary__row-currency {
		font-size: 11px;
		opacity: 0.55;
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

	.CartSummary__form {
		margin: 0;
	}
</style>
