<script lang="ts">
	// /buy — August Type Foundry license purchase page.
	// Four-step flow: About you (intake) → Typeface → Weights, with a running
	// order summary. The intake step comes first and on purpose: rather than
	// a free-browse tier picker showing every tier's price side by side, it
	// asks who the licence is for and resolves the one tier whose per-style
	// rate applies (see LicenseIntake) — no other tier's price is ever shown.
	// The actual total is tier × selected style count (see $lib/data/pricing's
	// computeEur), so it isn't known until Step 3 has a selection either —
	// this page is what joins the two.
	// Only one product is on sale today (Asger), but Step 2 already
	// reads from getFlatPackages() rather than hardcoding it, so a second
	// typeface going on sale just adds a second card — no page changes.

	import { getFlatPackages, getPrice, getGrossPrice, formatPrice, type FlatPackage } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';
	import { computeTotal } from '$lib/data/discounts';

	import LicenseIntake, { type IntakeMeta } from '$lib/components/Buy/LicenseIntake.svelte';
	import EducationalToggle from '$lib/components/Buy/EducationalToggle.svelte';
	import CartSummary from '$lib/components/Buy/CartSummary.svelte';
	import StyleList from '$lib/components/Buy/StyleList.svelte';
	import type { ActionData } from './$types';

	// Checkout action result — carries the error message when the action fails.
	let { form }: { form: ActionData } = $props();

	// ── Step 1: About you (intake) ───────────────────────────────
	// LicenseIntake owns its own field state internally and reports the
	// resolved tier (or null, while unresolved) + receipt metadata up via
	// this callback. Pricing the actual cart item happens below, once Step
	// 3's style count is also known.

	let resolvedTierIndex = $state<number | null>(null);
	let intakeMeta = $state<IntakeMeta>({ licenseeName: '', usageBand: null });

	function handleIntakeResolve(tierIndex: number | null, meta: IntakeMeta) {
		resolvedTierIndex = tierIndex;
		intakeMeta = meta;
	}

	// ── Step 2: Typeface ──────────────────────────────────────

	const TYPEFACES: FlatPackage[] = getFlatPackages();
	// Announced but not yet for sale — shown for completeness, greyed out and
	// inert (same idea as the Header menu's UPCOMING list). Not real
	// FlatPackages: no pricing exists for either yet.
	const UPCOMING_TYPEFACES: { name: string; detail: string }[] = [
		{ name: 'Alfred', detail: 'Neo Classic · in development' },
		{ name: 'Asta', detail: 'Sibling to Asger · in development' }
	];
	// Pre-selected: today there is exactly one purchasable typeface, so
	// requiring a click before Steps 2/3 unlock would be pure friction. The
	// card is still a real, clickable step — the moment a second typeface
	// goes on sale this stops being a foregone conclusion.
	let selectedPackageId = $state<string | null>((TYPEFACES[0]?.id ?? null));
	const selectedPackage = $derived(TYPEFACES.find((p) => p.id === selectedPackageId) ?? null);

	function selectTypeface(id: string) {
		selectedPackageId = id;
	}

	// ── Step 3: Select styles ────────────────────────────────────
	// Pricing is per-style (see $lib/data/pricing's computeEur): the tier
	// resolved in Step 1 sets a rate per style, and how many are selected
	// here sets the count that rate applies to. Selecting every style
	// (Complete Collection) earns a 50% discount off that rate; a
	// hand-picked subset (Individual) pays it straight — same total price
	// either way buys either the full 20 or half that count, on purpose.

	let selectedWeights = $state<Set<string>>(new Set(selectedPackage?.styles ?? []));

	// Switching typeface (once there is more than one) resets to "all" for
	// the newly selected package rather than carrying over a stale Set.
	$effect(() => {
		selectedWeights = new Set(selectedPackage?.styles ?? []);
	});

	function toggleWeight(name: string) {
		const next = new Set(selectedWeights);
		if (next.has(name)) next.delete(name);
		else next.add(name);
		selectedWeights = next;
	}

	function setsEqual(a: Set<string>, b: Set<string>): boolean {
		if (a.size !== b.size) return false;
		for (const v of a) if (!b.has(v)) return false;
		return true;
	}

	// Complete Collection — the same round-radio card as Typeface selection.
	// Reads "active" only while the current selection exactly matches the
	// full set, so a hand edit in the grid below honestly drops the
	// highlight instead of keeping a stale claim (see toggleComplete for why
	// that's a derived read, never a stored flag that could force a clear).
	const completeSet = $derived(new Set(selectedPackage?.styles ?? []));
	const isCompleteActive = $derived(completeSet.size > 0 && setsEqual(selectedWeights, completeSet));

	// A master toggle, not a one-way "select all": clicking while every
	// style is already selected clears to zero; clicking from any other
	// state (empty, a hand-picked subset, or a set that only used to be
	// complete before an individual deselect dropped it) selects every
	// style. isCompleteActive is purely derived from selectedWeights, so a
	// single deselect elsewhere never has to separately "remember" to also
	// zero this out -- it already isn't the source of truth for the count.
	function toggleComplete() {
		selectedWeights = isCompleteActive ? new Set() : new Set(completeSet);
	}

	// Complete Collection's price — null until Step 1 has resolved a tier
	// (no rate to price against yet).
	const completePrice = $derived(
		resolvedTierIndex !== null && selectedPackage
			? getPrice(selectedPackage, resolvedTierIndex, completeSet.size)
			: null
	);
	const completeGross = $derived(
		resolvedTierIndex !== null && selectedPackage
			? getGrossPrice(selectedPackage, resolvedTierIndex, completeSet.size)
			: null
	);

	// ── State ──────────────────────────────────────────────

	let isStudent = $state(false);

	// ── Computed ────────────────────────────────────────────

	// Joins Step 1's resolved tier with Step 3's selected style count — the
	// actual chargeable total isn't known until both exist, so this is where
	// the real CartItem gets priced (see $lib/data/pricing's computeEur).
	const cartItems = $derived.by<CartItem[]>(() => {
		if (resolvedTierIndex === null || !selectedPackage || selectedWeights.size === 0) return [];
		const price = getPrice(selectedPackage, resolvedTierIndex, selectedWeights.size);
		const gross = getGrossPrice(selectedPackage, resolvedTierIndex, selectedWeights.size);
		if (price === null || gross === null) return [];
		return [
			{
				kind: 'tier',
				tierIndex: resolvedTierIndex,
				basePrice: price,
				grossPrice: gross,
				packageId: selectedPackage.id
			}
		];
	});

	const hasLicense = $derived(cartItems.length > 0);

	const cartState = $derived({
		items: cartItems,
		isStudent,
		packageDef: selectedPackage,
		packageDefs: selectedPackage ? [selectedPackage] : []
	});

	const { subtotal, discounts, total } = $derived(computeTotal(cartState));
