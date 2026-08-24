<script lang="ts">
	// /buy — August Type Foundry license purchase page.
	// Three-step flow (Klim Type Foundry-style): Typeface → License → Weights.
	// Only one product is on sale today (Asger Complete), but Step 1 already
	// reads from getFlatPackages() rather than hardcoding it, so a second
	// typeface going on sale just adds a second card — no page changes.

	import {
		LICENSES,
		getPrice,
		getGrossPrice,
		getFlatPackages,
		type FlatPackage
	} from '$lib/data/pricing';
	import type { LicenseType, Currency } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';
	import { computeTotal } from '$lib/data/discounts';

	import LicensePicker from '$lib/components/Buy/LicensePicker.svelte';
	import EducationalToggle from '$lib/components/Buy/EducationalToggle.svelte';
	import CartSummary from '$lib/components/Buy/CartSummary.svelte';
	import CurrencyToggle from '$lib/components/Buy/CurrencyToggle.svelte';
	import StyleList from '$lib/components/Buy/StyleList.svelte';
	import type { ActionData } from './$types';

	// Checkout action result — carries the error message when the action fails.
	let { form }: { form: ActionData } = $props();

	// ── Step 1: Typeface ──────────────────────────────────────

	const TYPEFACES: FlatPackage[] = getFlatPackages();
	// Pre-selected: today there is exactly one purchasable typeface, so
	// requiring a click before Steps 2/3 unlock would be pure friction. The
	// card is still a real, clickable step — the moment a second typeface
	// goes on sale this stops being a foregone conclusion.
	let selectedPackageId = $state<string | null>((TYPEFACES[0]?.id ?? null));
	const selectedPackage = $derived(TYPEFACES.find((p) => p.id === selectedPackageId) ?? null);

	function selectTypeface(id: string) {
		selectedPackageId = id;
	}

	// ── Step 3: Weights ────────────────────────────────────────
	// Purely informational — Asger Complete always delivers all 20 weights at
	// one price, so ticking weights off doesn't change what you receive or
	// what you pay. It's here so a buyer can mark the ones they'll reach for
	// first, and because a flat "here's everything" list is less useful than
	// one you can actually work with.

	let selectedWeights = $state<Set<string>>(new Set(selectedPackage?.styles ?? []));

	// Switching typeface (once there is more than one) resets to "all" for
	// the newly selected package rather than carrying over a stale Set.
	$effect(() => {
		selectedWeights = new Set(selectedPackage?.styles ?? []);
	});

	const allWeightsSelected = $derived(
		(selectedPackage?.styles?.length ?? 0) > 0 &&
			selectedWeights.size === (selectedPackage?.styles?.length ?? 0)
	);

	function toggleWeight(name: string) {
		const next = new Set(selectedWeights);
		if (next.has(name)) next.delete(name);
		else next.add(name);
		selectedWeights = next;
	}

	/** The one control "from the top" of the list — selects everything when
	 *  anything is missing, clears everything when it's already complete. */
	function toggleSelectAllWeights() {
		selectedWeights = allWeightsSelected ? new Set() : new Set(selectedPackage?.styles ?? []);
	}

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
		packageDef: selectedPackage,
		packageDefs: selectedPackage ? [selectedPackage] : []
	});

	const { subtotal, discounts, total } = $derived(computeTotal(cartState));

	// ── Handlers ────────────────────────────────────────────

	/** Build a cart item for a license × tier at the current currency. */
	function buildItem(licenseType: LicenseType, tierIndex: number): CartItem | null {
		if (!selectedPackage) return null;
		const license = LICENSES.find((l) => l.id === licenseType)!;
		const price = getPrice(selectedPackage, license, tierIndex, currency);
		const gross = getGrossPrice(selectedPackage, license, tierIndex, currency);
		if (price === null || gross === null) return null;
		return {
			licenseType,
			tierId: String(tierIndex),
			tierIndex,
			basePrice: price,
			grossPrice: gross,
			packageId: selectedPackage.id
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
		content="Purchase Asger Complete — a 20-weight variable family. Desktop, Web, App, and Books licenses available."
	/>
</svelte:head>

<div class="BuyPage">
	<!-- Page header -->
	<div class="BuyPage__top">
		<div class="BuyPage__title-block">
			<h1 class="BuyPage__heading">Make it yours.</h1>
			<p class="BuyPage__sub">Choose your typeface, license, and weights. Pay once, yours to keep.</p>
		</div>
		<!-- Currency toggle: always visible -->
		<div class="BuyPage__currency">
			<CurrencyToggle value={currency} onchange={handleCurrencyChange} />
		</div>
	</div>

	<!-- Step 1 — Typeface -->
	<div class="BuyStep">
		<p class="BuyStep__eyebrow">1 — Typeface</p>
		<div class="TypefaceList">
			{#each TYPEFACES as tf (tf.id)}
				{@const active = tf.id === selectedPackageId}
				<button
					type="button"
					class="TypefaceCard"
					class:is-active={active}
					onclick={() => selectTypeface(tf.id)}
					aria-pressed={active}
				>
					<span class="TypefaceCard__radio" aria-hidden="true">
						{#if active}<span class="TypefaceCard__dot"></span>{/if}
					</span>
					<span class="TypefaceCard__body">
						<span class="TypefaceCard__name">{tf.label}</span>
						<span class="TypefaceCard__intro">
							A humanist sans-serif for text and editorial — Johnston through Rotis.
						</span>
						<span class="TypefaceCard__detail">{tf.detail}</span>
					</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Step 2 — License -->
	<div class="BuyStep">
		<LicensePicker
			title="2 — License"
			{currency}
			{cartItems}
			{tierSelections}
			packages={selectedPackage ? [selectedPackage] : []}
			onselect={handleTierSelect}
			onremove={removeLicense}
			ontierstep={handleTierStep}
		/>
	</div>

	<!-- Step 3 — Weights (informational: Complete always ships every weight
	     shown here at one price — this just lets a buyer mark the ones
	     they'll reach for first). -->
	{#if selectedPackage?.styles?.length}
		<div class="BuyStep">
			<p class="BuyStep__eyebrow">3 — Weights</p>
			<div class="WeightPanel">
				<div class="WeightPanel__head">
					<span class="WeightPanel__count">
						{selectedWeights.size} / {selectedPackage.styles.length} selected
					</span>
					<button type="button" class="WeightPanel__all" onclick={toggleSelectAllWeights}>
						{allWeightsSelected ? 'Clear all' : 'Select all'}
					</button>
				</div>
				<StyleList
					pkg={selectedPackage}
					active
					selectable
					selected={selectedWeights}
					onToggle={toggleWeight}
				/>
			</div>
		</div>
	{/if}

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
			packageDefs={hasLicense && selectedPackage ? [selectedPackage] : []}
			errorMessage={form?.message ?? null}
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
		min-height: 100dvh;
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

	/* ── Steps (shared) ── */
	.BuyStep {
		margin-bottom: 40px;
	}

	/* Same visual language as LicensePicker's own eyebrow title (11px, muted) —
	   Step 2 passes this exact text in via LicensePicker's `title` prop instead
	   of duplicating a wrapper eyebrow, so all three read as one family. */
	.BuyStep__eyebrow {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin: 0 0 8px;
	}

	/* ── Step 1: Typeface ── */
	.TypefaceList {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.TypefaceCard {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		width: 100%;
		max-width: 480px;
		padding: 20px 18px 16px;
		background: var(--color-bg-gray);
		color: var(--color-text);
		border: 0;
		cursor: pointer;
		text-align: left;
		font: inherit;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	/* base.css sets color directly on every div/span/etc, which breaks the
	   inherit chain below (__body wraps __name/__intro/__detail, and __body
	   is itself a span the global rule repaints) — force every descendant to
	   actually inherit, same pattern as .Hero/.Alfred/.Asta on the home page. */
	.TypefaceCard :global(*) {
		color: inherit;
	}

	/* Selected: same colour inversion as an active LicensePicker card */
	.TypefaceCard.is-active {
		background: #222222;
		color: #ffffff;
	}

	.TypefaceCard__radio {
		width: 11px;
		height: 11px;
		margin-top: 4px;
		border: 1px solid currentColor;
		border-radius: 50%;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.TypefaceCard__dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: currentColor;
	}

	.TypefaceCard__body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.TypefaceCard__name {
		font-family: 'Steiner', sans-serif;
		font-size: 26px;
		font-weight: var(--fw-strong);
		line-height: 1.1;
		letter-spacing: 0;
		color: inherit;
	}

	.TypefaceCard__intro {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 350;
		line-height: 1.5;
		max-width: 380px;
		opacity: 0.7;
		color: inherit;
	}

	.TypefaceCard.is-active .TypefaceCard__intro,
	.TypefaceCard.is-active .TypefaceCard__detail {
		opacity: 1;
	}

	.TypefaceCard__detail {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		opacity: 0.55;
		color: inherit;
	}

	/* ── Step 3: Weights ── */
	.WeightPanel {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 480px;
		/* Always the dark/"active" ground StyleList's white-on-dark row dividers
		   assume — this step doesn't gate on a license being chosen. */
		background: #222222;
		color: #ffffff;
	}

	.WeightPanel__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 20px var(--padding) 14px;
	}

	.WeightPanel__count {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0;
	}

	/* The "from the top" select-all control */
	.WeightPanel__all {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		color: inherit;
		background: transparent;
		border: 0;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: opacity 0.15s ease;
	}

	.WeightPanel__all:hover {
		opacity: 0.7;
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
