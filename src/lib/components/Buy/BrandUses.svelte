<script lang="ts" module>
	import {
		TIER_DEFS,
		TOPPINGS,
		DEFAULT_BRAND_USES,
		MAX_SUBCONTRACTORS,
		SUB_LICENSE_EUR,
		formatPrice,
		priceBrand,
		type BrandInput,
		type PackageDef,
		type ToppingId
	} from '$lib/data/pricing';

	// What a brand draft is, shared with the page that prices and posts it.
	export interface BrandDraft {
		id: number;
		name: string;
		/** The brand's own size: a TIER_DEFS index, as the <select>'s string. */
		tier: string;
		/** The uses switched on: topping id → option id. Absent = off. */
		uses: Record<string, string>;
		/** The styles it uses, per package id. */
		styles: Record<string, string[]>;
	}

	/** What a brand may pick from: the styles the licence holds and are drawn. */
	export interface StyleChoice {
		pkg: PackageDef;
		styles: { id: string; label: string }[];
	}

	/** A draft as the pricing and the checkout read it. */
	export function toBrandInput(draft: BrandDraft, choices: StyleChoice[]): BrandInput {
		const styles: Record<string, string[]> = {};
		for (const choice of choices) {
			const allowed = new Set(choice.styles.map((s) => s.id));
			const picked = (draft.styles[choice.pkg.id] ?? []).filter((s) => allowed.has(s));
			if (picked.length > 0) styles[choice.pkg.id] = picked;
		}
		return {
			name: draft.name.trim(),
			tierIndex: Number(draft.tier),
			uses: Object.entries(draft.uses).map(([topping, option]) => ({
				topping: topping as ToppingId,
				option
			})),
			styles
		};
	}
</script>

<script lang="ts">
	// Step 4 — the brands that use the typefaces beyond ordinary design work
	// (a logo, a website, social media …). Everyday work is the licence itself;
	// this is bought per brand, for the styles that brand uses, at the brand's
	// own size (2026-11-06, the user's design after Rellence). A brand starts
	// with the uses most brands need — one logo, one website, its social
	// media — and each can be taken off, so the price shown is what most buyers
	// pay and only ever goes down from there. A brand is only ever started by
	// the buyer's own click ("For my own brand", "Add a client"), never
	// pre-filled behind their back.

	interface Props {
		choices: StyleChoice[];
		brands: BrandDraft[];
		subcontractors: number;
		/** Step 1's company name and resolved tier, for "my own brand". */
		ownerName: string;
		ownerTier: number | null;
	}

	let {
		choices,
		brands = $bindable(),
		subcontractors = $bindable(),
		ownerName,
		ownerTier
	}: Props = $props();

	/** A client's size until the buyer says: the same default as Step 1's. */
	const DEFAULT_CLIENT_TIER = 3;

	const SIZE_OPTIONS = TIER_DEFS.filter((t) => t.perStyleEur !== null);

	let nextId = 1;

	/** A new brand's styles: the first typeface's Regular (else its first style). */
	function startingStyles(): Record<string, string[]> {
		const first = choices[0];
		if (!first || first.styles.length === 0) return {};
		const regular = first.styles.find((s) => s.id === first.pkg.defaultStyle) ?? first.styles[0];
		return { [first.pkg.id]: [regular.id] };
	}

	function startingUses(): Record<string, string> {
		return Object.fromEntries(DEFAULT_BRAND_USES.map((u) => [u.topping, u.option]));
	}

	function addBrand(name: string, tier: number) {
		brands = [
			...brands,
			{ id: nextId++, name, tier: String(tier), uses: startingUses(), styles: startingStyles() }
		];
	}

	const addOwn = () => addBrand(ownerName, ownerTier ?? DEFAULT_CLIENT_TIER);
	const addClient = () => addBrand('', DEFAULT_CLIENT_TIER);
	const remove = (id: number) => (brands = brands.filter((b) => b.id !== id));

	function toggleUse(brand: BrandDraft, topping: ToppingId, optionId: string) {
		if (brand.uses[topping]) delete brand.uses[topping];
		else brand.uses[topping] = optionId;
	}

	function toggleStyle(brand: BrandDraft, packageId: string, style: string) {
		const list = brand.styles[packageId] ?? [];
		brand.styles[packageId] = list.includes(style)
			? list.filter((s) => s !== style)
			: [...list, style];
	}

	/** A brand's price per topping, and in all. */
	function pricing(brand: BrandDraft) {
		const lines = priceBrand(toBrandInput(brand, choices));
		const byTopping = (id: string) =>
			lines.filter((l) => l.topping.id === id).reduce((sum, l) => sum + l.price, 0);
		return { byTopping, total: lines.reduce((sum, l) => sum + l.price, 0) };
	}

	const hasOwn = $derived(ownerName.trim() !== '' && brands.some((b) => b.name === ownerName));
