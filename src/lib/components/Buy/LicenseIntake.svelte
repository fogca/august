<script lang="ts">
	// License intake — the qualifying step that comes BEFORE typeface
	// selection. Rather than a free-browse tier picker (which necessarily
	// shows every tier's price side by side), this asks who the licence is
	// for first and derives the one applicable tier from that answer. Only
	// the resolved tier's price is ever shown downstream — see
	// resolveTierForHeadcount in $lib/data/pricing.
	import {
		TIER_DEFS,
		getPrice,
		getTierDef,
		getTierScope,
		SCOPE_BLURB,
		PROJECT_LICENSE_EUR,
		PROJECT_LICENSE_LABEL,
		PROJECT_LICENSE_BLURB,
		formatPrice
	} from '$lib/data/pricing';
	import type { PackageDef } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';

	export type IntakePath = 'individual' | 'organisation' | 'project';

	export interface IntakeMeta {
		path: IntakePath | null;
		// Organisation name (organisation path) or purchasing studio/agency
		// name (project path) — becomes the Sales Receipt's "Licensee" /
		// "Purchaser". Empty for the individual path (Stripe collects the
		// buyer's own name at payment).
		licenseeName: string;
		// Project License only — the named Brand the licence is scoped to.
		clientName: string;
		// Organisation path only — free-entry context alongside usageBand;
		// doesn't affect price, just records overall company size.
		totalHeadcount: number | null;
		// Organisation path only — the declared tier's headcount range (e.g.
		// "up to 10"), picked from a select rather than typed as an exact
		// number — see ORG_TIERS below.
		usageBand: string | null;
	}

	// Team through Global — the pickable range options for "people using the
	// fonts". A select of fixed bands, not a free number field: it removes
	// any ambiguity about which tier a typed number resolves to, and reads as
	// answering a factual question about the org rather than shopping a price
	// list (the ranges are the only thing shown — no tier names, no prices
	// for anything other than the one that ends up resolved).
	const ORG_TIERS = TIER_DEFS.filter((t) => t.index >= 2);

	interface Props {
		packages: PackageDef[];
		onresolve: (item: CartItem | null, meta: IntakeMeta) => void;
	}

	let { packages, onresolve }: Props = $props();

	let path = $state<IntakePath | null>(null);

	// Organisation path fields
	let companyName = $state('');
	let totalHeadcountStr = $state('');
	let orgTierIndexStr = $state('');

	// Project path fields
	let purchaserName = $state('');
	let clientName = $state('');

	function selectPath(p: IntakePath) {
		path = p;
	}

	const totalN = $derived(Number(totalHeadcountStr));
	const totalValid = $derived(totalHeadcountStr.trim() !== '' && Number.isInteger(totalN) && totalN > 0);

	const resolvedTier = $derived(orgTierIndexStr ? (getTierDef(Number(orgTierIndexStr)) ?? null) : null);
	const isEnterpriseScale = $derived(resolvedTier !== null && resolvedTier.multiplier === null);

	const organisationReady = $derived(
		path === 'organisation' &&
			companyName.trim().length > 0 &&
			resolvedTier !== null &&
			totalValid &&
			!isEnterpriseScale
	);
	const projectReady = $derived(
		path === 'project' && purchaserName.trim().length > 0 && clientName.trim().length > 0
	);
	const individualReady = $derived(path === 'individual');

	const pkg = $derived(packages[0] ?? null);

	// Emit the resolved cart item (or null while unresolved) whenever the
	// relevant inputs change — the parent derives its cart directly from this.
	$effect(() => {
		if (individualReady && pkg) {
			const price = getPrice(pkg, 1);
			onresolve(
				{ kind: 'tier', tierIndex: 1, basePrice: price ?? 0, grossPrice: price ?? 0, packageId: pkg.id },
				{ path: 'individual', licenseeName: '', clientName: '', totalHeadcount: null, usageBand: null }
			);
		} else if (organisationReady && resolvedTier && pkg) {
			const price = getPrice(pkg, resolvedTier.index);
			onresolve(
				{
					kind: 'tier',
					tierIndex: resolvedTier.index,
					basePrice: price ?? 0,
					grossPrice: price ?? 0,
					packageId: pkg.id
				},
				{
					path: 'organisation',
					licenseeName: companyName.trim(),
					clientName: '',
					totalHeadcount: totalN,
					usageBand: resolvedTier.label
				}
			);
		} else if (projectReady && pkg) {
			onresolve(
				{
					kind: 'project',
					tierIndex: null,
					basePrice: PROJECT_LICENSE_EUR,
					grossPrice: PROJECT_LICENSE_EUR,
					packageId: pkg.id
				},
				{
					path: 'project',
					licenseeName: purchaserName.trim(),
					clientName: clientName.trim(),
					totalHeadcount: null,
					usageBand: null
				}
			);
		} else {
			onresolve(null, { path, licenseeName: '', clientName: '', totalHeadcount: null, usageBand: null });
		}
	});
