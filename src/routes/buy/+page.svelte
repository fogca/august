<script lang="ts">
	// /buy — August Type Foundry license purchase page
	// Flow: Currency (always visible) → License (type + tier via stepper) → Select Fonts (multi-select)

	import { onMount } from 'svelte';
	import {
		LICENSES,
		TYPEFACE_PRICING,
		getPrice,
		getGrossPrice,
		getFlatPackages,
		gqBaseEur,
		gqDiscountRate,
		GQ_PER_STYLE_EUR
	} from '$lib/data/pricing';
	import type { LicenseType, Currency, PackageDef, FlatPackage } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';
	import { computeTotal } from '$lib/data/discounts';

	import LicensePicker from '$lib/components/Buy/LicensePicker.svelte';
	import EducationalToggle from '$lib/components/Buy/EducationalToggle.svelte';
	import CartSummary from '$lib/components/Buy/CartSummary.svelte';
	import CurrencyToggle from '$lib/components/Buy/CurrencyToggle.svelte';
	import StyleList from '$lib/components/Buy/StyleList.svelte';

	// ── State ──────────────────────────────────────────────

	let selectedLicenseTypes = $state<LicenseType[]>([]);
	let tierSelections = $state<Map<LicenseType, number>>(new Map());
	let cartItems = $state<CartItem[]>([]);

	// Multiple font package selection — Set of package IDs
	let selectedPackageIds = $state<Set<string>>(new Set());

	// gQ is sold per-style: the buyer toggles individual weights; price scales by count.
	let selectedGqStyles = $state<Set<string>>(new Set());

	const flatPackages = getFlatPackages();

	/**
	 * Resolve a package for pricing. Selectable packages (gQ) get a dynamic
	 * baseEur derived from the number of selected styles + quantity discount.
	 */
	function resolvePackage(pkgId: string): FlatPackage | undefined {
		const base = flatPackages.find((p) => p.id === pkgId);
		if (!base) return undefined;
		if (base.selectable) {
			const count = selectedGqStyles.size;
			return {
				...base,
				styles: [...selectedGqStyles],
				detail: count > 0 ? `${count} weight${count > 1 ? 's' : ''}` : 'Choose weights',
				baseEur: gqBaseEur(count),
				grossEur: count * GQ_PER_STYLE_EUR,
				discountRate: gqDiscountRate(count)
			};
		}
		return base;
	}

	// Short intro per typeface, shown on each package card.
	const TYPEFACE_INTRO: Record<string, string> = {
		steiner: 'A humanist sans-serif for text and editorial — Johnston through Rotis.',
		gq: 'A display sans for logotypes and headlines.'
	};

	// Derive selected PackageDef array from Set (resolved → dynamic gQ price/detail)
	const selectedPackages = $derived<PackageDef[]>(
		[...selectedPackageIds].map((id) => resolvePackage(id)).filter((p): p is FlatPackage => !!p)
	);

	// Last selected package for StyleList display
	const lastSelectedPackage = $derived<PackageDef | null>(
		selectedPackages.length > 0 ? selectedPackages[selectedPackages.length - 1] : null
	);

	let currency = $state<Currency>('EUR');
	let isStudent = $state(false);

	// ── Computed ────────────────────────────────────────────

	const cartState = $derived({
		currency,
		items: cartItems,
		isStudent,
		packageDef: lastSelectedPackage,
		packageDefs: selectedPackages
	});

	const { subtotal, discounts, total } = $derived(computeTotal(cartState));

	const hasLicense = $derived(cartItems.length > 0);
	const hasPackage = $derived(selectedPackageIds.size > 0);

	// ── URL param — pre-select package from ?font= ──────────

	onMount(() => {
		const params = new URL(window.location.href).searchParams;
		const font = params.get('font');
		if (font) {
			const tf = TYPEFACE_PRICING.find((t) => t.slug === font);
			const firstFlat = flatPackages.find((p) => p.typefaceSlug === tf?.slug);
			if (firstFlat) togglePackage(firstFlat.id);
		}
	});

	// ── Handlers ────────────────────────────────────────────

	/**
	 * Toggle a package on/off.
	 * When adding: build CartItems for each active license + this package.
	 * When removing: remove all CartItems with this packageId.
	 */
	function togglePackage(pkgId: string) {
		const next = new Set(selectedPackageIds);
		if (next.has(pkgId)) {
			// Deselect — remove all cart items for this package
			next.delete(pkgId);
			selectedPackageIds = next;
			cartItems = cartItems.filter((i) => i.packageId !== pkgId);
		} else {
			// Select — add cart items for each currently active license
			next.add(pkgId);
			selectedPackageIds = next;
			addCartItemsForPackage(pkgId);
		}
	}

	/** Add cart items (one per active license) for a newly selected package. */
	function addCartItemsForPackage(pkgId: string) {
		const pkg = resolvePackage(pkgId);
		if (!pkg) return;
		// For each active license, create a cart item for this package
		const newItems: CartItem[] = [];
		for (const lt of selectedLicenseTypes) {
			// Skip if already exists (shouldn't happen, but guard)
			if (cartItems.some((i) => i.licenseType === lt && i.packageId === pkgId)) continue;
			const license = LICENSES.find((l) => l.id === lt)!;
			const tierIndex = tierSelections.get(lt) ?? 1;
			const price = getPrice(pkg, license, tierIndex, currency);
			const gross = getGrossPrice(pkg, license, tierIndex, currency);
			if (price === null || gross === null) continue;
			newItems.push({
				licenseType: lt,
				tierId: String(tierIndex),
				tierIndex,
				basePrice: price,
				grossPrice: gross,
				packageId: pkgId
			});
		}
		cartItems = [...cartItems, ...newItems];
	}

	/** Rebuild all cart items when currency changes. */
	function rebuildAllCartItems() {
		cartItems = cartItems.map((item) => {
			const pkg = resolvePackage(item.packageId);
			const license = LICENSES.find((l) => l.id === item.licenseType);
			if (!pkg || !license) return item;
			const price = getPrice(pkg, license, item.tierIndex, currency);
			const gross = getGrossPrice(pkg, license, item.tierIndex, currency);
			if (price === null || gross === null) return item;
			return { ...item, basePrice: price, grossPrice: gross };
		});
	}

	/** Rebuild cart items for one package (used when the gQ weight count changes). */
	function rebuildPackageItems(pkgId: string) {
		const pkg = resolvePackage(pkgId);
		if (!pkg) return;
		const updated = cartItems.filter((i) => i.packageId !== pkgId);
		for (const lt of selectedLicenseTypes) {
			const license = LICENSES.find((l) => l.id === lt)!;
			const tierIndex = tierSelections.get(lt) ?? 1;
			const price = getPrice(pkg, license, tierIndex, currency);
			const gross = getGrossPrice(pkg, license, tierIndex, currency);
			if (price === null || gross === null) continue;
			updated.push({
				licenseType: lt,
				tierId: String(tierIndex),
				tierIndex,
				basePrice: price,
				grossPrice: gross,
				packageId: pkgId
			});
		}
		cartItems = updated;
	}

	/** Toggle an individual gQ weight; keep the gq package + cart in sync. */
	function toggleGqStyle(name: string) {
		const next = new Set(selectedGqStyles);
		if (next.has(name)) next.delete(name);
		else next.add(name);
		selectedGqStyles = next;

		const id = 'gq-family';
		if (next.size > 0) {
			if (!selectedPackageIds.has(id)) selectedPackageIds = new Set(selectedPackageIds).add(id);
			rebuildPackageItems(id);
		} else {
			const ids = new Set(selectedPackageIds);
			ids.delete(id);
			selectedPackageIds = ids;
			cartItems = cartItems.filter((i) => i.packageId !== id);
		}
	}

	/** Remove a font package from the order (clears gQ style selection too). */
	function removePackage(pkgId: string) {
		if (pkgId === 'gq-family') selectedGqStyles = new Set();
		const ids = new Set(selectedPackageIds);
		ids.delete(pkgId);
		selectedPackageIds = ids;
		cartItems = cartItems.filter((i) => i.packageId !== pkgId);
	}

	function removeLicense(licenseType: LicenseType) {
		selectedLicenseTypes = selectedLicenseTypes.filter((t) => t !== licenseType);
		tierSelections = new Map([...tierSelections].filter(([k]) => k !== licenseType));
		cartItems = cartItems.filter((i) => i.licenseType !== licenseType);
	}

	/**
	 * Called when a license is toggled or its tier changes in LicensePicker.
	 * Creates/updates CartItems for every currently selected package.
	 */
	function handleTierSelect(item: CartItem) {
		const { licenseType, tierIndex } = item;

		// Track tier selection
		const next = new Map(tierSelections);
		next.set(licenseType, tierIndex);
		tierSelections = next;

		// Track active license types
		if (!selectedLicenseTypes.includes(licenseType)) {
			selectedLicenseTypes = [...selectedLicenseTypes, licenseType];
		}

		// Build/update cart items: one per selected package
		const license = LICENSES.find((l) => l.id === licenseType)!;

		if (selectedPackageIds.size === 0) {
			// No packages yet — store placeholder item (packageId = '')
			const existing = cartItems.findIndex(
				(i) => i.licenseType === licenseType && i.packageId === ''
			);
			const placeholder: CartItem = {
				licenseType,
				tierId: String(tierIndex),
				tierIndex,
				basePrice: 0,
				grossPrice: 0,
				packageId: ''
			};
			if (existing >= 0) {
				cartItems = cartItems.map((ci, idx) => (idx === existing ? placeholder : ci));
			} else {
				cartItems = [...cartItems, placeholder];
			}
			return;
		}

		// Update/create items for each selected package
		let updated = [...cartItems];
		for (const pkgId of selectedPackageIds) {
			const pkg = resolvePackage(pkgId);
			if (!pkg) continue;
			const price = getPrice(pkg, license, tierIndex, currency);
			const gross = getGrossPrice(pkg, license, tierIndex, currency);
			if (price === null || gross === null) continue;
			const newItem: CartItem = {
				licenseType,
				tierId: String(tierIndex),
				tierIndex,
				basePrice: price,
				grossPrice: gross,
				packageId: pkgId
			};
			const idx = updated.findIndex(
				(i) => i.licenseType === licenseType && i.packageId === pkgId
			);
			if (idx >= 0) {
				updated = updated.map((ci, i) => (i === idx ? newItem : ci));
			} else {
				updated = [...updated, newItem];
			}
		}
		cartItems = updated;
	}

	function handleTierChange(item: CartItem) {
		// Update matching cart item by licenseType + packageId
		cartItems = cartItems.map((ci) =>
			ci.licenseType === item.licenseType && ci.packageId === item.packageId ? item : ci
		);
		const next = new Map(tierSelections);
		next.set(item.licenseType, item.tierIndex);
		tierSelections = next;
	}

	function handleCurrencyChange(c: Currency) {
		currency = c;
		rebuildAllCartItems();
	}

	/**
	 * Called when stepper is used on an inactive license card.
	 * Only updates tierSelections without adding the license to the cart.
	 */
	function handleTierStep(lt: LicenseType, tierIndex: number) {
		const next = new Map(tierSelections);
		next.set(lt, tierIndex);
		tierSelections = next;
	}

	function handleStudentToggle(v: boolean) {
		isStudent = v;
	}
