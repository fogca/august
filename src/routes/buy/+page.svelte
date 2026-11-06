<script lang="ts">
	// /buy — the license purchase page (rebuilt 2026-11-06, at the user's request,
	// after Kontrapunkt Type's checkout and Rellence's cart).
	//
	// Entry point is a typeface's own page: /buy?font=<TypefaceSlug>. PC is two
	// columns: on the left, the license — 1 Licensee (name and size), 2 Sub,
	// 3 Logo, 4 Web (with its domains), 5 Social, 6 Add-ons; on the right, the
	// cart — each typeface's packages, pairs and single styles with their
	// prices, the summary, the EULA and the checkout. SP stacks the two.
	//
	// Nothing is gated: the page opens on a preset (LICENCE_PRESET — the
	// Complete Collection, 5 people, one subcontractor, one logo, one website,
	// social media) with its price already shown, and every choice only changes
	// it from there; the licensee's name is asked for at checkout, not first.
	//
	// Toppings (logo, web …) exist for a typeface sold with them (`licensing:
	// 'toppings'`): each adds its ratio of the per-style rate to every style. A
	// typeface sold bundled (Norma) already covers web and app, so its rows are
	// left out. Every price shown is the one the server will charge: it
	// recomputes the order from the same functions (see $lib/server/checkout-order).

	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import {
		encodeStyleField,
		formatPrice,
		getFlatPackages,
		getGrossPrice,
		getPrice,
		getTierDef,
		isItalicStyle,
		ITALIC_SUFFIX,
		LICENCE_PRESET,
		MAX_WEB_DOMAINS,
		normalizeDomain,
		packageStage,
		scopeBlurb,
		stageFactor,
		stagedPrice,
		STAGE_LABELS,
		SUB_LICENSE_EUR,
		SUB_OPTIONS,
		TIER_DEFS,
		TOPPINGS,
		unavailableStyles,
		type FlatPackage,
		type ToppingDef,
		type Use
	} from '$lib/data/pricing';
	import { TYPEFACES as CATALOGUE, getTypeface } from '$lib/data/typefaces';
	import type { CartItem } from '$lib/data/discounts';
	import { computeTotal } from '$lib/data/discounts';
	import PageSection from '$lib/components/PageSection.svelte';
	import type { ActionData, PageData } from './$types';

	// Checkout action result — carries the error message when the action fails.
	// `data.checkoutOpen` is false until a Stripe key is configured (COMING SOON).
	let { form, data }: { form: ActionData; data: PageData } = $props();

	// ── Typefaces ─────────────────────────────────────────────
	// The first arrives from the URL; more can be added to the same order.

	const TYPEFACES: FlatPackage[] = getFlatPackages();
	const fontSlug = $derived(page.url.searchParams.get('font'));
	const selectedPackage = $derived(
		TYPEFACES.find((p) => p.typefaceSlug === fontSlug) ?? TYPEFACES[0] ?? null
	);
	// Every other typeface on sale and listed (a hidden one is unannounced) …
	const addablePackages = $derived(
		TYPEFACES.filter((p) => p.id !== selectedPackage?.id && !getTypeface(p.typefaceSlug)?.hidden)
	);
	// … and, listed but not selectable, the ones still in development.
	const upcomingTypefaces = $derived(
		CATALOGUE.filter(
			(tf) =>
				!tf.hidden &&
				tf.slug !== selectedPackage?.typefaceSlug &&
				!TYPEFACES.some((p) => p.typefaceSlug === tf.slug)
		)
	);
	let addedIds = $state<string[]>([]);
	const orderPackages = $derived(
		selectedPackage
			? [selectedPackage, ...addablePackages.filter((p) => addedIds.includes(p.id))]
			: []
	);
	const hasToppings = $derived(orderPackages.some((p) => p.licensing === 'toppings'));

	// ── The license (left) — starts on the preset ───────────────
	let licenseeName = $state('');
	let tier = $state(String(LICENCE_PRESET.tierIndex));
	let uses = $state<Record<string, string>>(
		Object.fromEntries(LICENCE_PRESET.uses.map((u) => [u.topping, u.option]))
	);
	let subcontractors = $state(LICENCE_PRESET.subcontractors);
	let domains = $state<string[]>([]);
	let domainDraft = $state('');
	let domainError = $state('');
	let eula = $state(false);

	const tierIndex = $derived(Number(tier));
	const isCustomQuote = $derived(getTierDef(tierIndex)?.perStyleEur === null);
	const usesList = $derived<Use[]>(
		Object.entries(uses).map(([topping, option]) => ({ topping, option }) as Use)
	);
	const MAIN_TOPPINGS = TOPPINGS.filter((t) => t.group === 'main');
	const ADDONS = TOPPINGS.filter((t) => t.group === 'addon');

	function toggleTopping(topping: ToppingDef) {
		if (uses[topping.id]) delete uses[topping.id];
		else uses[topping.id] = topping.options[0].id;
	}

	function addDomain() {
		const host = normalizeDomain(domainDraft);
		if (!host) {
			domainError = 'That isn’t a website address.';
			return;
		}
		if (!domains.includes(host) && domains.length < MAX_WEB_DOMAINS) domains = [...domains, host];
		domainDraft = '';
		domainError = '';
	}

	// ── Styles (right) — each typeface starts on its Complete Collection ──
	let selection = $state<Record<string, string[]>>({});

	const allStyles = (pkg: FlatPackage) => pkg.styles ?? [];
	const selectedOf = (pkg: FlatPackage) => selection[pkg.id] ?? [];
	const isComplete = (pkg: FlatPackage) =>
		allStyles(pkg).length > 0 && selectedOf(pkg).length === allStyles(pkg).length;

	// A new first typeface starts the order over, on the preset selection.
	$effect(() => {
		if (!selectedPackage) return;
		selection = { [selectedPackage.id]: [...allStyles(selectedPackage)] };
		addedIds = [];
	});

	function addTypeface(pkg: FlatPackage) {
		addedIds = [...addedIds, pkg.id];
		selection[pkg.id] = [...allStyles(pkg)];
	}

	function removeTypeface(pkg: FlatPackage) {
		addedIds = addedIds.filter((id) => id !== pkg.id);
		delete selection[pkg.id];
	}

	// Complete toggles the whole family. A pair or a single style, picked while
	// the whole family is selected, becomes the selection on its own; otherwise
	// it is added or taken off.
	function chooseComplete(pkg: FlatPackage) {
		selection[pkg.id] = isComplete(pkg) ? [] : [...allStyles(pkg)];
	}

	function choose(pkg: FlatPackage, ids: string[]) {
		const current = selectedOf(pkg);
		if (isComplete(pkg)) {
			selection[pkg.id] = [...ids];
			return;
		}
		const allIn = ids.every((id) => current.includes(id));
		const next = allIn
			? current.filter((id) => !ids.includes(id))
			: [...new Set([...current, ...ids])];
		// Kept in the family's own order.
		selection[pkg.id] = allStyles(pkg).filter((id) => next.includes(id));
	}

	const isChosen = (pkg: FlatPackage, ids: string[]) =>
		!isComplete(pkg) && ids.every((id) => selectedOf(pkg).includes(id));

	// ── Names on screen ────────────────────────────────────────
	function weightOf(pkg: FlatPackage, id: string) {
		const base = isItalicStyle(id) ? id.slice(0, -ITALIC_SUFFIX.length) : id;
		return getTypeface(pkg.typefaceSlug)?.weights.find((w) => w.name === base);
	}

	/** "Regular", "Regular Italic" — Norma keeps its numeric names. */
	function styleName(pkg: FlatPackage, id: string): string {
		const italic = isItalicStyle(id) && pkg.italic === true;
		const base = italic ? id.slice(0, -ITALIC_SUFFIX.length) : id;
		const name = pkg.licensing === 'toppings' ? (weightOf(pkg, id)?.label ?? base) : base;
		return italic ? `${name} Italic` : name;
	}

	/** The style's name set in the style itself. */
	function sampleStyle(pkg: FlatPackage, id: string): string {
		const face = getTypeface(pkg.typefaceSlug);
		const wght = weightOf(pkg, id)?.axisValue ?? 400;
		const italic = isItalicStyle(id) && pkg.italic === true;
		return `font-family: '${face?.fontFamily ?? 'Norma'}', 'Norma', sans-serif; font-variation-settings: 'wght' ${wght};${italic ? ' font-style: italic;' : ''}`;
	}

	/** Weight + its italic, where both are drawn. */
	function pairsOf(pkg: FlatPackage): string[][] {
		if (!pkg.italic) return [];
		const notDrawn = new Set(unavailableStyles(pkg));
		return allStyles(pkg)
			.filter((id) => !isItalicStyle(id))
			.map((id) => [id, id + ITALIC_SUFFIX])
			.filter(([u, i]) => allStyles(pkg).includes(i) && !notDrawn.has(u) && !notDrawn.has(i));
	}

	// ── Prices ─────────────────────────────────────────────────
	const usesFor = (pkg: FlatPackage, list: Use[]) => (pkg.licensing === 'toppings' ? list : []);

	/** What `count` styles of `pkg` cost on their own, at the stage the family is at. */
	function optionPrice(pkg: FlatPackage, count: number): number | null {
		const price = getPrice(pkg, tierIndex, count, usesFor(pkg, usesList));
		return price === null ? null : stagedPrice(pkg, price);
	}

	/** The whole order, priced, for a given set of toppings and subcontractors —
	 *  the order itself, and what each row on the left adds to it. */
	function priceOrder(list: Use[], subs: number) {
		const items: CartItem[] = [];
		for (const pkg of orderPackages) {
			const count = selectedOf(pkg).length;
			if (count === 0) continue;
			const price = getPrice(pkg, tierIndex, count, usesFor(pkg, list));
			const gross = getGrossPrice(pkg, tierIndex, count, usesFor(pkg, list));
			if (price === null || gross === null) return null;
			items.push({
				kind: 'tier',
				tierIndex,
				basePrice: price,
				grossPrice: gross,
				packageId: pkg.id
			});
		}
		if (items.length > 0 && subs > 0) {
			const flat = subs * SUB_LICENSE_EUR;
			items.push({
				kind: 'sub',
				tierIndex: null,
				basePrice: flat,
				grossPrice: flat,
				packageId: ''
			});
		}
		const pkgs = orderPackages.filter((pkg) => selectedOf(pkg).length > 0);
		return {
			items,
			...computeTotal({ items, isStudent: false, packageDef: pkgs[0] ?? null, packageDefs: pkgs })
		};
	}

	const order = $derived(priceOrder(usesList, subcontractors));

	/** What a row adds to the total: with it on, against without it. */
	function rowDelta(id: string): number | null {
		if (!order) return null;
		if (id === 'sub') {
			const other = priceOrder(usesList, subcontractors > 0 ? 0 : 1);
			return other ? Math.abs(order.total - other.total) : null;
		}
		const topping = TOPPINGS.find((t) => t.id === id);
		if (!topping) return null;
		const without = usesList.filter((u) => u.topping !== id);
		const withIt = uses[id]
			? usesList
			: [...without, { topping: topping.id, option: topping.options[0].id }];
		const a = priceOrder(withIt, subcontractors);
		const b = priceOrder(without, subcontractors);
		return a && b ? a.total - b.total : null;
	}

	const lines = $derived(
		orderPackages
			.map((pkg) => ({ pkg, styles: selectedOf(pkg) }))
			.filter((line) => line.styles.length > 0)
	);
	const usesJson = $derived(JSON.stringify(hasToppings ? usesList : []));
	const sizeLabel = $derived(
		tierIndex === 1 ? '1 person' : `${getTierDef(tierIndex)?.label ?? ''} people`
	);

	// A typeface shown for review on a deployment whose Stripe key is live: the
	// whole flow is there to look at, the payment is not (the server says no too).
	const isPreview = $derived(orderPackages.some((pkg) => pkg.preview));
	const checkoutLocked = $derived(isPreview && data.previewLocked);

	let submitting = $state(false);
	const missing = $derived(
		[
			!licenseeName.trim() && 'Enter the licensee',
			!eula && 'Accept the EULA',
			lines.length === 0 && 'Choose at least one style',
			isCustomQuote && 'Above 500 people, contact us for a quote'
		].filter(Boolean) as string[]
	);
	const canCheckout = $derived(missing.length === 0 && !checkoutLocked && !submitting);

	// PC: the cart is a column of its own beside the license, scrolling on its
	// own (so Lenis leaves its wheel alone); SP stacks them.
	let isWide = $state(false);
	onMount(() => {
		const mq = window.matchMedia('(min-width: 1060px)');
		const sync = () => (isWide = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	const pageTitle = $derived(selectedPackage ? `Buy ${selectedPackage.label}` : 'Buy');
</script>

<svelte:window
	onpageshow={(e) => {
		// Back from Stripe: the page comes out of the bfcache mid-submit.
		if (e.persisted) submitting = false;
	}}
/>

<svelte:head>
	{#if data.checkoutOpen}
		<title>{pageTitle} — Apres Guerre</title>
		<meta
			name="description"
			content="Buy a license for {selectedPackage?.label ??
				'a typeface'}: one license per organisation size, with your logo, website and social media added as you need them."
		/>
	{:else}
		<!-- Generic while closed: the default package here is a typeface that isn't
		     shown on the site, so its name stays off the COMING SOON page. -->
		<title>Buy — Apres Guerre</title>
		<meta name="description" content="Licences go on sale soon." />
	{/if}
</svelte:head>

<!-- A left-hand row's label: its on/off dot, its name, and what it adds. -->
{#snippet rowHead(id: string, label: string, on: boolean | null, toggle?: () => void)}
	<div class="Row__label">
		{#if on === null}
			<span class="Row__name">{label}</span>
		{:else}
			<button type="button" class="Row__switch" aria-pressed={on} onclick={toggle}>
				<span class="Dot" class:is-on={on} aria-hidden="true"></span>
				<span class="Row__name">{label}</span>
			</button>
			{@const delta = rowDelta(id)}
			{#if delta !== null && delta > 0}
				<span class="Row__delta">{on ? '' : '+'}{formatPrice(delta)}</span>
			{/if}
		{/if}
	</div>
{/snippet}

<main class="Buy">
	{#if data.checkoutOpen && selectedPackage}
		<div class="Buy__grid">
			<!-- ── Left: the license ── -->
			<div class="Buy__license">
				<h1 class="Buy__title">Buy a license.</h1>
				<ul class="Buy__claims">
					<li>Pay once — yours to keep, with every update.</li>
					<li>One license for your company, at its size.</li>
				</ul>
				{#if isPreview}
					<p class="Buy__note" role="note">
						<strong>Preview</strong> — shown for review before the sale opens. Prices and wording
						are not final{data.previewLocked ? ', and checkout is closed' : ''}.
					</p>
				{/if}

				<!-- 1 — Licensee -->
				<section class="Row" aria-label="Licensee">
					{@render rowHead('licensee', 'Licensee', null)}
					<div class="Row__body">
						<label class="Field">
							<span class="Field__q">The company or person the license is for</span>
							<input
								class="Field__input"
								type="text"
								bind:value={licenseeName}
								placeholder="Enter license holder"
								autocomplete="organization"
							/>
						</label>
						<label class="Field">
							<span class="Field__q">How many people work for it?</span>
							<span class="Field__row">
								<select class="Field__input" bind:value={tier}>
									{#each TIER_DEFS as t (t.index)}
										<option value={String(t.index)}
											>{t.index === 1 ? '1 person' : `${t.label} people`}</option
										>
									{/each}
								</select>
							</span>
						</label>
						<p class="Row__info">
							The size of the whole licensing company, not only the people who use the fonts.
							{scopeBlurb(tierIndex, selectedPackage.licensing)}
						</p>
						{#if isCustomQuote}
							<p class="Row__info">
								Above 500 people, we make the license with you —
								<a href={resolve('/contact')}>contact us</a>.
							</p>
						{/if}
					</div>
				</section>

				<!-- 2 — Sub -->
				<section class="Row" class:is-off={subcontractors === 0} aria-label="Subcontractors">
					{@render rowHead(
						'sub',
						'Sub',
						subcontractors > 0,
						() => (subcontractors = subcontractors > 0 ? 0 : 1)
					)}
					<div class="Row__body">
						<span class="Field__q">Share the fonts with subcontractors</span>
						<span class="Field__row">
							<select
								class="Field__input"
								value={String(subcontractors)}
								onchange={(e) => (subcontractors = Number(e.currentTarget.value))}
							>
								<option value="0">No subcontractor</option>
								{#each SUB_OPTIONS as n (n)}
									<option value={String(n)}>{n} subcontractor{n === 1 ? '' : 's'}</option>
								{/each}
							</select>
						</span>
						<p class="Row__info">
							A freelancer or a printer may use the fonts to produce your work —
							{formatPrice(SUB_LICENSE_EUR)} each, for any styles.
						</p>
					</div>
				</section>

				{#if hasToppings}
					<!-- 3–5 — Logo, Web, Social -->
					{#each MAIN_TOPPINGS as topping (topping.id)}
						{@const on = uses[topping.id] !== undefined}
						<section class="Row" class:is-off={!on} aria-label={topping.label}>
							{@render rowHead(topping.id, topping.label, on, () => toggleTopping(topping))}
							<div class="Row__body">
								<span class="Field__q">{topping.question}</span>
								<span class="Field__row">
									{#if on}
										<select class="Field__input" bind:value={uses[topping.id]}>
											{#each topping.options as option (option.id)}
												<option value={option.id}>{option.label}</option>
											{/each}
										</select>
									{:else}
										<button
											type="button"
											class="Field__input Field__off"
											onclick={() => toggleTopping(topping)}>Not included — add</button
										>
									{/if}
								</span>
								<p class="Row__info">{topping.blurb}</p>
								{#if topping.id === 'web' && on}
									<!-- 4 — the Web license's domains -->
									<div class="Domains">
										<span class="Field__q">Register your website</span>
										<span class="Field__row">
											<input
												class="Field__input"
												type="text"
												inputmode="url"
												placeholder="https://"
												bind:value={domainDraft}
												onkeydown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														addDomain();
													}
												}}
											/>
											<button type="button" class="Field__add" onclick={addDomain}>Add</button>
										</span>
										{#if domainError}<p class="Row__info Row__info--error">{domainError}</p>{/if}
										{#if domains.length > 0}
											<ul class="Domains__list">
												{#each domains as host (host)}
													<li>
														{host}
														<button
															type="button"
															aria-label="Remove {host}"
															onclick={() => (domains = domains.filter((d) => d !== host))}
															>×</button
														>
													</li>
												{/each}
											</ul>
										{:else}
											<p class="Row__info">You can also register it later.</p>
										{/if}
									</div>
								{/if}
							</div>
						</section>
					{/each}

					<!-- 6 — Add-ons -->
					<section class="Row" aria-label="Add-ons">
						<div class="Row__label"><span class="Row__name">Add-on</span></div>
						<div class="Row__body">
							{#each ADDONS as topping (topping.id)}
								{@const on = uses[topping.id] !== undefined}
								{@const delta = rowDelta(topping.id)}
								<button
									type="button"
									class="Addon"
									aria-pressed={on}
									onclick={() => toggleTopping(topping)}
								>
									<span class="Dot" class:is-on={on} aria-hidden="true"></span>
									<span class="Addon__text">
										<span class="Addon__name">{topping.question}</span>
										<span class="Addon__blurb">{topping.blurb}</span>
									</span>
									{#if delta !== null && delta > 0}
										<span class="Row__delta">{on ? '' : '+'}{formatPrice(delta)}</span>
									{/if}
								</button>
							{/each}
						</div>
					</section>
				{:else}
					<p class="Buy__note">{scopeBlurb(tierIndex, selectedPackage.licensing)}</p>
				{/if}
			</div>

			<!-- ── Right: the cart ── -->
			<aside class="Cart" aria-label="Cart" data-lenis-prevent={isWide ? '' : undefined}>
				<h2 class="Cart__title">Cart</h2>

				{#each orderPackages as pkg (pkg.id)}
					{@const toCome = unavailableStyles(pkg)}
					{@const pairs = pairsOf(pkg)}
					<section class="Face" aria-label={pkg.label}>
						<header class="Face__head">
							<span class="Face__pill">{pkg.label}</span>
							{#if pkg.id !== selectedPackage.id}
								<button type="button" class="Face__remove" onclick={() => removeTypeface(pkg)}
									>Remove</button
								>
							{/if}
						</header>
						{#if stageFactor(pkg) < 1}
							<p class="Face__stage">
								{STAGE_LABELS[packageStage(pkg)]}{pkg.version ? ` v${pkg.version}` : ''} — not finished
								yet, so it costs less; the price rises as it is completed, and every update is yours.
							</p>
						{/if}

						<h3 class="Face__group">Packages</h3>
						<button
							type="button"
							class="Option"
							class:is-on={isComplete(pkg)}
							aria-pressed={isComplete(pkg)}
							onclick={() => chooseComplete(pkg)}
						>
							<span class="Dot" class:is-on={isComplete(pkg)} aria-hidden="true"></span>
							<span class="Option__name"
								>Complete Family<span class="Option__sub"
									>{allStyles(pkg).length} styles{toCome.length > 0
										? `, ${toCome.length} still to come`
										: ''}</span
								></span
							>
							<span class="Option__samples">
								{#each allStyles(pkg) as id (id)}
									<span style={sampleStyle(pkg, id)} class:is-soon={toCome.includes(id)}
										>{pkg.label} {styleName(pkg, id)}</span
									>
								{/each}
							</span>
							<span class="Option__price"
								>{formatPrice(optionPrice(pkg, allStyles(pkg).length))}</span
							>
						</button>

						{#if pairs.length > 0}
							<h3 class="Face__group">Pairs</h3>
							{#each pairs as pair (pair[0])}
								<button
									type="button"
									class="Option"
									class:is-on={isChosen(pkg, pair)}
									aria-pressed={isChosen(pkg, pair)}
									onclick={() => choose(pkg, pair)}
								>
									<span class="Dot" class:is-on={isChosen(pkg, pair)} aria-hidden="true"></span>
									<span class="Option__name">{styleName(pkg, pair[0])} + Italic</span>
									<span class="Option__samples">
										{#each pair as id (id)}
											<span style={sampleStyle(pkg, id)}>{pkg.label} {styleName(pkg, id)}</span>
										{/each}
									</span>
									<span class="Option__price">{formatPrice(optionPrice(pkg, 2))}</span>
								</button>
							{/each}
						{/if}

						<h3 class="Face__group">Single Styles</h3>
						{#each allStyles(pkg) as id (id)}
							{@const soon = toCome.includes(id)}
							<button
								type="button"
								class="Option"
								class:is-on={isChosen(pkg, [id])}
								class:is-soon={soon}
								aria-pressed={isChosen(pkg, [id])}
								disabled={soon}
								onclick={() => choose(pkg, [id])}
							>
								<span class="Dot" class:is-on={isChosen(pkg, [id])} aria-hidden="true"></span>
								<span class="Option__name">{styleName(pkg, id)}</span>
								<span class="Option__samples"
									><span style={sampleStyle(pkg, id)}>{pkg.label} {styleName(pkg, id)}</span></span
								>
								<span class="Option__price"
									>{soon ? 'With Complete' : formatPrice(optionPrice(pkg, 1))}</span
								>
							</button>
						{/each}
					</section>
				{/each}

				{#if addablePackages.some((p) => !addedIds.includes(p.id)) || upcomingTypefaces.length > 0}
					<section class="More" aria-label="Add another typeface">
						<h3 class="Face__group">Add another typeface</h3>
						<ul>
							{#each addablePackages.filter((p) => !addedIds.includes(p.id)) as pkg (pkg.id)}
								<li>
									<span>{pkg.label}</span>
									<button type="button" class="More__add" onclick={() => addTypeface(pkg)}
										>Add</button
									>
								</li>
							{/each}
							{#each upcomingTypefaces as tf (tf.slug)}
								<li class="is-soon"><span>{tf.name}</span><span>Coming soon</span></li>
							{/each}
						</ul>
					</section>
				{/if}

				<!-- Totals and checkout -->
				<section class="Total" aria-live="polite">
					{#if order && order.items.length > 0}
						<div class="Total__row">
							<span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
						</div>
						{#each order.discounts as d (d.id + d.label)}
							<div class="Total__row Total__row--mute">
								<span>{d.label}</span><span>−{formatPrice(d.amount)}</span>
							</div>
						{/each}
					{/if}

					<ul class="Summary">
						<li class:is-missing={!licenseeName.trim()}>
							{licenseeName.trim() || 'Enter license holder'}
						</li>
						<li>{sizeLabel}</li>
						{#if subcontractors > 0}
							<li>{subcontractors} subcontractor{subcontractors === 1 ? '' : 's'}</li>
						{/if}
						{#if hasToppings}
							{#each usesList as use (use.topping)}
								<li>
									{TOPPINGS.find((t) => t.id === use.topping)?.label}{use.topping === 'web' &&
									domains.length > 0
										? ` — ${domains.join(', ')}`
										: ''}
								</li>
							{/each}
						{/if}
						{#each lines as line (line.pkg.id)}
							<li>
								{line.pkg.label} ({isComplete(line.pkg)
									? 'Complete'
									: `${line.styles.length} style${line.styles.length === 1 ? '' : 's'}`})
							</li>
						{/each}
					</ul>

					<label class="Eula">
						<input type="checkbox" bind:checked={eula} />
						<span
							>By completing your purchase, you agree to the <a href={resolve('/legal/eula')}
								>EULA</a
							>.</span
						>
					</label>

					<div class="Total__row Total__row--total">
						<span>Total <small>(incl. VAT)</small></span>
						<span>{order && !isCustomQuote ? formatPrice(order.total) : '—'}</span>
					</div>

					{#if form?.message}<p class="Total__error" role="alert">{form.message}</p>{/if}

					<form
						method="POST"
						action="?/checkout"
						use:enhance={() => {
							submitting = true;
							return async ({ update }) => {
								// On failure the `form` prop updates in place — the cart survives.
								// On success SvelteKit follows the redirect to Stripe.
								await update({ reset: false });
								submitting = false;
							};
						}}
					>
						<input type="hidden" name="licensee_name" value={licenseeName} />
						<input type="hidden" name="eula" value={eula ? '1' : ''} />
						<input type="hidden" name="uses" value={usesJson} />
						<input type="hidden" name="subcontractors" value={subcontractors} />
						{#if uses.web}
							{#each domains as host (host)}
								<input type="hidden" name="web_domain" value={host} />
							{/each}
						{/if}
						{#each lines as line (line.pkg.id)}
							<input type="hidden" name="item_kind" value="tier" />
							<input type="hidden" name="item_tier" value={tierIndex} />
							<input type="hidden" name="item_package" value={line.pkg.id} />
							{#each line.styles as style (style)}
								<input
									type="hidden"
									name="selected_style"
									value={encodeStyleField(line.pkg.id, style)}
								/>
							{/each}
						{/each}
						<button type="submit" class="Checkout" disabled={!canCheckout}>
							{checkoutLocked
								? 'Checkout opens with the sale'
								: submitting
									? 'Redirecting…'
									: 'Checkout'}
						</button>
					</form>
					{#if missing.length > 0 && !checkoutLocked}
						<p class="Total__hint">{missing.join(' · ')}</p>
					{/if}
				</section>
			</aside>
		</div>
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
	.Buy {
		background: var(--color-bg);
		font-family: 'Norma', sans-serif;
		color: var(--color-text);
	}

	/* base.css sets colour on tags directly; let them follow these scopes. */
	.Buy :global(:is(div, span, p, a, li, button, label, h1, h2, h3, small, strong)) {
		color: inherit;
	}

	/* ── Two columns from 1060px (the Header's PC width): the license on the
	   left, the cart on the right — as tall as the screen under the header and
	   scrolling on its own. Below that, they stack. ── */
	@media (min-width: 1060px) {
		.Buy__grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}
	}

	.Buy__license {
		padding: 0 var(--padding) 80px;
		min-width: 0;
	}

	@media (min-width: 1060px) {
		.Buy__license {
			padding-right: 40px;
		}
	}

	.Buy__title {
		margin: 0 0 16px;
		font-size: 32px;
		line-height: 1.1;
		font-weight: 450;
		font-variation-settings: 'wght' 450;
		letter-spacing: 0;
	}

	.Buy__claims {
		list-style: none;
		margin: 0 0 24px;
		padding: 0;
		font-size: 15px;
		line-height: 1.5;
	}

	.Buy__claims li::before {
		content: '✓ ';
	}

	.Buy__note {
		margin: 0 0 24px;
		padding: 12px 16px;
		background: var(--color-bg-gray);
		font-size: 13px;
		line-height: 1.5;
	}

	/* ── A license row (after Rellence's): the label on the left, the question
	   and its control on the right, a rule between rows. ── */
	.Row {
		display: grid;
		grid-template-columns: 9.5em 1fr;
		gap: 12px 20px;
		padding: 22px 0;
		border-top: var(--border-line);
	}

	@media (max-width: 767.98px) {
		.Row {
			grid-template-columns: 1fr;
		}
	}

	.Row__label {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.Row__switch {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: transparent;
		border: 0;
		padding: 0;
		font: inherit;
		cursor: pointer;
		text-align: left;
	}

	.Row__name {
		font-size: 15px;
	}

	.Row__delta {
		font-size: 12px;
		color: var(--color-text-mute) !important;
		font-variant-numeric: tabular-nums;
		margin-left: 24px;
	}

	.Row.is-off .Row__body {
		opacity: 0.5;
	}

	.Row__body {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}

	.Row__info {
		margin: 0;
		font-size: 12px;
		line-height: 1.5;
		color: var(--color-text-mute) !important;
	}

	.Row__info a {
		text-decoration: underline;
	}

	.Row__info--error {
		color: #c4361e !important;
	}

	/* The on/off dot — Kontrapunkt's round radio, filled when on. */
	.Dot {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		border: 1px solid currentColor;
		border-radius: 50%;
		background: transparent;
		box-sizing: border-box;
	}

	.Dot.is-on {
		background: currentColor;
	}

	.Field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.Field__q {
		font-size: 13px;
	}

	.Field__row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.Field__input {
		flex: 1;
		min-width: 0;
		width: 100%;
		background: var(--color-bg);
		border: 1px solid var(--color-text);
		border-radius: 999px;
		padding: 10px 16px;
		font: inherit;
		font-size: 14px;
		color: var(--color-text);
	}

	/* A select's own arrow sits hard against the pill's edge and can't be moved:
	   draw it instead, with room to its right. */
	select.Field__input {
		appearance: none;
		-webkit-appearance: none;
		padding-right: 48px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 20px center;
		background-size: 12px 8px;
		cursor: pointer;
	}

	.Field__off {
		text-align: left;
		cursor: pointer;
		border-style: dashed;
	}

	.Field__add {
		flex-shrink: 0;
		background: var(--color-text);
		color: var(--color-bg) !important;
		border: 0;
		border-radius: 999px;
		padding: 10px 18px;
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}

	.Domains {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 6px;
	}

	.Domains__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.Domains__list li {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: 1px solid var(--color-text);
		border-radius: 999px;
		padding: 4px 6px 4px 12px;
		font-size: 13px;
	}

	.Domains__list button {
		background: transparent;
		border: 0;
		font: inherit;
		cursor: pointer;
	}

	.Addon {
		display: grid;
		grid-template-columns: 14px 1fr auto;
		align-items: start;
		gap: 10px;
		background: transparent;
		border: 0;
		padding: 0;
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.Addon .Dot {
		margin-top: 2px;
	}

	.Addon__text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.Addon__name {
		font-size: 14px;
	}

	.Addon__blurb {
		font-size: 12px;
		color: var(--color-text-mute) !important;
	}

	.Addon .Row__delta {
		margin-left: 0;
	}

	/* ── The cart (after Kontrapunkt's): a black column. ── */
	.Cart {
		background: #000;
		color: #fff;
		border-radius: 30px;
		/* The page margin on its sides and below it, as a card. */
		margin: 0 var(--padding) var(--padding);
		padding: 28px 20px 40px;
		--mute: rgba(255, 255, 255, 0.55);
		--rule: rgba(255, 255, 255, 0.25);
	}

	@media (min-width: 1060px) {
		.Cart {
			position: sticky;
			top: var(--header-bar-h);
			height: calc(100dvh - var(--header-bar-h) - var(--padding));
			margin: 0 var(--padding) var(--padding) 0;
			overflow-y: auto;
			overscroll-behavior: contain;
			padding: 28px 32px 40px;
			box-sizing: border-box;
		}
	}

	.Cart__title {
		margin: 0 0 20px;
		padding-bottom: 14px;
		border-bottom: 1px solid #fff;
		font-size: 18px;
		font-weight: 450;
		font-variation-settings: 'wght' 450;
	}

	/* base.css pads every <section> with the page inset; the cart has its own. */
	.Face,
	.More {
		padding: 0;
	}

	.Face {
		margin-bottom: 28px;
	}

	.Face__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 10px;
	}

	.Face__pill {
		display: inline-block;
		background: #fff;
		color: #000 !important;
		border-radius: 999px;
		padding: 6px 16px;
		font-size: 22px;
		line-height: 1.1;
	}

	.Face__remove,
	.More__add {
		background: transparent;
		border: 0;
		font: inherit;
		font-size: 13px;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.Face__stage {
		margin: 0 0 8px;
		font-size: 12px;
		line-height: 1.5;
		color: var(--mute) !important;
	}

	.Face__group {
		margin: 18px 0 6px;
		font-size: 15px;
		font-weight: 450;
		font-variation-settings: 'wght' 450;
	}

	/* An option: dot, name, the styles set in themselves, price. */
	.Option {
		display: grid;
		/* Fixed tracks, so every option's columns line up whatever its text. */
		grid-template-columns: 16px minmax(0, 0.9fr) minmax(0, 1.6fr) 110px;
		align-items: start;
		gap: 4px 14px;
		width: calc(100% + 20px);
		background: transparent;
		border: 0;
		border-radius: 12px;
		padding: 8px 10px;
		margin: 0 -10px;
		font: inherit;
		text-align: left;
		cursor: pointer;
		box-sizing: border-box;
	}

	.Option.is-on {
		background: rgba(255, 255, 255, 0.18);
	}

	.Option:not(.is-on):not(:disabled):hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.Option:disabled {
		cursor: default;
	}

	.Option .Dot {
		margin-top: 3px;
	}

	/* Selected, in the cart: a white disc with a smaller dot inside it. */
	.Cart .Dot {
		position: relative;
		width: 16px;
		height: 16px;
		border-color: #fff;
	}

	.Cart .Dot.is-on {
		background: #fff;
	}

	.Cart .Dot.is-on::after {
		content: '';
		position: absolute;
		inset: 0;
		margin: auto;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #000;
	}

	.Option__name {
		font-size: 15px;
		display: flex;
		flex-direction: column;
	}

	.Option__sub {
		font-size: 12px;
		color: var(--mute) !important;
	}

	.Option__samples {
		display: flex;
		flex-direction: column;
		font-size: 15px;
		line-height: 1.35;
		min-width: 0;
	}

	.Option__samples span {
		color: var(--mute) !important;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.Option__samples .is-soon,
	.Option.is-soon {
		opacity: 0.45;
	}

	.Option__price {
		font-size: 15px;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		text-align: right;
	}

	@media (max-width: 767.98px) {
		.Option {
			grid-template-columns: 16px minmax(0, 1fr) 110px;
		}

		.Option__samples {
			grid-column: 2 / 3;
			grid-row: 2;
		}
	}

	.More ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.More li {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		border-top: 1px solid var(--rule);
		font-size: 15px;
	}

	.More li.is-soon span {
		color: var(--mute) !important;
	}

	.Total {
		margin-top: 28px;
		padding: 16px 0 0;
		border-top: 1px solid var(--rule);
	}

	.Total__row {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		font-size: 15px;
		padding: 3px 0;
		font-variant-numeric: tabular-nums;
	}

	.Total__row--mute span {
		color: var(--mute) !important;
	}

	.Total__row--total {
		margin-top: 18px;
		font-size: 26px;
	}

	.Total__row--total small {
		font-size: 12px;
		vertical-align: super;
		color: var(--mute) !important;
	}

	.Summary {
		list-style: none;
		margin: 16px 0;
		padding: 16px 0 0;
		border-top: 1px solid var(--rule);
		font-size: 14px;
		line-height: 1.55;
	}

	.Summary li::before {
		content: '· ';
	}

	.Summary li.is-missing {
		font-style: italic;
		color: var(--mute) !important;
	}

	.Eula {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 14px;
		line-height: 1.4;
		cursor: pointer;
	}

	.Eula input {
		width: 18px;
		height: 18px;
		margin: 0;
		accent-color: #fff;
		flex-shrink: 0;
	}

	.Eula a {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.Checkout {
		width: 100%;
		margin-top: 18px;
		padding: 12px;
		border: 1px solid #fff;
		border-radius: 999px;
		background: #fff;
		color: #000 !important;
		font: inherit;
		font-size: 16px;
		cursor: pointer;
	}

	.Checkout:disabled {
		background: transparent;
		color: var(--mute) !important;
		border-color: var(--rule);
		cursor: default;
	}

	.Total__hint,
	.Total__error {
		margin: 10px 0 0;
		font-size: 12px;
		line-height: 1.5;
		color: var(--mute) !important;
	}

	.Total__error {
		color: #ff8a73 !important;
	}
</style>
