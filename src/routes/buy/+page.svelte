<script lang="ts">
	// /buy — August Type Foundry license purchase page.
	// Entry point is a font's own detail page: /buy?font=<TypefaceSlug>
	// (see fonts/[slug]/+page.svelte's Buy CTA), so the typeface itself is
	// never chosen here -- it arrives pre-decided from wherever the buyer
	// was actually convinced (specimens, glyph set, weights). Three-step
	// flow -- About you → Select styles -- with a running order summary.
	// The intake step comes first on purpose: rather than a free-browse
	// tier picker showing every tier's price side by side, it asks who the
	// licence is for and resolves the one tier whose per-style rate
	// applies (see LicenseIntake) -- no other tier's price is ever shown.
	// The actual total is tier × selected style count (see
	// $lib/data/pricing's computeEur), so it isn't known until Select
	// styles has a selection either -- this page is what joins the two.
	// No fallback picker yet for a cold /buy visit (no ?font) -- see the
	// August/Marketing session's 2026-08-29 note for the planned Phase 2
	// (multi-typeface picker once Alfred/Asta go on sale); today there's
	// only one real product, so falling back to it is enough.

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getFlatPackages, getPrice, getGrossPrice, formatPrice, type FlatPackage } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';
	import { computeTotal, EDUCATIONAL_ACTIVE } from '$lib/data/discounts';

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
	// this callback. Pricing the actual cart item happens below, once
	// Select styles' style count is also known.

	let resolvedTierIndex = $state<number | null>(null);
	let intakeMeta = $state<IntakeMeta>({ licenseeName: '', usageBand: null });

	function handleIntakeResolve(tierIndex: number | null, meta: IntakeMeta) {
		resolvedTierIndex = tierIndex;
		intakeMeta = meta;
	}

	// ── Typeface (from the URL, not chosen on this page) ──────────

	const TYPEFACES: FlatPackage[] = getFlatPackages();
	// ?font=<TypefaceSlug> from the referring font page; falls back to the
	// first (today, only) purchasable typeface for a cold /buy visit or an
	// unrecognised slug.
	const fontSlug = $derived(page.url.searchParams.get('font'));
	const selectedPackage = $derived(
		TYPEFACES.find((p) => p.typefaceSlug === fontSlug) ?? TYPEFACES[0] ?? null
	);

	// ── Select styles ────────────────────────────────────
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

	// PC: cart moves into a sticky 35% right-hand column (CartSummary's own
	// non-inline mode already builds this — position:sticky, top:80px — it
	// was just never driven by a real breakpoint check before). Mobile keeps
	// today's always-open inline block. Same matchMedia + resize-listener
	// pattern as GlyphSpecimen.svelte's isSmall, for the same belt-and-braces
	// reason (some embedded/emulated viewports resize without firing the
	// media-query change event). Defaults to true (mobile-safe) until mount
	// resolves the real value, so SSR/first paint never assumes desktop.
	let isSmall = $state(true);

	onMount(() => {
		const mq = window.matchMedia('(max-width: 767px)');
		isSmall = mq.matches;
		const onChange = () => (isSmall = mq.matches);
		mq.addEventListener('change', onChange);
		window.addEventListener('resize', onChange);
		return () => {
			mq.removeEventListener('change', onChange);
			window.removeEventListener('resize', onChange);
		};
	});

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

	// Headline names the typeface the buyer arrived to buy, rather than the
	// generic tagline this page used before a typeface was ever pre-decided.
	const heroHeading = $derived(selectedPackage ? `Make ${selectedPackage.label} yours.` : 'Make it yours.');
	const pageTitle = $derived(selectedPackage ? `Buy ${selectedPackage.label}` : 'Buy');
</script>

<svelte:head>
	<title>{pageTitle} — August Type Foundry</title>
	<meta
		name="description"
		content="Purchase {selectedPackage?.label ?? 'Asger'} — a 20-weight variable family. One license per organisation size, covering desktop, web, app, and broadcast."
	/>
</svelte:head>

