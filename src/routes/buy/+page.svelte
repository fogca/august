<script lang="ts">
	// /buy — August Type Foundry license purchase page (minimal, single product)
	// One product: Steiner Complete — 40 styles (20 weights × Roman & Italic).
	// Flow: Currency → License (type + tier) → Checkout (Stripe).

	import { LICENSES, TYPEFACE_PRICING, getPrice, getGrossPrice } from '$lib/data/pricing';
	import type { LicenseType, Currency, PackageDef } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';
	import { computeTotal } from '$lib/data/discounts';

	import LicensePicker from '$lib/components/Buy/LicensePicker.svelte';
	import EducationalToggle from '$lib/components/Buy/EducationalToggle.svelte';
	import CartSummary from '$lib/components/Buy/CartSummary.svelte';
	import CurrencyToggle from '$lib/components/Buy/CurrencyToggle.svelte';
	import StyleList from '$lib/components/Buy/StyleList.svelte';

	// ── The single product ──────────────────────────────────

	const STEINER: PackageDef = TYPEFACE_PRICING[0].packages[0];

	// ── State ──────────────────────────────────────────────

	let tierSelections = $state<Map<LicenseType, number>>(new Map());
	let cartItems = $state<CartItem[]>([]);
	let currency = $state<Currency>('EUR');
	let isStudent = $state(false);

	// ── Computed ────────────────────────────────────────────

	const hasLicense = $derived(cartItems.length > 0);

	const cartState = $derived({
		currency,
		items: cartItems,
		isStudent,
		packageDef: STEINER,
		packageDefs: [STEINER]
	});

	const { subtotal, discounts, total } = $derived(computeTotal(cartState));

	// ── Handlers ────────────────────────────────────────────

	/** Build a cart item for a license × tier at the current currency. */
	function buildItem(licenseType: LicenseType, tierIndex: number): CartItem | null {
		const license = LICENSES.find((l) => l.id === licenseType)!;
		const price = getPrice(STEINER, license, tierIndex, currency);
		const gross = getGrossPrice(STEINER, license, tierIndex, currency);
		if (price === null || gross === null) return null;
		return {
			licenseType,
			tierId: String(tierIndex),
			tierIndex,
			basePrice: price,
			grossPrice: gross,
			packageId: STEINER.id
		};
	}

	/** License toggled on, or tier changed on an active license. */
	function handleTierSelect(item: CartItem) {
		const next = new Map(tierSelections);
		next.set(item.licenseType, item.tierIndex);
		tierSelections = next;

		const built = buildItem(item.licenseType, item.tierIndex);
		if (!built) return;
		const idx = cartItems.findIndex((i) => i.licenseType === item.licenseType);
		cartItems =
			idx >= 0 ? cartItems.map((ci, i) => (i === idx ? built : ci)) : [...cartItems, built];
	}

	/** Tier changed inline from the cart. */
	function handleTierChange(item: CartItem) {
		cartItems = cartItems.map((ci) => (ci.licenseType === item.licenseType ? item : ci));
		const next = new Map(tierSelections);
		next.set(item.licenseType, item.tierIndex);
		tierSelections = next;
	}

	/** Stepper used on an inactive license card — preview only. */
	function handleTierStep(lt: LicenseType, tierIndex: number) {
		const next = new Map(tierSelections);
		next.set(lt, tierIndex);
		tierSelections = next;
	}

	function removeLicense(licenseType: LicenseType) {
		tierSelections = new Map([...tierSelections].filter(([k]) => k !== licenseType));
		cartItems = cartItems.filter((i) => i.licenseType !== licenseType);
	}

	function handleCurrencyChange(c: Currency) {
		currency = c;
		cartItems = cartItems
			.map((i) => buildItem(i.licenseType, i.tierIndex))
			.filter((i): i is CartItem => i !== null);
	}
</script>

<svelte:head>
	<title>Buy — August Type Foundry</title>
	<meta
		name="description"
		content="Purchase Steiner Complete — 40 styles. Desktop, Web, App, and Books licenses available."
	/>
</svelte:head>

