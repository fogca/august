<script lang="ts">
	// /buy — August Type Foundry license purchase page.
	// Four-step flow: About you (intake) → Typeface → Weights, with a running
	// order summary. The intake step comes first and on purpose: rather than
	// a free-browse tier picker showing every tier's price side by side, it
	// asks who the licence is for, derives the one applicable tier from that
	// answer (see LicenseIntake / resolveTierForHeadcount), and only that one
	// price is ever shown from here on.
	// Only one product is on sale today (Asger), but Step 2 already
	// reads from getFlatPackages() rather than hardcoding it, so a second
	// typeface going on sale just adds a second card — no page changes.

	import { getFlatPackages, type FlatPackage } from '$lib/data/pricing';
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
	// resolved cart item (or null, while unresolved) + receipt metadata up
	// via this callback.

	let intakeItem = $state<CartItem | null>(null);
	let intakeMeta = $state<IntakeMeta>({
		path: null,
		licenseeName: '',
		clientName: '',
		totalHeadcount: null,
		usageBand: null
	});

	function handleIntakeResolve(item: CartItem | null, meta: IntakeMeta) {
		intakeItem = item;
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

	// ── Step 3: Weights ────────────────────────────────────────
	// Purely informational — Asger always delivers all 20 weights at
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

	let isStudent = $state(false);

	// ── Computed ────────────────────────────────────────────

	// Purely derived from the intake resolution × the selected typeface —
	// no separate mutation path, so there is nothing that can drift out of
	// sync with what the intake step actually resolved.
	const cartItems = $derived<CartItem[]>(
		intakeItem && selectedPackage ? [{ ...intakeItem, packageId: selectedPackage.id }] : []
	);

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

	/* ── Step 3: Weights ── */
	.WeightPanel {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 480px;
		/* White base, black grid lines — a checked row inverts to solid black
		   (StyleList's .is-on treatment), so the state read is a stark
		   white-to-black flip instead of grey-on-grey. Bordered for definition
		   against the page's own white background. */
		background: #ffffff;
		color: #000000;
		border: 1px solid var(--color-line);
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