</script>

<svelte:head>
	<title>Buy — August Type Foundry</title>
	<meta
		name="description"
		content="Purchase Asger — a 20-weight variable family. One license per organisation size, covering desktop, web, app, and broadcast."
	/>
</svelte:head>

<div class="BuyPage">
	<!-- Page header -->
	<div class="BuyPage__top">
		<div class="BuyPage__title-block">
			<h1 class="BuyPage__heading">Make it yours.</h1>
			<p class="BuyPage__sub">Tell us who it's for, then pick your typeface and weights. Pay once, yours to keep.</p>
		</div>
	</div>

	<!-- Step 1 — About you (intake). Comes before Typeface on purpose — see
	     the script header comment. -->
	<div class="BuyStep" id="step-1">
		<p class="BuyStep__eyebrow">1 — About you</p>
		<LicenseIntake packages={selectedPackage ? [selectedPackage] : []} onresolve={handleIntakeResolve} />
	</div>

	<!-- Step 2 — Typeface -->
	<div class="BuyStep">
		<p class="BuyStep__eyebrow">2 — Typeface</p>
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
			<!-- Deliberately a div, not a button: nothing to sell yet, so nothing
			     to click — same treatment as the Header menu's UPCOMING list. -->
			{#each UPCOMING_TYPEFACES as tf (tf.name)}
				<div class="TypefaceCard is-disabled" aria-disabled="true">
					<span class="TypefaceCard__radio" aria-hidden="true"></span>
					<span class="TypefaceCard__body">
						<span class="TypefaceCard__name">{tf.name}</span>
						<span class="TypefaceCard__detail">{tf.detail}</span>
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Step 3 — Select styles (informational: Complete always ships every
	     weight shown here at one price — this just lets a buyer mark the
	     ones they'll reach for first). -->
	{#if selectedPackage?.styles?.length}
		<div class="BuyStep">
			<p class="BuyStep__eyebrow">3 — Select styles</p>
			<div class="WeightPanel">
				<!-- Complete Collection — same round-radio card as Typeface
				     selection, formatted identically to it: name, "N weights"
				     detail, price at the right (struck-through gross → the
				     discounted final, once Step 1 has resolved a rate). -->
				<button
					type="button"
					class="WeightPanel__collection"
					class:is-active={isCompleteActive}
					onclick={toggleComplete}
					aria-pressed={isCompleteActive}
				>
					<span class="TypefaceCard__radio" aria-hidden="true">
						{#if isCompleteActive}<span class="TypefaceCard__dot"></span>{/if}
					</span>
					<span class="TypefaceCard__body">
						<span class="TypefaceCard__name">Complete Collection</span>
						<span class="TypefaceCard__detail">{selectedPackage.styles.length} weights</span>
					</span>
					{#if completePrice !== null}
						<span class="TypefaceCard__price">
							{#if completeGross !== null && completeGross > completePrice}
								<span class="TypefaceCard__price-gross">{formatPrice(completeGross)}</span>
							{/if}
							<span class="TypefaceCard__price-final">{formatPrice(completePrice)}</span>
						</span>
					{/if}
				</button>

				<StyleList
					pkg={selectedPackage}
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
			items={cartItems}
			{intakeMeta}
			{subtotal}
			{discounts}
			{total}
			packageDefs={hasLicense && selectedPackage ? [selectedPackage] : []}
			selectedStyles={hasLicense ? [...selectedWeights] : []}
			errorMessage={form?.message ?? null}
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

	/* ── Title row ── */
	.BuyPage__top {
		margin-bottom: 40px;
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

	/* ── Steps (shared) ── */
	.BuyStep {
		margin-bottom: 40px;
	}

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

	/* Selected: same colour inversion as an active LicenseIntake path card */
	.TypefaceCard.is-active {
		background: #222222;
		color: #ffffff;
	}

	/* Announced, not yet for sale: same grey card, dimmed and inert — never a
	   hover state, never a click. */
	.TypefaceCard.is-disabled {
		opacity: 0.4;
		cursor: default;
		pointer-events: none;
		user-select: none;
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

	/* Optional right-aligned price slot — only Step 3's Complete Collection
	   card uses this; Step 2's typeface cards render without it. */
	.TypefaceCard__price {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
		margin-left: auto;
		padding-left: 12px;
	}

	.TypefaceCard__price-gross {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		text-decoration: line-through;
		opacity: 0.5;
		color: inherit;
	}

	.TypefaceCard__price-final {
		font-family: 'Steiner', sans-serif;
		font-size: 15px;
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		color: inherit;
	}

	/* ── Step 3: Select styles ── */
	.WeightPanel {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 480px;
		/* Same light-card language as Step 1/2 — bordered, not filled, so the
		   long style list underneath doesn't read as a heavy block. Selection
		   in StyleList reads through opacity, not a background invert, so
		   there's no dark state to design around here any more. */
		background: var(--color-bg);
		color: var(--color-text);
		border: 1px solid var(--color-line);
	}

	/* Complete Collection — full-bleed against the panel's own border (no
	   side padding, no wrapping card of its own): a master toggle for the
	   style grid below, not a separate box floating inside the panel.
	   Reuses .TypefaceCard's inner elements (radio/body/name/detail/price)
	   for their type styles, but NOT .TypefaceCard itself or its .is-active
	   dark-invert -- unselected/selected here reads through opacity + a
	   light grey fill, same language as the style grid below it, not a
	   black card. */
	.WeightPanel__collection {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 14px;
		padding: 20px var(--padding);
		background: transparent;
		color: var(--color-text);
		border: 0;
		cursor: pointer;
		text-align: left;
		font: inherit;
		opacity: 0.5;
		transition:
			opacity 150ms ease,
			background-color 150ms ease;
	}

	.WeightPanel__collection:hover {
		opacity: 0.75;
	}

	.WeightPanel__collection.is-active {
		background: var(--color-bg-gray);
		opacity: 1;
	}

	.WeightPanel__collection :global(*) {
		color: inherit;
	}

	/* The whole card fades as one unit via its own opacity above -- don't
	   also stack .TypefaceCard__detail's own opacity on top of that. */
	.WeightPanel__collection .TypefaceCard__detail {
		opacity: 1;
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