<div class="BuyPage">
	<div class="BuyPage__grid">
		<!-- Left column (PC: 65%) — everything that isn't the running order. -->
		<div class="BuyPage__main">
			<!-- Page header -->
			<div class="BuyPage__top">
				<div class="BuyPage__title-block">
					<h1 class="BuyPage__heading">{heroHeading}</h1>
					<p class="BuyPage__sub">Tell us who it's for, then pick your weights. Pay once, yours to keep.</p>
				</div>
			</div>

			<!-- Step 1 — About you (intake). Comes before Typeface on purpose — see
			     the script header comment. Required fields are marked (*) inside
			     LicenseIntake itself — Steps 2/3 stay hidden until it resolves. -->
			<div class="BuyStep" id="step-1">
				<p class="BuyStep__eyebrow">1 — About you</p>
				<LicenseIntake packages={selectedPackage ? [selectedPackage] : []} onresolve={handleIntakeResolve} />
			</div>

			<!-- Select styles only appears once Step 1 has actually resolved a
			     tier — picking weights before that has nothing to price
			     against, so there was nothing stopping a buyer from filling it
			     in "out of order" and only discovering Step 1 was required at
			     checkout. Gating here makes the required-ness visible, not just
			     enforced. (No Typeface step: the typeface arrives fixed from
			     the referring font page's ?font= — see the script header
			     comment.) -->
			{#if resolvedTierIndex !== null}
				<!-- Select styles (informational: Complete always ships every
				     weight shown here at one price — this just lets a buyer mark the
				     ones they'll reach for first). -->
				{#if selectedPackage?.styles?.length}
					<div class="BuyStep">
						<p class="BuyStep__eyebrow">2 — Select styles</p>
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

				<!-- Educational discount — left out for now (2026-08-29, at the
				     user's request); see EDUCATIONAL_ACTIVE in $lib/data/discounts. -->
				{#if EDUCATIONAL_ACTIVE}
					<div class="BuyPage__options">
						<EducationalToggle checked={isStudent} onchange={(v: boolean) => (isStudent = v)} />
					</div>
				{/if}
			{/if}
		</div>

		<!-- Right column (PC: 35%, sticky) — order details. Empty state until a
		     license is chosen. inline={isSmall}: mobile keeps the always-open
		     block CartSummary has always rendered here; PC switches to its
		     built-in sticky-sidebar mode (position:sticky, top:80px) — see
		     isSmall above. -->
		<div class="BuyPage__cart">
			<CartSummary
				inline={isSmall}
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
			padding-inline: var(--padding);
			padding-bottom: 80px;
		}
	}

	/* ── Two-column split (PC only) ── referenced from Klim Type Foundry's
	   /buy: a 65/35 split, cart in the narrower right column. Nfr columns
	   (not calc(65% - gap/2)) for an exact split regardless of the gap — see
	   the Fonts/Custom grids elsewhere on the site for the same pattern.
	   Deliberately NOT align-items:start: position:sticky needs its own
	   parent (.BuyPage__cart, the grid item) to be as tall as the row so
	   there's room to travel in — align-items:start would shrink that item
	   to its own content height instead, leaving sticky nowhere to stick
	   (verified live: with start, cartDetailsTop went to -526px on scroll
	   instead of holding at 80px). Default align-items (stretch) is what
	   makes the sidebar pattern work: .BuyPage__cart stretches to match
	   .BuyPage__main's height, .CartSummary just sits at its top, and
	   .CartSummary__details' position:sticky tracks within that tall box.
	   Mobile stays a single block — both children just stack in source
	   order, same as before this split existed. */
	.BuyPage__grid {
		display: block;
	}

	@media (min-width: 768px) {
		.BuyPage__grid {
			display: grid;
			grid-template-columns: 65fr 35fr;
			gap: var(--gutter, 40px);
		}
	}

	.BuyPage__main {
		min-width: 0;
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

	/* ── Shared card elements ── originally Step 2's Typeface picker; that
	   picker is gone (the typeface arrives fixed from ?font=), but Select
	   styles' Complete Collection card below still reuses these inner
	   pieces (radio/body/name/detail/price) for their type styles. */
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
	/* Mobile: this wrapper supplies the grey box — CartSummary's own
	   is-inline mode deliberately clears its own background/padding to
	   defer to it (see CartSummary.svelte). PC: the reverse — CartSummary
	   is no longer inline there, so it supplies its own box (and its own
	   position:sticky) instead; this wrapper gets out of the way rather
	   than nesting a second box around it. */
	.BuyPage__cart {
		background: var(--color-bg-gray);
		padding: 24px 20px;
		max-width: 520px;
	}

	@media (min-width: 768px) {
		.BuyPage__cart {
			background: transparent;
			padding: 0;
			max-width: none;
			min-width: 0;
		}
	}
</style>