<div class="BuyPage">
	<!-- Page header -->
	<div class="BuyPage__top">
		<div class="BuyPage__title-block">
			<h1 class="BuyPage__heading">Make it yours.</h1>
			<p class="BuyPage__sub">
				Steiner Complete — every weight, every italic. Choose a license, pay once, yours to keep.
			</p>
		</div>
		<!-- Currency toggle: always visible -->
		<div class="BuyPage__currency">
			<CurrencyToggle value={currency} onchange={handleCurrencyChange} />
		</div>
	</div>

	<!-- The product -->
	<div class="BuyPage__product">
		<div class="BuyPage__product-card" class:is-active={hasLicense}>
			<div class="BuyPage__product-head">
				<span class="BuyPage__product-name">{STEINER.label}</span>
				<span class="BuyPage__product-intro">
					A humanist sans-serif for text and editorial — Johnston through Rotis.
				</span>
				<span class="BuyPage__product-detail">{STEINER.detail}</span>
			</div>
			<StyleList pkg={STEINER} active={hasLicense} />
		</div>
	</div>

	<!-- License selection -->
	<LicensePicker
		{currency}
		{cartItems}
		{tierSelections}
		packages={[STEINER]}
		onselect={handleTierSelect}
		onremove={removeLicense}
		ontierstep={handleTierStep}
	/>

	<!-- Educational discount -->
	<div class="BuyPage__options">
		<EducationalToggle checked={isStudent} onchange={(v: boolean) => (isStudent = v)} />
	</div>

	<!-- Order details — empty state until a license is chosen -->
	<div class="BuyPage__cart">
		<CartSummary
			inline
			{isStudent}
			{currency}
			items={cartItems}
			{subtotal}
			{discounts}
			{total}
			packageDefs={hasLicense ? [STEINER] : []}
			onremove={removeLicense}
			onremovepackage={() => (cartItems = [])}
			onTierChange={handleTierChange}
		/>
	</div>
</div>

<style>
	/* ── Page shell ── */
	.BuyPage {
		min-height: 100vh;
		padding-top: 20vh;
		padding-bottom: 120px;
		padding-inline: 20px;
	}

	@media (min-width: 768px) {
		.BuyPage {
			padding-inline: 48px;
			padding-bottom: 80px;
		}
	}

	/* ── Title + currency row ── */
	.BuyPage__top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24px;
		margin-bottom: 40px;
		flex-wrap: wrap;
	}

	.BuyPage__heading {
		font-family: 'Steiner', sans-serif;
		font-size: clamp(32px, 6vw, 64px);
		letter-spacing: 0;
		line-height: 1;
		margin-bottom: 6px;
	}

	.BuyPage__sub {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	.BuyPage__currency {
		padding-top: 4px;
		flex-shrink: 0;
	}

	/* ── Product card ── */
	.BuyPage__product {
		margin-bottom: 40px;
	}

	.BuyPage__product-card {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 480px;
		background: var(--color-bg-gray);
		color: var(--color-text);
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	/* Active (license chosen) = colour inversion */
	.BuyPage__product-card.is-active {
		background: #222222;
		color: #ffffff;
	}

	.BuyPage__product-card.is-active .BuyPage__product-intro,
	.BuyPage__product-card.is-active .BuyPage__product-detail {
		opacity: 1;
	}

	.BuyPage__product-head {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 40px var(--padding) 30px;
	}

	.BuyPage__product-name {
		font-family: 'Steiner', sans-serif;
		font-size: 26px;
		font-weight: var(--fw-strong);
		line-height: 1.1;
		letter-spacing: 0;
		color: inherit;
	}

	.BuyPage__product-intro {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 350;
		line-height: 1.5;
		max-width: 380px;
		opacity: 0.7;
		color: inherit;
	}

	.BuyPage__product-detail {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		opacity: 0.55;
		color: inherit;
	}

	/* ── Educational option ── */
	.BuyPage__options {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px 32px;
		margin: 0 0 32px;
	}

	/* ── Order details box ── */
	.BuyPage__cart {
		background: var(--color-bg-gray);
		padding: 24px 20px;
		max-width: 520px;
	}
</style>
