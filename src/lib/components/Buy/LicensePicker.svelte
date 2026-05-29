<script lang="ts">
	// License picker — toggle select + stepper for tier; no dropdown.
	// Card click = toggle license on/off.
	// Arrow buttons (‹ ›) = change tier independently without affecting selection state.
	import { LICENSES, TIER_DEFS, getPrice, getGrossPrice, getTierLabel } from '$lib/data/pricing';
	import type { LicenseType, Currency, PackageDef } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';

	interface Props {
		currency: Currency;
		cartItems: CartItem[];
		/** All currently selected packages — used for price resolution. */
		packages: PackageDef[];
		/** Per-license tier selections (maintained in parent). */
		tierSelections: Map<LicenseType, number>;
		/** Called when a license card is toggled or tier changes on an active license. */
		onselect: (item: CartItem) => void;
		onremove: (licenseType: LicenseType) => void;
		/**
		 * Called when the stepper is used on an INACTIVE license card.
		 * Only updates the tier preview — does not add the license to the cart.
		 */
		ontierstep: (licenseType: LicenseType, tierIndex: number) => void;
	}

	let { currency, cartItems, packages, tierSelections, onselect, onremove, ontierstep }: Props = $props();

	const isActive = (lt: LicenseType): boolean => cartItems.some((i) => i.licenseType === lt);

	/** Current tier index for a license (default 1). */
	function currentTierIndex(lt: LicenseType): number {
		return tierSelections.get(lt) ?? 1;
	}

	/** Human-readable tier label for a given license + tier index. */
	function tierLabelFor(lt: LicenseType, tierIndex: number): string {
		const license = LICENSES.find((l) => l.id === lt)!;
		return getTierLabel(license, tierIndex);
	}

	/**
	 * Toggle the license card.
	 * Inactive → activate with current (or default) tier.
	 * Active → deactivate.
	 */
	function toggleCard(lt: LicenseType) {
		if (isActive(lt)) {
			onremove(lt);
			return;
		}
		const license = LICENSES.find((l) => l.id === lt)!;
		const tierIndex = currentTierIndex(lt);
		const tier = TIER_DEFS.find((t) => t.index === tierIndex);

		if (tier?.multiplier === null) {
			// Enterprise tier — redirect to contact
			window.location.href = '/contact';
			return;
		}

		if (packages.length > 0) {
			// Resolve price against first selected package;
			// parent handleTierSelect handles all packages internally.
			const pkg = packages[0];
			const price = getPrice(pkg, license, tierIndex, currency);
			const gross = getGrossPrice(pkg, license, tierIndex, currency);
			onselect({
				licenseType: lt,
				tierId: String(tierIndex),
				tierIndex,
				basePrice: price ?? 0,
				grossPrice: gross ?? 0,
				packageId: pkg.id
			});
		} else {
			// No packages yet — placeholder; price resolved later.
			onselect({
				licenseType: lt,
				tierId: String(tierIndex),
				tierIndex,
				basePrice: 0,
				grossPrice: 0,
				packageId: ''
			});
		}
	}

	/**
	 * Set the tier for a license from the dropdown.
	 * Inactive card → just preview the tier (no cart change).
	 * Active card → update tier across all selected packages.
	 * Tier 12 (enterprise) is kept selectable; price resolves to "Contact".
	 */
	function setTier(lt: LicenseType, next: number) {
		if (next === currentTierIndex(lt)) return;
		const license = LICENSES.find((l) => l.id === lt)!;

		if (!isActive(lt)) {
			ontierstep(lt, next);
			return;
		}

		if (packages.length > 0) {
			for (const pkg of packages) {
				const price = getPrice(pkg, license, next, currency);
				const gross = getGrossPrice(pkg, license, next, currency);
				onselect({
					licenseType: lt,
					tierId: String(next),
					tierIndex: next,
					basePrice: price ?? 0,
					grossPrice: gross ?? 0,
					packageId: pkg.id
				});
			}
		} else {
			onselect({
				licenseType: lt,
				tierId: String(next),
				tierIndex: next,
				basePrice: 0,
				grossPrice: 0,
				packageId: ''
			});
		}
	}
</script>