</script>

<div class="LicenseIntake">
	<div class="LicenseIntake__paths">
		<button
			type="button"
			class="LicenseIntake__path"
			class:is-active={path === 'individual'}
			onclick={() => selectPath('individual')}
			aria-pressed={path === 'individual'}
		>
			<span class="LicenseIntake__radio" aria-hidden="true">
				{#if path === 'individual'}<span class="LicenseIntake__dot"></span>{/if}
			</span>
			<span class="LicenseIntake__path-body">
				<span class="LicenseIntake__path-name">Individual</span>
				<span class="LicenseIntake__path-blurb">{SCOPE_BLURB[getTierScope(1)]}</span>
			</span>
		</button>

		<button
			type="button"
			class="LicenseIntake__path"
			class:is-active={path === 'organisation'}
			onclick={() => selectPath('organisation')}
			aria-pressed={path === 'organisation'}
		>
			<span class="LicenseIntake__radio" aria-hidden="true">
				{#if path === 'organisation'}<span class="LicenseIntake__dot"></span>{/if}
			</span>
			<span class="LicenseIntake__path-body">
				<span class="LicenseIntake__path-name">Organisation</span>
				<span class="LicenseIntake__path-blurb">{SCOPE_BLURB.full} Priced by how many people will use it.</span>
			</span>
		</button>

		<button
			type="button"
			class="LicenseIntake__path"
			class:is-active={path === 'project'}
			onclick={() => selectPath('project')}
			aria-pressed={path === 'project'}
		>
			<span class="LicenseIntake__radio" aria-hidden="true">
				{#if path === 'project'}<span class="LicenseIntake__dot"></span>{/if}
			</span>
			<span class="LicenseIntake__path-body">
				<span class="LicenseIntake__path-name">Project License</span>
				<span class="LicenseIntake__path-blurb">{PROJECT_LICENSE_BLURB}</span>
			</span>
		</button>
	</div>

	{#if path === 'organisation'}
		<div class="LicenseIntake__fields">
			<label class="LicenseIntake__field">
				<span class="LicenseIntake__label">Organisation name</span>
				<input class="LicenseIntake__input" type="text" bind:value={companyName} placeholder="Acme Inc." />
			</label>
			<div class="LicenseIntake__row">
				<label class="LicenseIntake__field">
					<span class="LicenseIntake__label">Total company size</span>
					<input
						class="LicenseIntake__input"
						type="number"
						min="1"
						step="1"
						bind:value={totalHeadcountStr}
						placeholder="e.g. 40"
					/>
					<span class="LicenseIntake__hint">Everyone at your company, for context.</span>
				</label>
				<label class="LicenseIntake__field">
					<span class="LicenseIntake__label">People using the fonts</span>
					<select class="LicenseIntake__input LicenseIntake__select" bind:value={orgTierIndexStr}>
						<option value="" disabled>Select a range</option>
						{#each ORG_TIERS as t (t.index)}
							<option value={String(t.index)}>{t.label} people</option>
						{/each}
					</select>
					<span class="LicenseIntake__hint">This sets your licence tier.</span>
				</label>
			</div>
			{#if resolvedTier && !isEnterpriseScale}
				<p class="LicenseIntake__resolved" role="status">
					→ {resolvedTier.name} license ({resolvedTier.label})
					{#if pkg}· {formatPrice(getPrice(pkg, resolvedTier.index))}{/if}
				</p>
			{:else if isEnterpriseScale}
				<p class="LicenseIntake__resolved LicenseIntake__resolved--enterprise" role="status">
					This scale requires a custom quote — <a href="/contact">contact us</a>.
				</p>
			{/if}
		</div>
	{:else if path === 'project'}
		<div class="LicenseIntake__fields">
			<label class="LicenseIntake__field">
				<span class="LicenseIntake__label">Your studio / agency name</span>
				<input class="LicenseIntake__input" type="text" bind:value={purchaserName} placeholder="Studio name" />
			</label>
			<label class="LicenseIntake__field">
				<span class="LicenseIntake__label">Client / brand name</span>
				<input class="LicenseIntake__input" type="text" bind:value={clientName} placeholder="Client name" />
				<span class="LicenseIntake__hint">
					The one brand this licence covers — your client can rely on it directly, even after your
					engagement ends.
				</span>
			</label>
			{#if projectReady}
				<p class="LicenseIntake__resolved" role="status">
					→ {PROJECT_LICENSE_LABEL} · {formatPrice(PROJECT_LICENSE_EUR)}
				</p>
			{/if}
		</div>
	{:else if path === 'individual'}
		<div class="LicenseIntake__fields">
			{#if pkg}
				<p class="LicenseIntake__resolved" role="status">→ Individual license · {formatPrice(getPrice(pkg, 1))}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.LicenseIntake {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.LicenseIntake__paths {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.LicenseIntake__path {
		display: flex;
		align-items: flex-start;
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

	.LicenseIntake__path.is-active {
		background: var(--color-text);
		color: var(--color-bg);
	}

	.LicenseIntake__path :global(*) {
		color: inherit;
	}

	.LicenseIntake__radio {
		width: 11px;
		height: 11px;
		margin-top: 3px;
		border: 1px solid currentColor;
		border-radius: 50%;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.LicenseIntake__dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: currentColor;
	}

	.LicenseIntake__path-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.LicenseIntake__path-name {
		font-family: 'Steiner', sans-serif;
		font-size: 15px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
	}

	.LicenseIntake__path-blurb {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.5;
		opacity: 0.7;
	}

	/* ── Conditional fields ── */
	.LicenseIntake__fields {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 18px;
		background: var(--color-bg-gray);
		margin-top: -2px;
	}

	.LicenseIntake__row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
	}

	.LicenseIntake__field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.LicenseIntake__label {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		color: var(--color-text-mute);
	}

	.LicenseIntake__input {
		padding: 10px 12px;
		background: var(--color-bg);
		border: 1px solid var(--color-line);
		border-radius: 0;
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		color: var(--color-text);
		transition: border-color 120ms;
	}

	.LicenseIntake__input:focus {
		outline: none;
		border-color: var(--color-text);
	}

	/* Range select — same shell as the text inputs, plus a custom chevron
	   since it replaces a free-typed number (see LicenseIntake__row). */
	.LicenseIntake__select {
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23000' fill='none' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 30px;
	}

	.LicenseIntake__hint {
		font-family: 'Steiner', sans-serif;
		font-size: 10px;
		line-height: 1.4;
		color: var(--color-text-mute);
		opacity: 0.8;
	}

	.LicenseIntake__resolved {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		margin: 4px 0 0;
	}

	.LicenseIntake__resolved--enterprise {
		font-weight: var(--fw-light);
		font-size: 11px;
	}

	.LicenseIntake__resolved--enterprise a {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	@media (max-width: 480px) {
		.LicenseIntake__row {
			grid-template-columns: 1fr;
		}
	}
</style>
