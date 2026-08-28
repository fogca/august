<script lang="ts">
	// License picker — single choice: pick a company-size tier (bundled full
	// commercial use, except Individual which stays desktop-only) or a flat
	// Project License for agency-on-behalf-of-client purchases. Only one
	// selection is active at a time.
	//
	// Replaces the old model of independently toggleable Desktop / Web / App /
	// Books licence cards, each with its own tier — one unified licence per
	// tier now covers every use case, so there is nothing left to combine.
	import {
		TIER_DEFS,
		getPrice,
		getGrossPrice,
		getTierScope,
		SCOPE_BLURB,
		PROJECT_LICENSE_EUR,
		PROJECT_LICENSE_LABEL,
		PROJECT_LICENSE_BLURB,
		formatPrice
	} from '$lib/data/pricing';
	import type { PackageDef } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';

	interface Props {
		cartItems: CartItem[];
		/** All currently selected packages — used for price resolution. */
		packages: PackageDef[];
		/** Called when a tier or the Project License is selected. */
		onselect: (item: CartItem) => void;
		/** Called when the active selection is cleared. */
		onremove: () => void;
		/** Overridable heading — lets a numbered step flow read "2 — License". */
		title?: string;
		hint?: string;
	}

	let {
		cartItems,
		packages,
		onselect,
		onremove,
		title = 'License',
		hint = 'Choose your organisation size, or a Project License if you are buying on behalf of a client.'
	}: Props = $props();

	// At most one selection is ever active — every package (today, always one)
	// carries the same kind/tier, so the first item represents the selection.
	const activeItem = $derived<CartItem | null>(cartItems[0] ?? null);
	const activeTier = $derived(activeItem?.kind === 'tier' ? activeItem.tierIndex : null);
	const activeIsProject = $derived(activeItem?.kind === 'project');

	// Shows the inline custom-quote notice when the Global tier is picked
	let enterpriseNotice = $state(false);

	function tierPrice(tierIndex: number): number | null {
		if (packages.length === 0) return null;
		return getPrice(packages[0], tierIndex);
	}

	function selectTier(tierIndex: number) {
		const tier = TIER_DEFS.find((t) => t.index === tierIndex);
		if (tier?.multiplier === null) {
			// Global has no self-serve price — show the inline quote notice
			// instead of navigating away (which would silently discard the cart).
			enterpriseNotice = true;
			return;
		}
		enterpriseNotice = false;

		if (packages.length === 0) {
			onselect({ kind: 'tier', tierIndex, basePrice: 0, grossPrice: 0, packageId: '' });
			return;
		}
		for (const pkg of packages) {
			const price = getPrice(pkg, tierIndex);
			const gross = getGrossPrice(pkg, tierIndex);
			onselect({ kind: 'tier', tierIndex, basePrice: price ?? 0, grossPrice: gross ?? 0, packageId: pkg.id });
		}
	}

	function selectProject() {
		enterpriseNotice = false;
		if (packages.length === 0) {
			onselect({ kind: 'project', tierIndex: null, basePrice: 0, grossPrice: 0, packageId: '' });
			return;
		}
		for (const pkg of packages) {
			onselect({
				kind: 'project',
				tierIndex: null,
				basePrice: PROJECT_LICENSE_EUR,
				grossPrice: PROJECT_LICENSE_EUR,
				packageId: pkg.id
			});
		}
	}

	function toggleTier(tierIndex: number) {
		if (activeTier === tierIndex) {
			onremove();
			return;
		}
		selectTier(tierIndex);
	}

	function toggleProject() {
		if (activeIsProject) {
			onremove();
			return;
		}
		selectProject();
	}
</script>