<div class="LicensePicker">
	<h2 class="LicensePicker__title">License</h2>
	<p class="LicensePicker__hint">Choose one or more license types and set your scale.</p>

	<div class="LicensePicker__rows">
		{#each LICENSES as license (license.id)}
			{@const active = isActive(license.id)}
			{@const tierIndex = currentTierIndex(license.id)}
			<div class="LicensePicker__card" class:is-active={active}>
				<!-- Card body: click = toggle selection -->
				<button
					type="button"
					class="LicensePicker__head"
					onclick={() => toggleCard(license.id)}
					aria-pressed={active}
					aria-label={`${active ? 'Deselect' : 'Select'} ${license.label} license`}
				>
					<span class="LicensePicker__radio" aria-hidden="true">
						{#if active}<span class="LicensePicker__dot"></span>{/if}
					</span>

					<span class="LicensePicker__body">
						<span class="LicensePicker__name">{license.label}</span>
						<span class="LicensePicker__blurb">{license.blurb}</span>
					</span>
				</button>

				<!-- Tier dropdown: shows all tiers at once; independent of card toggle -->
				<div class="LicensePicker__tier">
					<select
						class="LicensePicker__select"
						aria-label={`${license.label} license scale`}
						value={tierIndex}
						onchange={(e) => setTier(license.id, Number(e.currentTarget.value))}
					>
						{#each TIER_DEFS as t (t.index)}
							<option value={t.index}>{tierLabelFor(license.id, t.index)}</option>
						{/each}
					</select>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.LicensePicker {
		margin-bottom: 40px;
	}

	.LicensePicker__title {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 500;
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

	.LicensePicker__card {
		display: flex;
		align-items: flex-start;
		background: var(--color-bg-gray);
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	/* Selected: invert to a solid black card with white text */
	.LicensePicker__card.is-active {
		background: var(--color-text);
		color: var(--color-bg);
	}

	.LicensePicker__card.is-active .LicensePicker__name,
	.LicensePicker__card.is-active .LicensePicker__blurb,
	.LicensePicker__card.is-active .LicensePicker__radio {
		color: var(--color-bg);
	}

	/* Selected radio: solid white fill */
	.LicensePicker__card.is-active .LicensePicker__radio {
		background: var(--color-bg);
		border-color: var(--color-bg);
	}

	/* Card head: label + blurb area (clickable toggle) */
	.LicensePicker__head {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		flex: 1;
		min-width: 0;
		padding: 20px 18px 16px;
		background: transparent;
		border: 0;
		cursor: pointer;
		text-align: left;
	}

	/* Left-edge radio — fills when this license type is selected */
	.LicensePicker__radio {
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
		gap: 6px;
	}

	.LicensePicker__name {
		font-family: 'Steiner', sans-serif;
		font-size: 18px;
		font-variation-settings: 'wght' 450;
		letter-spacing: 0;
	}

	.LicensePicker__blurb {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 300;
		line-height: 1.5;
		color: var(--color-text-mute);
	}

	/* ── Tier dropdown — top-right, beside the licence name ── */
	.LicensePicker__tier {
		flex-shrink: 0;
		padding: 18px 18px 0 0;
	}

	.LicensePicker__select {
		width: auto;
		min-width: 104px;
		max-width: 150px;
		padding: 7px 28px 7px 10px;
		background: var(--color-bg);
		border: 1px solid var(--color-line);
		border-radius: 0;
		cursor: pointer;
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 400;
		color: var(--color-text);
		letter-spacing: 0;
		-webkit-appearance: none;
		appearance: none;
		/* chevron */
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23000' fill='none' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		transition: border-color 120ms;
	}

	.LicensePicker__select:hover {
		border-color: var(--color-text);
	}

	.LicensePicker__card.is-active .LicensePicker__select {
		font-variation-settings: 'wght' 450;
		background-color: transparent;
		color: var(--color-bg);
		border-color: rgba(255, 255, 255, 0.4);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23fff' fill='none' stroke-width='1'/%3E%3C/svg%3E");
	}

	/* Keep the native dropdown list readable (dark text on system bg) */
	.LicensePicker__card.is-active .LicensePicker__select option {
		color: var(--color-text);
	}
</style>
