<script lang="ts">
	// License intake — the qualifying step that comes BEFORE typeface
	// selection. A single form: organisation name + a tier-aligned "People"
	// select. No separate path to choose first, no free-typed headcount —
	// picking a range IS the answer, and it resolves the tier whose per-style
	// rate everything downstream prices against (see $lib/data/pricing's
	// TIER_DEFS). The actual total isn't known yet here — that also depends
	// on how many styles get picked in Step 3 — so this step only ever shows
	// the flat per-style rate, never a bundle total.
	//
	// People offers every tier (Individual through Global), defaulting to
	// Studio (up to 10). Individual sits at the top of the list — it's the
	// one entry scoped to desktop-only use rather than full commercial use
	// (see getTierScope), but is presented here as just the smallest range.
	import {
		TIER_DEFS,
		getTierDef,
		getTierScope,
		getPerStylePrice,
		isEnterpriseTier,
		formatPrice,
		SCOPE_BLURB
	} from '$lib/data/pricing';
	import type { PackageDef } from '$lib/data/pricing';

	export interface IntakeMeta {
		// Becomes the Sales Receipt's "Licensee".
		licenseeName: string;
		// The declared tier's headcount range (e.g. "up to 10"), for context
		// alongside the licensee name.
		usageBand: string | null;
	}

	interface Props {
		packages: PackageDef[];
		/** Resolved tier index (or null while unresolved) + receipt metadata. */
		onresolve: (tierIndex: number | null, meta: IntakeMeta) => void;
	}

	let { packages, onresolve }: Props = $props();

	const PEOPLE_OPTIONS = TIER_DEFS; // Individual through Global

	// Studio (up to 10) — the default landing choice, matching the tier this
	// step used to be locked to before the full range came back.
	const DEFAULT_TIER_INDEX = 3;

	let companyName = $state('');
	let peopleTierIndexStr = $state(String(DEFAULT_TIER_INDEX));

	const resolvedTier = $derived(peopleTierIndexStr ? (getTierDef(Number(peopleTierIndexStr)) ?? null) : null);
	const pkg = $derived(packages[0] ?? null);
	const isEnterpriseScale = $derived(resolvedTier ? isEnterpriseTier(resolvedTier.index) : false);
	const ready = $derived(companyName.trim().length > 0 && resolvedTier !== null && !isEnterpriseScale);

	// Emit the resolved tier (or null while unresolved) whenever the
	// relevant inputs change — the parent prices the actual cart item from
	// this tier × however many styles Step 3 has selected.
	$effect(() => {
		if (ready && resolvedTier && pkg) {
			onresolve(resolvedTier.index, { licenseeName: companyName.trim(), usageBand: resolvedTier.label });
		} else {
			onresolve(null, { licenseeName: '', usageBand: null });
		}
	});
</script>

<div class="LicenseIntake">
	<div class="LicenseIntake__fields">
		<label class="LicenseIntake__field">
			<span class="LicenseIntake__label">Company / Your name</span>
			<input class="LicenseIntake__input" type="text" bind:value={companyName} placeholder="August Inc." />
		</label>
		<label class="LicenseIntake__field">
			<span class="LicenseIntake__label">People / Employee</span>
			<select class="LicenseIntake__input LicenseIntake__select" bind:value={peopleTierIndexStr}>
				{#each PEOPLE_OPTIONS as t (t.index)}
					<option value={String(t.index)}>{t.index === 1 ? t.label : `${t.label} people`}</option>
				{/each}
			</select>
		</label>
	</div>

	{#if isEnterpriseScale}
		<p class="LicenseIntake__resolved LicenseIntake__resolved--enterprise" role="status">
			This scale requires a custom quote — <a href="/contact">contact us</a>.
		</p>
	{:else if resolvedTier && pkg}
		<p class="LicenseIntake__resolved" role="status">
			→ {resolvedTier.name} license ({resolvedTier.label}) · {formatPrice(getPerStylePrice(resolvedTier.index))}/style
		</p>
		<p class="LicenseIntake__scope">{SCOPE_BLURB[getTierScope(resolvedTier.index)]}</p>
	{/if}

	<p class="LicenseIntake__alt">
		Buying for a client, or need a different scale? <a href="/contact">Contact us</a>.
	</p>
</div>

<style>
	.LicenseIntake {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.LicenseIntake__fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 14px;
		padding: 18px;
		background: var(--color-bg-gray);
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

	/* Range select — same shell as the text input, plus a custom chevron. */
	.LicenseIntake__select {
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23000' fill='none' stroke-width='1'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 30px;
	}

	.LicenseIntake__resolved {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		margin: 4px 0 0;
	}

	/* Same size + opacity as .LicenseIntake__resolved above it (full colour,
	   not muted) — only the weight differs. */
	.LicenseIntake__scope {
		font-family: 'Steiner', sans-serif;
		font-size: 13px;
		font-weight: var(--fw-strong);
		letter-spacing: 0;
		margin: 2px 0 0;
	}

	.LicenseIntake__resolved--enterprise {
		font-weight: var(--fw-light);
		font-size: 11px;
	}

	.LicenseIntake__resolved--enterprise a {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.LicenseIntake__alt {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		line-height: 1.5;
		color: var(--color-text-mute);
		margin: 8px 0 0;
	}

	.LicenseIntake__alt a {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	@media (max-width: 480px) {
		.LicenseIntake__fields {
			grid-template-columns: 1fr;
		}
	}
</style>
