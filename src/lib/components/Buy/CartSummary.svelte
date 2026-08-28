<script lang="ts">
	// Cart summary — single License selection + selected typeface package(s).
	// Tier changes use an inline dropdown; Project License has no tier to change.
	import { enhance } from '$app/forms';
	import {
		formatPrice,
		getTierName,
		TIER_DEFS,
		getPrice,
		getGrossPrice,
		PROJECT_LICENSE_LABEL
	} from '$lib/data/pricing';
	import type { PackageDef } from '$lib/data/pricing';
	import type { CartItem, AppliedDiscount } from '$lib/data/discounts';

	interface Props {
		items: CartItem[];
		subtotal: number;
		discounts: AppliedDiscount[];
		total: number;
		/** All selected packages (multi-package support). */
		packageDefs: PackageDef[];
		mobileExpanded?: boolean;
		onMobileToggle?: () => void;
		onremove: () => void;
		/** Called when a tier is changed inline from the cart. */
		onTierChange: (item: CartItem) => void;
		/** Remove a font package from the order. */
		onremovepackage: (packageId: string) => void;
		/** Render as an always-open in-flow block (no collapsing sticky bar). */
		inline?: boolean;
		/** Educational discount active — forwarded to checkout. */
		isStudent?: boolean;
		/** Checkout action failure message (from the page's `form` prop). */
		errorMessage?: string | null;
	}

	let {
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
		isStudent = false,
		errorMessage = null
	}: Props = $props();

	const hasItems = $derived(items.length > 0);

	// True while the checkout POST is in flight (until Stripe redirect unloads the page)
	let submitting = $state(false);

	// Shows the inline custom-quote notice when the Global tier is picked
	let enterpriseNotice = $state(false);

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

	/**
	 * Change tier for the active selection across all packages (from the cart
	 * dropdown). The Global tier (multiplier null) has no self-serve price:
	 * keep the cart untouched, revert the select, and show an inline
	 * custom-quote notice instead of hard-navigating away. No-op for a
	 * Project License selection — it has no tier to change.
	 */
	function setTier(next: number, el?: HTMLSelectElement) {
		if (!activeItem || activeItem.kind !== 'tier') return;
		const current = activeItem.tierIndex ?? 1;
		if (next === current) return;

		const tier = TIER_DEFS.find((t) => t.index === next);
		if (tier?.multiplier === null) {
			if (el) el.value = String(current);
			enterpriseNotice = true;
			return;
		}
		enterpriseNotice = false;

		for (const pkg of packageDefs) {
			const price = getPrice(pkg, next);
			const gross = getGrossPrice(pkg, next);
			if (price === null || gross === null) continue;
			const existingItem = items.find((i) => i.packageId === pkg.id);
			if (!existingItem) continue;
			onTierChange({ ...existingItem, tierIndex: next, basePrice: price, grossPrice: gross });
		}
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
			<p class="CartSummary__empty">Choose a licence type and font package to begin.</p>
		{:else}
			<!-- License section -->
			{#if activeItem}
				<section class="CartSummary__section">
					<h3 class="CartSummary__heading">License</h3>
					<ul class="CartSummary__licences">
						<li class="CartSummary__licence">
							<div class="CartSummary__licence-main">
								<span class="CartSummary__licence-type">{licenseName(activeItem)}</span>
								{#if activeItem.kind === 'tier'}
									<!-- Tier select -->
									<select
										class="CartSummary__select"
										aria-label="License scale"
										value={activeItem.tierIndex}
										onchange={(e) => setTier(Number(e.currentTarget.value), e.currentTarget)}
									>
										{#each TIER_DEFS as t (t.index)}
											<option value={t.index}>{t.name} — {t.label}</option>
										{/each}
									</select>
								{/if}
								<span class="CartSummary__licence-price">{formatPrice(licensePrice())}</span>
								<button
									type="button"
									class="CartSummary__remove"
									onclick={() => {
										enterpriseNotice = false;
										onremove();
									}}
									aria-label={`Remove ${licenseName(activeItem)} license`}
								>×</button>
							</div>
							{#if enterpriseNotice}
								<p class="CartSummary__enterprise" role="status">
									This scale requires a custom quote — <a href="/contact">contact us</a>.
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

	.CartSummary__licence-price {
		flex-shrink: 0;
		font-size: 12px;
		font-variation-settings: 'wght' 450;
		white-space: nowrap;
	}

	/* Inline enterprise-quote notice (replaces the old hard redirect to /contact) */
	.CartSummary__enterprise {
		margin: 0;
		padding: 0 14px 10px;
		font-size: 11px;
		line-height: 1.5;
		color: var(--color-text);
	}

	.CartSummary__enterprise a {
		text-decoration: underline;
		text-underline-offset: 2px;
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