</script>

<svelte:head>
	<title>Buy — August Type Foundry</title>
	<meta name="description" content="Purchase August Type Foundry typefaces. Desktop, Web, App, and Books licenses available." />
</svelte:head>

<div class="BuyPage">
	<!-- Page header -->
	<div class="BuyPage__top">
		<div class="BuyPage__title-block">
			<h1 class="BuyPage__heading">Make it yours.</h1>
			<p class="BuyPage__sub">Choose a license type and scale, then select a font package — pay once, yours to keep.</p>
		</div>
		<!-- Currency toggle: always visible -->
		<div class="BuyPage__currency">
			<CurrencyToggle value={currency} onchange={handleCurrencyChange} />
		</div>
	</div>

	<!-- Step 1: License (always visible) -->
	<LicensePicker
		{currency}
		{cartItems}
		{tierSelections}
		packages={selectedPackages}
		onselect={handleTierSelect}
		onremove={removeLicense}
		ontierstep={handleTierStep}
	/>

	<!-- Step 2: Select Fonts (flat list, multi-select) -->
	<div class="BuyPage__packages">
		<h2 class="BuyPage__section-label">Select Fonts</h2>
		<div class="BuyPage__package-cards">
			{#each flatPackages as pkg (pkg.id)}
				{@const selectable = pkg.selectable === true}
				{@const active = selectable ? false : selectedPackageIds.has(pkg.id)}
				<!-- Steiner cards: click toggles the whole package.
				     gQ card (selectable): the StyleList rows toggle individual weights. -->
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="BuyPage__package-card"
					class:is-active={active}
					class:white={active}
					class:is-static={selectable}
					role={selectable ? undefined : 'button'}
					tabindex={selectable ? undefined : 0}
					aria-pressed={selectable ? undefined : active}
					onclick={selectable ? undefined : () => togglePackage(pkg.id)}
					onkeydown={selectable
						? undefined
						: (e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									togglePackage(pkg.id);
								}
							}}
				>
					<div class="BuyPage__package-head">
						<span class="BuyPage__package-name">{pkg.label}</span>
						{#if TYPEFACE_INTRO[pkg.typefaceSlug]}
							<span class="BuyPage__package-intro">{TYPEFACE_INTRO[pkg.typefaceSlug]}</span>
						{/if}
						<span class="BuyPage__package-detail">
							{#if selectable && selectedGqStyles.size > 0}
								{selectedGqStyles.size} weight{selectedGqStyles.size > 1 ? 's' : ''} selected
							{:else}
								{pkg.detail}
							{/if}
						</span>
					</div>
					{#if pkg.styles}
						<StyleList
							pkg={pkg}
							{active}
							{selectable}
							selected={selectedGqStyles}
							onToggle={toggleGqStyle}
						/>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Educational toggle (always visible once license or package touched) -->
	<div class="BuyPage__options">
		<EducationalToggle checked={isStudent} onchange={handleStudentToggle} />
	</div>

	<!-- Order details — always visible (shows an empty state until items are added) -->
	<div class="BuyPage__cart">
		<CartSummary
			inline
			{currency}
			items={cartItems}
			{subtotal}
			{discounts}
			{total}
			packageDefs={selectedPackages}
			onremove={removeLicense}
			onremovepackage={removePackage}
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
		font-variation-settings: 'wght' 400;
		letter-spacing: 0;
		line-height: 1;
		margin-bottom: 6px;
	}

	.BuyPage__sub {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 300;
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	.BuyPage__currency {
		padding-top: 4px;
		flex-shrink: 0;
	}

	/* ── Section label ── */
	.BuyPage__section-label {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin-bottom: 12px;
	}

	/* ── Package selector ── */
	.BuyPage__packages {
		margin-bottom: 40px;
	}

	.BuyPage__package-cards {
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.BuyPage__package-card {
		display: flex;
		flex-direction: column;
		gap: 0;
		width: 100%;
		max-width: 480px;
		padding: 0;
		background: var(--color-bg-gray);
		border: 1px solid transparent;
		cursor: pointer;
		text-align: left;
		color: var(--color-text);
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	/* gQ card is not a single toggle — its rows are; don't show a pointer on the card */
	.BuyPage__package-card.is-static {
		cursor: default;
	}

	/* Selected = colour inversion: dark grey background, all text white */
	.BuyPage__package-card.is-active {
		background: #222222;
		color: #ffffff;
	}

	.BuyPage__package-card.is-active .BuyPage__package-intro,
	.BuyPage__package-card.is-active .BuyPage__package-detail {
		opacity: 1;
	}

	.BuyPage__package-head {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 40px var(--padding) 30px;
	}

	.BuyPage__package-name {
		font-family: 'Steiner', sans-serif;
		font-size: 26px;
		font-variation-settings: 'wght' 500;
		line-height: 1.1;
		letter-spacing: 0;
		color: inherit;
	}

	.BuyPage__package-intro {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 350;
		line-height: 1.5;
		max-width: 380px;
		opacity: 0.7;
		color: inherit;
	}

	.BuyPage__package-detail {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 300;
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
