<script lang="ts">
	// /buy — Apres Guerre license purchase page.
	// Entry point is a font's own detail page: /buy?font=<TypefaceSlug>
	// (see fonts/[slug]/+page.svelte's Buy CTA), so the typeface itself is
	// never chosen here -- it arrives pre-decided from wherever the buyer
	// was actually convinced (specimens, glyph set, weights). A step flow --
	// About you → Select styles → Add another typeface → Brands and uses --
	// with a running order summary. Add another typeface lets the same order
	// take further typefaces (2026-11-05): the licence from Step 1 covers all
	// of them, and each has its own styles. Brands and uses (2026-11-06, for a
	// typeface sold with toppings): everyday design work is the licence; a
	// brand's logo, website, social … is bought per brand and style.
	// The intake step comes first on purpose: rather than a free-browse
	// tier picker showing every tier's price side by side, it asks who the
	// licence is for and resolves the one tier whose per-style rate
	// applies (see LicenseIntake) -- no other tier's price is ever shown.
	// The actual total is tier × selected style count (see
	// $lib/data/pricing's computeEur), so it isn't known until Select
	// styles has a selection either -- this page is what joins the two.
	// A cold /buy visit (no ?font) falls back to the first purchasable
	// typeface -- today there's only one real product, so that is enough.

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		getFlatPackages,
		getPrice,
		getGrossPrice,
		formatPrice,
		getTierLabel,
		getToppingOption,
		isItalicStyle,
		ITALIC_SUFFIX,
		packageStage,
		priceBrand,
		stageFactor,
		stagedPrice,
		STAGE_LABELS,
		SUB_LICENSE_EUR,
		unavailableStyles,
		type FlatPackage,
		type PackageDef
	} from '$lib/data/pricing';
	import { TYPEFACES as CATALOGUE, getTypeface } from '$lib/data/typefaces';
	import type { CartItem } from '$lib/data/discounts';
	import { computeTotal, EDUCATIONAL_ACTIVE } from '$lib/data/discounts';

	import PageSection from '$lib/components/PageSection.svelte';
	import LicenseIntake, { type IntakeMeta } from '$lib/components/Buy/LicenseIntake.svelte';
	import EducationalToggle from '$lib/components/Buy/EducationalToggle.svelte';
	import CartSummary from '$lib/components/Buy/CartSummary.svelte';
	import StyleList from '$lib/components/Buy/StyleList.svelte';
	import BrandUses, {
		toBrandInput,
		type BrandDraft,
		type StyleChoice
	} from '$lib/components/Buy/BrandUses.svelte';
	import type { ActionData, PageData } from './$types';

	// Checkout action result — carries the error message when the action fails.
	// `data.checkoutOpen` is false until a Stripe key is configured (COMING SOON).
	let { form, data }: { form: ActionData; data: PageData } = $props();

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

	// ── Typefaces ─────────────────────────────────────────────
	// The first arrives from the URL; Step 3 adds more to the same order.

	const TYPEFACES: FlatPackage[] = getFlatPackages();
	// ?font=<TypefaceSlug> from the referring font page; falls back to the
	// first (today, only) purchasable typeface for a cold /buy visit or an
	// unrecognised slug.
	const fontSlug = $derived(page.url.searchParams.get('font'));
	const selectedPackage = $derived(
		TYPEFACES.find((p) => p.typefaceSlug === fontSlug) ?? TYPEFACES[0] ?? null
	);

	// Step 3: what else can join the order -- every other typeface on sale and
	// listed on the site (a hidden one is unannounced, so never offered here)...
	const addablePackages = $derived(
		TYPEFACES.filter((p) => p.id !== selectedPackage?.id && !getTypeface(p.typefaceSlug)?.hidden)
	);
	// ...and, shown but not yet selectable, the listed ones still in development.
	const upcomingTypefaces = $derived(
		CATALOGUE.filter(
			(tf) =>
				!tf.hidden &&
				tf.slug !== selectedPackage?.typefaceSlug &&
				!TYPEFACES.some((p) => p.typefaceSlug === tf.slug)
		)
	);
	const hasMoreTypefaces = $derived(addablePackages.length + upcomingTypefaces.length > 0);

	let addedIds = $state<string[]>([]);
	// Catalogue order, not the order they were added in.
	const addedPackages = $derived(addablePackages.filter((p) => addedIds.includes(p.id)));
	const orderPackages = $derived(selectedPackage ? [selectedPackage, ...addedPackages] : []);

	// ── Select styles ────────────────────────────────────
	// Pricing is per-style (see $lib/data/pricing's computeEur): the tier
	// resolved in Step 1 sets a rate per style, and how many are selected
	// here sets the count that rate applies to. Selecting every style
	// (Complete Collection) earns a 50% discount off that rate; a
	// hand-picked subset (Individual) pays it straight — same total price
	// either way buys either the full 20 or half that count, on purpose.
	// Each typeface in the order keeps its own selection.

	// Starts empty, not "all" — Select styles is the buyer's own choice, not
	// a pre-made one they have to notice and undo. Complete Collection is
	// one click away for anyone who does want everything.
	let selection = $state<Record<string, Set<string>>>({});

	// Switching the first typeface starts the order over, rather than
	// carrying over stale selections.
	$effect(() => {
		selectedPackage;
		selection = {};
		addedIds = [];
		brands = [];
		subcontractors = 0;
	});

	function stylesOf(packageId: string): Set<string> {
		return selection[packageId] ?? new Set<string>();
	}

	function toggleWeight(packageId: string, name: string) {
		const next = new Set(stylesOf(packageId));
		if (next.has(name)) next.delete(name);
		else next.add(name);
		selection = { ...selection, [packageId]: next };
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
	function isCompleteActive(pkg: PackageDef): boolean {
		const all = new Set(pkg.styles ?? []);
		return all.size > 0 && setsEqual(stylesOf(pkg.id), all);
	}

	// A master toggle, not a one-way "select all": clicking while every
	// style is already selected clears to zero; clicking from any other
	// state (empty, a hand-picked subset, or a set that only used to be
	// complete before an individual deselect dropped it) selects every
	// style. isCompleteActive is purely derived from the selection, so a
	// single deselect elsewhere never has to separately "remember" to also
	// zero this out -- it already isn't the source of truth for the count.
	function toggleComplete(pkg: PackageDef) {
		selection = {
			...selection,
			[pkg.id]: isCompleteActive(pkg) ? new Set() : new Set(pkg.styles ?? [])
		};
	}

	// Complete Collection's price — null until Step 1 has resolved a tier
	// (no rate to price against yet).
	function completePrice(pkg: PackageDef) {
		const price =
			resolvedTierIndex !== null ? getPrice(pkg, resolvedTierIndex, pkg.styles?.length ?? 0) : null;
		return price === null ? null : stagedPrice(pkg, price);
	}
	function completeGross(pkg: PackageDef) {
		return resolvedTierIndex !== null
			? getGrossPrice(pkg, resolvedTierIndex, pkg.styles?.length ?? 0)
			: null;
	}

	function addTypeface(packageId: string) {
		addedIds = [...addedIds, packageId];
	}

	function removeTypeface(packageId: string) {
		addedIds = addedIds.filter((id) => id !== packageId);
		selection = Object.fromEntries(Object.entries(selection).filter(([id]) => id !== packageId));
	}

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

	// The typefaces that actually have styles picked -- the order's lines.
	const orderLines = $derived(
		orderPackages
			.map((pkg) => {
				const picked = stylesOf(pkg.id);
				return { pkg, styles: (pkg.styles ?? []).filter((style) => picked.has(style)) };
			})
			.filter((line) => line.styles.length > 0)
	);

	// ── Brands and uses ──────────────────────────────────────
	// Only a typeface sold with toppings has them. A brand may use the styles
	// the licence holds that are already drawn.
	let brands = $state<BrandDraft[]>([]);
	let subcontractors = $state(0);

	// A style's name on screen: its weight's label ("Regular", "Medium Italic").
	function styleLabel(pkg: FlatPackage, id: string): string {
		const italic = isItalicStyle(id);
		const base = italic ? id.slice(0, -ITALIC_SUFFIX.length) : id;
		const label =
			getTypeface(pkg.typefaceSlug)?.weights.find((w) => w.name === base)?.label ?? base;
		return italic ? `${label} Italic` : label;
	}

	const brandChoices = $derived<StyleChoice[]>(
		orderLines
			.filter((line) => line.pkg.licensing === 'toppings')
			.map(({ pkg, styles }) => {
				const notDrawn = new Set(unavailableStyles(pkg));
				return {
					pkg,
					styles: styles
						.filter((id) => !notDrawn.has(id))
						.map((id) => ({ id, label: styleLabel(pkg, id) }))
				};
			})
			.filter((choice) => choice.styles.length > 0)
	);

	// The brands complete enough to be in the order: named, with a use and a style.
	const brandInputs = $derived(
		brands
			.map((draft) => toBrandInput(draft, brandChoices))
			.filter(
				(brand) =>
					brand.name !== '' &&
					Number.isInteger(brand.tierIndex) &&
					brand.uses.length > 0 &&
					Object.keys(brand.styles).length > 0
			)
	);

	// What the order summary lists of them, and what the checkout is sent.
	const brandSummary = $derived(
		brandInputs.map((brand) => ({
			name: brand.name,
			size: `${getTierLabel(brand.tierIndex)}${brand.tierIndex === 1 ? '' : ' people'}`,
			uses: brand.uses
				.map((use) => getToppingOption(use.topping, use.option)?.topping.label ?? '')
				.filter(Boolean),
			styleCount: Object.values(brand.styles).reduce((sum, list) => sum + list.length, 0),
			price: priceBrand(brand).reduce((sum, line) => sum + line.price, 0)
		}))
	);
	const brandsJson = $derived(
		JSON.stringify(
			brandInputs.map((brand) => ({
				name: brand.name,
				tier: brand.tierIndex,
				uses: brand.uses,
				styles: brand.styles
			}))
		)
	);

	// Joins Step 1's resolved tier with each typeface's selected style count —
	// the actual chargeable total isn't known until both exist, so this is
	// where the real CartItems get priced (see $lib/data/pricing's computeEur).
	const cartItems = $derived.by<CartItem[]>(() => {
		if (resolvedTierIndex === null) return [];
		const items: CartItem[] = [];
		for (const { pkg, styles } of orderLines) {
			const price = getPrice(pkg, resolvedTierIndex, styles.length);
			const gross = getGrossPrice(pkg, resolvedTierIndex, styles.length);
			if (price === null || gross === null) return [];
			items.push({
				kind: 'tier',
				tierIndex: resolvedTierIndex,
				basePrice: price,
				grossPrice: gross,
				packageId: pkg.id
			});
		}
		if (items.length === 0) return items;
		for (const brand of brandInputs) {
			for (const line of priceBrand(brand)) {
				items.push({
					kind: 'topping',
					tierIndex: brand.tierIndex,
					basePrice: line.price,
					grossPrice: line.price,
					packageId: line.packageId
				});
			}
		}
		if (subcontractors > 0) {
			const flat = subcontractors * SUB_LICENSE_EUR;
			items.push({
				kind: 'sub',
				tierIndex: null,
				basePrice: flat,
				grossPrice: flat,
				packageId: ''
			});
		}
		return items;
	});

	const hasLicense = $derived(cartItems.length > 0);

	const cartState = $derived({
		items: cartItems,
		isStudent,
		packageDef: orderLines[0]?.pkg ?? null,
		packageDefs: orderLines.map((line) => line.pkg)
	});

	const { subtotal, discounts, total } = $derived(computeTotal(cartState));

	// A typeface shown for review, on a deployment whose Stripe key is live: the
	// whole flow is there to look at, the payment is not (the server says no too).
	const isPreview = $derived(orderPackages.some((pkg) => pkg.preview));
	const checkoutLocked = $derived(isPreview && data.previewLocked);

	// Headline is just the typeface name — the buyer already arrived to buy
	// this one specifically, so no tagline framing it needs restating here.
	const heroHeading = $derived(selectedPackage ? selectedPackage.label : 'Buy');
	const pageTitle = $derived(selectedPackage ? `Buy ${selectedPackage.label}` : 'Buy');
</script>

<svelte:head>
	{#if data.checkoutOpen}
		<title>{pageTitle} — Apres Guerre</title>
		<meta
			name="description"
			content={selectedPackage?.licensing === 'toppings'
				? `Purchase ${selectedPackage.label}. One licence per organisation size for everyday design work; a brand's logo, web or social media is added per brand.`
				: `Purchase ${selectedPackage?.label ?? 'Norma'} — a 20-weight variable family. One license per organisation size, covering desktop, web, app, and broadcast.`}
		/>
	{:else}
		<!-- Generic while closed: the default package here is a typeface that isn't
		     shown on the site, so its name stays off the COMING SOON page. -->
		<title>Buy — Apres Guerre</title>
		<meta name="description" content="Licences go on sale soon." />
	{/if}
</svelte:head>

<!-- Select styles for one typeface: the Complete Collection card over the
     style grid (informational: Complete always ships every weight shown here
     at one price — this just lets a buyer mark the ones they'll reach for
     first). The card is the same round-radio card as Typeface selection,
     formatted identically to it: name, "N weights" detail, price at the right
     (struck-through gross → the discounted final, once Step 1 has resolved a
     rate). -->
{#snippet stylePanel(pkg: PackageDef)}
	{@const active = isCompleteActive(pkg)}
	{@const price = completePrice(pkg)}
	{@const gross = completeGross(pkg)}
	{@const toCome = unavailableStyles(pkg)}
	{@const face = getTypeface((pkg as FlatPackage).typefaceSlug)}
	<div class="WeightPanel">
		<button
			type="button"
			class="WeightPanel__collection"
			class:is-active={active}
			onclick={() => toggleComplete(pkg)}
			aria-pressed={active}
		>
			<span class="TypefaceCard__radio" aria-hidden="true">
				{#if active}<span class="TypefaceCard__dot"></span>{/if}
			</span>
			<span class="TypefaceCard__body">
				<span class="TypefaceCard__name">Complete Collection</span>
				<span class="TypefaceCard__detail"
					>{pkg.styles?.length ?? 0}
					{pkg.italic ? 'styles' : 'weights'}{toCome.length > 0
						? ` · ${toCome.length} still to come, included`
						: ''}</span
				>
			</span>
			{#if price !== null}
				<span class="TypefaceCard__price">
					{#if gross !== null && gross > price}
						<span class="TypefaceCard__price-gross">{formatPrice(gross)}</span>
					{/if}
					<span class="TypefaceCard__price-final">{formatPrice(price)}</span>
				</span>
			{/if}
		</button>

		<StyleList
			{pkg}
			selectable
			selected={stylesOf(pkg.id)}
			onToggle={(name) => toggleWeight(pkg.id, name)}
			fontFamily={pkg.licensing === 'toppings' ? face?.fontFamily : undefined}
			weights={pkg.licensing === 'toppings' ? face?.weights : undefined}
			showLabels={pkg.licensing === 'toppings'}
			unavailable={new Set(toCome)}
		/>
	</div>
{/snippet}

<main class="BuyPage">
	<!-- Figma node 3:671 long-form layout (PageSection `full`): the typeface's
	     name as the page title, the one-line instruction beside it, and the
	     existing two-column checkout (steps 65% / sticky cart 35%) running
	     full width underneath. nativeBody: the checkout keeps its own Norma
	     type and colours — Ango's currency glyphs aren't finished, and the
	     cart's inverted button must not be flattened to black text. -->
	{#if data.checkoutOpen}
		<PageSection title={heroHeading} as="h1" subtitle="Pay once, yours to keep." full nativeBody>
			{#snippet intro()}
				<p>Tell us who it's for, then pick your weights.</p>
			{/snippet}
			<div class="BuyPage__grid">
				<!-- Left column (PC: 65%) — everything that isn't the running order. -->
				<div class="BuyPage__main">
					{#if selectedPackage && stageFactor(selectedPackage) < 1}
						<!-- Early access: said before anything is priced. -->
						<p class="BuyStage" role="note">
							<strong
								>{STAGE_LABELS[packageStage(selectedPackage)]}{selectedPackage.version
									? ` v${selectedPackage.version}`
									: ''}</strong
							>
							— not finished yet, so the price is lower; it rises as the family is completed. Your licence
							includes every update to it, for good.
						</p>
					{/if}
					{#if isPreview}
						<!-- Shown for review before the sale opens. -->
						<p class="BuyStage BuyStage--preview" role="note">
							<strong>Preview</strong> — this typeface is shown for review before the sale opens.
							Prices and wording are not final{data.previewLocked
								? ', and checkout is closed'
								: ''}.
						</p>
					{/if}
					<!-- Step 1 — About you (intake). Comes before Typeface on purpose — see
			     the script header comment. Required fields are marked (*) inside
			     LicenseIntake itself — Steps 2/3 stay hidden until it resolves. -->
					<div class="BuyStep" id="step-1">
						<p class="BuyStep__eyebrow">1 — About you</p>
						<LicenseIntake
							packages={selectedPackage ? [selectedPackage] : []}
							onresolve={handleIntakeResolve}
						/>
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
						<!-- Select styles: one panel per typeface in the order. -->
						{#if selectedPackage?.styles?.length}
							<div class="BuyStep">
								<p class="BuyStep__eyebrow">2 — Select styles</p>
								{@render stylePanel(selectedPackage)}
							</div>
						{/if}

						<!-- Step 3 — other typefaces to put in the same order. The licence
				     from Step 1 covers them, so this only asks which, and how many
				     styles of each. -->
						{#if hasMoreTypefaces}
							<div class="BuyStep" id="step-3">
								<p class="BuyStep__eyebrow">3 — Add another typeface</p>
								<ul class="MoreTypefaces">
									{#each addablePackages as pkg (pkg.id)}
										{@const added = addedIds.includes(pkg.id)}
										<li class="MoreTypefaces__item" class:is-added={added}>
											<div class="MoreTypefaces__row">
												<span class="MoreTypefaces__name"
													>{getTypeface(pkg.typefaceSlug)?.name ?? pkg.label}</span
												>
												<span class="MoreTypefaces__detail">{pkg.detail}</span>
												<button
													type="button"
													class="MoreTypefaces__action"
													onclick={() => (added ? removeTypeface(pkg.id) : addTypeface(pkg.id))}
													aria-expanded={added}
												>
													{added ? 'Remove' : 'Add'}
												</button>
											</div>
											{#if added}
												{@render stylePanel(pkg)}
											{/if}
										</li>
									{/each}
									{#each upcomingTypefaces as tf (tf.slug)}
										<li class="MoreTypefaces__item is-soon">
											<div class="MoreTypefaces__row">
												<span class="MoreTypefaces__name">{tf.name}</span>
												<span class="MoreTypefaces__detail">Coming soon</span>
											</div>
										</li>
									{/each}
								</ul>
							</div>
						{/if}

						<!-- Step 4 — brands and uses, for a typeface sold with toppings. -->
						{#if brandChoices.length > 0}
							<div class="BuyStep" id="step-brands">
								<p class="BuyStep__eyebrow">
									{hasMoreTypefaces ? 4 : 3} — Brands and uses
								</p>
								<BrandUses
									choices={brandChoices}
									bind:brands
									bind:subcontractors
									ownerName={intakeMeta.licenseeName}
									ownerTier={resolvedTierIndex}
								/>
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
						lines={hasLicense ? orderLines : []}
						brands={hasLicense ? brandSummary : []}
						{brandsJson}
						subcontractors={hasLicense ? subcontractors : 0}
						{checkoutLocked}
						errorMessage={form?.message ?? null}
					/>
				</div>
			</div>
		</PageSection>
	{:else}
		<!-- Checkout closed (no Stripe key on this deployment yet): nothing to fill
		     in, nothing to submit — the checkout action stays refused server-side
		     too (it answers 503 without a key). -->
		<PageSection title="Buy" as="h1" subtitle="Coming soon." full>
			{#snippet intro()}
				<p>Licences go on sale soon.</p>
			{/snippet}
			<p>For licensing questions, <a href={resolve('/contact')}>contact us</a>.</p>
		</PageSection>
	{/if}
</main>

<style>
	/* ── Page shell ── insets, title and min-height all come from PageSection
	   now (see the markup comment); this only sets the page ground. */
	.BuyPage {
		background: var(--color-bg);
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

	/* ── Early access notice ── */
	.BuyStage {
		margin: 0 0 32px;
		max-width: 480px;
		padding: 14px var(--padding);
		background: var(--color-bg-gray);
		font-family: 'Norma', sans-serif;
		font-size: 13px;
		line-height: 1.5;
		color: var(--color-text);
	}

	.BuyStage--preview {
		margin-top: -16px;
	}

	/* ── Steps (shared) ── */
	.BuyStep {
		margin-bottom: 40px;
	}

	.BuyStep__eyebrow {
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
		font-size: 26px;
		font-weight: var(--fw-strong);
		line-height: 1.1;
		letter-spacing: 0;
		color: inherit;
	}

	.TypefaceCard__detail {
		font-family: 'Norma', sans-serif;
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
		font-family: 'Norma', sans-serif;
		font-size: 11px;
		text-decoration: line-through;
		opacity: 0.5;
		color: inherit;
	}

	.TypefaceCard__price-final {
		font-family: 'Norma', sans-serif;
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
		border: var(--border-line);
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

	/* ── Step 3: another typeface ── a plain list in the style panel's own
	   border language: name, detail, one action at the right. An added
	   typeface opens its own style panel under its row, inside the same card
	   (so the card's border does for both). Ones still in development are
	   listed but muted, with no action. */
	.MoreTypefaces {
		list-style: none;
		margin: 0;
		padding: 0;
		width: 100%;
		max-width: 480px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.MoreTypefaces__item {
		background: var(--color-bg);
		color: var(--color-text);
		border: var(--border-line);
	}

	.MoreTypefaces__item.is-soon {
		opacity: 0.5;
	}

	.MoreTypefaces__row {
		display: flex;
		align-items: baseline;
		gap: 12px;
		padding: 16px var(--padding);
		font-family: 'Norma', sans-serif;
	}

	.MoreTypefaces__name {
		font-size: 20px;
		font-weight: var(--fw-strong);
		line-height: 1.1;
		color: inherit;
	}

	.MoreTypefaces__detail {
		flex: 1;
		min-width: 0;
		font-size: 11px;
		color: var(--color-text-mute);
	}

	.MoreTypefaces__action {
		flex-shrink: 0;
		background: transparent;
		border: 0;
		padding: 0 4px;
		font: inherit;
		font-size: 12px;
		color: var(--color-text);
		text-decoration: underline;
		text-underline-offset: 2px;
		cursor: pointer;
	}

	.MoreTypefaces__item .WeightPanel {
		max-width: none;
		border: 0;
		border-top: var(--border-line);
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