<div class="LicensePicker">
	<h2 class="LicensePicker__title">{title}</h2>
	<p class="LicensePicker__hint">{hint}</p>

	<div class="LicensePicker__rows">
		{#each TIER_DEFS as tier (tier.index)}
			{@const active = activeTier === tier.index}
			{@const scope = getTierScope(tier.index)}
			<button
				type="button"
				class="LicensePicker__card"
				class:is-active={active}
				onclick={() => toggleTier(tier.index)}
				aria-pressed={active}
				aria-label={`${active ? 'Deselect' : 'Select'} ${tier.name} license`}
			>
				<span class="LicensePicker__radio" aria-hidden="true">
					{#if active}<span class="LicensePicker__dot"></span>{/if}
				</span>

				<span class="LicensePicker__body">
					<span class="LicensePicker__name">{tier.name}</span>
					<span class="LicensePicker__blurb">{tier.label} — {SCOPE_BLURB[scope]}</span>
				</span>

				<span class="LicensePicker__price">
					{#if packages.length > 0}
						{@const price = tierPrice(tier.index)}
						{price === null ? 'Custom quote' : formatPrice(price)}
					{/if}
				</span>
			</button>
			{#if enterpriseNotice && tier.multiplier === null}
				<p class="LicensePicker__enterprise" role="status">
					This scale requires a custom quote — <a href="/contact">contact us</a>.
				</p>
			{/if}
		{/each}

		<p class="LicensePicker__divider">or, buying for a client</p>

		<button
			type="button"
			class="LicensePicker__card"
			class:is-active={activeIsProject}
			onclick={toggleProject}
			aria-pressed={activeIsProject}
			aria-label={`${activeIsProject ? 'Deselect' : 'Select'} ${PROJECT_LICENSE_LABEL}`}
		>
			<span class="LicensePicker__radio" aria-hidden="true">
				{#if activeIsProject}<span class="LicensePicker__dot"></span>{/if}
			</span>

			<span class="LicensePicker__body">
				<span class="LicensePicker__name">{PROJECT_LICENSE_LABEL}</span>
				<span class="LicensePicker__blurb">{PROJECT_LICENSE_BLURB}</span>
			</span>

			<span class="LicensePicker__price">
				{#if packages.length > 0}{formatPrice(PROJECT_LICENSE_EUR)}{/if}
			</span>
		</button>
	</div>
</div>

<style>
	.LicensePicker {
		margin-bottom: 40px;
	}

	.LicensePicker__title {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin-bottom: 8px;
	}

	.LicensePicker__hint {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		margin-bottom: 20px;
	}

	/* Column of cards */
	.LicensePicker__rows {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.LicensePicker__divider {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		text-align: center;
		margin: 8px 0;
	}

	.LicensePicker__card {
		display: flex;
		align-items: center;
		width: 100%;
		gap: 14px;
		padding: 16px 18px;
		background: var(--color-bg-gray);
		border: 0;
		cursor: pointer;
		text-align: left;
		font: inherit;
		color: var(--color-text);
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	/* Selected: invert to a solid black card with white text */
	.LicensePicker__card.is-active {
		background: var(--color-text);
		color: var(--color-bg);
	}

	/* base.css sets color directly on nested spans, breaking the inherit
	   chain — force every descendant to actually inherit the card's colour. */
	.LicensePicker__card :global(*) {
		color: inherit;
	}

	/* Left-edge radio — fills when this tier is selected */
	.LicensePicker__radio {
		width: 11px;
		height: 11px;
		border: 1px solid currentColor;
		border-radius: 50%;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.LicensePicker__dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: currentColor;
	}

	.LicensePicker__body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.LicensePicker__name {
		font-family: 'Steiner', sans-serif;
		font-size: 16px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
	}

	.LicensePicker__blurb {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.5;
		opacity: 0.7;
	}

	.LicensePicker__price {
		flex-shrink: 0;
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 450;
		letter-spacing: 0;
		white-space: nowrap;
	}

	/* Inline enterprise-quote notice (replaces the old hard redirect to /contact) */
	.LicensePicker__enterprise {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.5;
		margin: -4px 0 0;
		padding: 0 18px;
	}

	.LicensePicker__enterprise a {
		text-decoration: underline;
		text-underline-offset: 2px;
	}
</style>