</script>

<div class="Brands">
	<p class="Brands__lead">
		Everyday design work — print, packaging, signage, presentations — is covered by your licence. A
		brand’s logo, website or social media is added per brand, for the styles it uses.
	</p>

	<div class="Brands__start">
		{#if ownerTier !== null && !hasOwn}
			<button type="button" class="Brands__add" onclick={addOwn}>For my own brand</button>
		{/if}
		<button type="button" class="Brands__add" onclick={addClient}>Add a client</button>
	</div>

	{#each brands as brand (brand.id)}
		{@const price = pricing(brand)}
		<section class="Brand" aria-label={brand.name || 'Brand'}>
			<div class="Brand__head">
				<input
					class="Brand__input Brand__name"
					type="text"
					bind:value={brand.name}
					placeholder="Brand or client name"
					aria-label="Brand or client name"
				/>
				<button type="button" class="Brand__remove" onclick={() => remove(brand.id)}>Remove</button>
			</div>

			<label class="Brand__field">
				<span class="Brand__label">Size of the brand</span>
				<select class="Brand__input" bind:value={brand.tier}>
					{#each SIZE_OPTIONS as t (t.index)}
						<option value={String(t.index)}>{t.index === 1 ? t.label : `${t.label} people`}</option>
					{/each}
				</select>
			</label>

			<div class="Brand__uses">
				<p class="Brand__label">Uses</p>
				{#each TOPPINGS as topping (topping.id)}
					{@const on = brand.uses[topping.id] !== undefined}
					<div class="Use" class:is-on={on}>
						<button
							type="button"
							class="Use__toggle"
							aria-pressed={on}
							onclick={() => toggleUse(brand, topping.id, topping.options[0].id)}
						>
							<span class="Use__radio" aria-hidden="true">
								{#if on}<span class="Use__dot"></span>{/if}
							</span>
							<span class="Use__name">{topping.label}</span>
							<span class="Use__blurb">{topping.blurb}</span>
						</button>
						{#if on}
							{#if topping.options.length > 1}
								<select
									class="Brand__input Use__option"
									aria-label="{topping.label} option"
									bind:value={brand.uses[topping.id]}
								>
									{#each topping.options as option (option.id)}
										<option value={option.id}>{option.label}</option>
									{/each}
								</select>
							{/if}
							<span class="Use__price">
								{price.byTopping(topping.id) > 0 ? formatPrice(price.byTopping(topping.id)) : '—'}
							</span>
						{/if}
					</div>
				{/each}
			</div>

			<div class="Brand__styles">
				<p class="Brand__label">Styles it uses</p>
				{#each choices as choice (choice.pkg.id)}
					<div class="Chips">
						{#if choices.length > 1}<span class="Chips__pkg">{choice.pkg.label}</span>{/if}
						{#each choice.styles as style (style.id)}
							{@const on = brand.styles[choice.pkg.id]?.includes(style.id) ?? false}
							<button
								type="button"
								class="Chip"
								class:is-on={on}
								aria-pressed={on}
								onclick={() => toggleStyle(brand, choice.pkg.id, style.id)}
							>
								{style.label}
							</button>
						{/each}
					</div>
				{/each}
			</div>

			<p class="Brand__total">
				<span>{brand.name.trim() || 'This brand'}</span>
				<span>{price.total > 0 ? formatPrice(price.total) : '—'}</span>
			</p>
			{#if brand.name.trim() === ''}
				<p class="Brand__hint">Name the brand to include it in your order.</p>
			{:else if price.total === 0}
				<p class="Brand__hint">Pick at least one use and one style.</p>
			{/if}
		</section>
	{/each}

	<div class="Sub">
		<div class="Sub__text">
			<p class="Sub__title">Subcontractors</p>
			<p class="Sub__blurb">
				Share the fonts with a freelancer or a printer — {formatPrice(SUB_LICENSE_EUR)} each, for any
				styles.
			</p>
		</div>
		<div class="Sub__stepper">
			<button
				type="button"
				aria-label="Fewer subcontractors"
				disabled={subcontractors <= 0}
				onclick={() => (subcontractors = Math.max(0, subcontractors - 1))}>−</button
			>
			<span aria-live="polite">{subcontractors}</span>
			<button
				type="button"
				aria-label="More subcontractors"
				disabled={subcontractors >= MAX_SUBCONTRACTORS}
				onclick={() => (subcontractors = Math.min(MAX_SUBCONTRACTORS, subcontractors + 1))}
				>+</button
			>
		</div>
	</div>
</div>

<style>
	.Brands {
		width: 100%;
		max-width: 480px;
		font-family: 'Norma', sans-serif;
		color: var(--color-text);
	}

	.Brands :global(*) {
		color: inherit;
	}

	.Brands__lead {
		margin: 0 0 16px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--color-text-mute);
	}

	.Brands__start {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 16px;
	}

	.Brands__add {
		background: transparent;
		border: var(--border-line);
		padding: 10px 16px;
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}

	.Brands__add:hover {
		background: var(--color-bg-gray);
	}

	.Brand {
		border: var(--border-line);
		background: var(--color-bg);
		padding: 16px var(--padding) 18px;
		margin-bottom: 10px;
	}

	.Brand__head {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.Brand__input {
		width: 100%;
		min-width: 0;
		background: var(--color-bg);
		border: var(--border-line);
		padding: 9px 12px;
		font: inherit;
		font-size: 14px;
		border-radius: 0;
	}

	.Brand__name {
		font-size: 16px;
	}

	.Brand__remove,
	.Sub__stepper button {
		background: transparent;
		border: 0;
		font: inherit;
		font-size: 12px;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		flex-shrink: 0;
	}

	.Brand__field {
		display: block;
		margin-bottom: 16px;
	}

	.Brand__label {
		margin: 0 0 6px;
		font-size: 11px;
		color: var(--color-text-mute);
	}

	.Brand__uses,
	.Brand__styles {
		margin-bottom: 16px;
	}

	.Use {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 6px 12px;
		padding: 8px 0;
		border-top: var(--border-line);
	}

	.Use__toggle {
		display: grid;
		grid-template-columns: 11px auto 1fr;
		align-items: baseline;
		gap: 4px 10px;
		text-align: left;
		background: transparent;
		border: 0;
		padding: 0;
		font: inherit;
		cursor: pointer;
		opacity: 0.45;
		transition: opacity 150ms ease;
	}

	.Use.is-on .Use__toggle {
		opacity: 1;
	}

	.Use__toggle:hover {
		opacity: 0.75;
	}

	.Use__radio {
		width: 11px;
		height: 11px;
		border: 1px solid currentColor;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		align-self: center;
	}

	.Use__dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: currentColor;
	}

	.Use__name {
		font-size: 14px;
	}

	.Use__blurb {
		font-size: 11px;
		color: var(--color-text-mute);
		grid-column: 2 / -1;
	}

	.Use__option {
		grid-column: 1 / 2;
		font-size: 12px;
		padding: 6px 10px;
	}

	.Use__price {
		grid-column: 2 / 3;
		grid-row: 1 / 3;
		align-self: center;
		font-size: 13px;
		font-variant-numeric: tabular-nums;
	}

	.Chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		margin-bottom: 6px;
	}

	.Chips__pkg {
		font-size: 11px;
		color: var(--color-text-mute);
		margin-right: 4px;
	}

	.Chip {
		background: transparent;
		border: var(--border-line);
		padding: 5px 10px;
		font: inherit;
		font-size: 12px;
		cursor: pointer;
		opacity: 0.45;
	}

	.Chip.is-on {
		opacity: 1;
		background: var(--color-bg-gray);
	}

	.Brand__total {
		display: flex;
		justify-content: space-between;
		margin: 0;
		padding-top: 10px;
		border-top: var(--border-line);
		font-size: 14px;
	}

	.Brand__hint {
		margin: 6px 0 0;
		font-size: 11px;
		color: var(--color-text-mute);
	}

	.Sub {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		border: var(--border-line);
		padding: 14px var(--padding);
	}

	.Sub__title {
		margin: 0;
		font-size: 14px;
	}

	.Sub__blurb {
		margin: 4px 0 0;
		font-size: 11px;
		line-height: 1.5;
		color: var(--color-text-mute);
	}

	.Sub__stepper {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 14px;
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.Sub__stepper button {
		text-decoration: none;
		font-size: 18px;
		padding: 0 6px;
	}

	.Sub__stepper button:disabled {
		opacity: 0.3;
		cursor: default;
	}
</style>
