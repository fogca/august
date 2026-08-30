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

	// Gates the reveal behind an explicit action instead of firing on the
	// first keystroke: without this, the price/Select-styles section would
	// pop in (and shove everything below it down) the moment a single
	// character landed in Company / Your name, before there was anything
	// resembling a real answer to react to. Once confirmed, later edits to
	// either field update the resolved tier live as before — this only
	// guards the initial reveal, not ongoing reactivity.
	let confirmed = $state(false);

	const resolvedTier = $derived(peopleTierIndexStr ? (getTierDef(Number(peopleTierIndexStr)) ?? null) : null);
	const pkg = $derived(packages[0] ?? null);
	const isEnterpriseScale = $derived(resolvedTier ? isEnterpriseTier(resolvedTier.index) : false);
	const ready = $derived(companyName.trim().length > 0 && resolvedTier !== null && !isEnterpriseScale);

	// Emit the resolved tier (or null while unresolved) whenever the
	// relevant inputs change — the parent prices the actual cart item from
	// this tier × however many styles Step 3 has selected.
	$effect(() => {
		if (confirmed && ready && resolvedTier && pkg) {
			onresolve(resolvedTier.index, { licenseeName: companyName.trim(), usageBand: resolvedTier.label });
		} else {
			onresolve(null, { licenseeName: '', usageBand: null });
		}
	});
</script>

<div class="LicenseIntake">
	<div class="LicenseIntake__fields">
		<label class="LicenseIntake__field">
			<span class="LicenseIntake__label"
				>Company / Your name<span class="LicenseIntake__required" aria-hidden="true">*</span></span
			>
			<input
				class="LicenseIntake__input"
				type="text"
				bind:value={companyName}
				placeholder="August Inc."
				required
				aria-required="true"
			/>
		</label>
		<label class="LicenseIntake__field">
			<span class="LicenseIntake__label"
				>People / Employee<span class="LicenseIntake__required" aria-hidden="true">*</span></span
			>
			<select
				class="LicenseIntake__input LicenseIntake__select"
				bind:value={peopleTierIndexStr}
				required
				aria-required="true"
			>
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
	{:else if confirmed && ready && resolvedTier}
		<!-- confirmed && ready, not just "resolvedTier && pkg": People/Employee
		     always has a default value, so resolvedTier is non-null from first
		     paint — gating on ready waits for Company / Your name to actually
		     be filled in, and gating on confirmed additionally waits for the
		     Continue click below rather than revealing on the first keystroke.
		     Matches what actually unlocks Select styles on the parent page
		     (it reads the same confirmed-and-ready-driven resolve). -->
		<p class="LicenseIntake__resolved" role="status">
			→ {resolvedTier.name} license ({resolvedTier.label}) · {formatPrice(getPerStylePrice(resolvedTier.index))}/style
		</p>
		<p class="LicenseIntake__scope">{SCOPE_BLURB[getTierScope(resolvedTier.index)]}</p>
	{:else if !confirmed}
		<button
			type="button"
			class="LicenseIntake__continue"
			disabled={!ready}
			onclick={() => (confirmed = true)}
		>
			Continue
		</button>
	{:else}
		<p class="LicenseIntake__hint" role="status">
			* Required — fill in your company name to see your license and styles.
		</p>
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

	.LicenseIntake__required {
		color: var(--color-signal, #e0231c);
		margin-left: 2px;
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

	/* Neutral prompt while the form is still incomplete — not styled as an
	   error (no red, no border): a pristine, untouched form isn't "invalid"
	   yet, just unfinished. The red asterisks above already carry the
	   required-ness signal; this just explains what unlocks next. */
	.LicenseIntake__hint {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		color: var(--color-text-mute);
		margin: 4px 0 0;
	}

	/* The explicit gate before the price/Select-styles reveal — same solid
	   button language as the final Checkout action, just smaller/contained
	   rather than full-width, since this is a mid-flow step not the last one. */
	.LicenseIntake__continue {
		align-self: flex-start;
		margin: 4px 0 0;
		padding: 10px 24px;
		background: var(--color-text);
		color: var(--color-bg);
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		border: 0;
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	.LicenseIntake__continue:hover:not(:disabled) {
		opacity: 0.86;
	}

	.LicenseIntake__continue:disabled {
		opacity: 0.35;
		cursor: default;
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

	/* iOS Safari auto-zooms the viewport on focus for any input/select whose
	   computed font-size is under 16px, and doesn't zoom back out on blur —
	   the field stays enlarged for the rest of the visit. 16px here is the
	   fix, not a stopgap; scoped to mobile so the desktop form keeps its
	   13px. */
	@media (max-width: 767px) {
		.LicenseIntake__input {
			font-size: 16px;
		}
	}

	@media (max-width: 480px) {
		.LicenseIntake__fields {
			grid-template-columns: 1fr;
		}
	}
</style>
