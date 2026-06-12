<script lang="ts">
	// OpenType features specimen — each row shows a sample with the feature OFF,
	// then ON, via `font-feature-settings`. Live (renders in the webfont), so the
	// difference appears as soon as the font ships the feature. Until then OFF/ON
	// render the same — which is fine: the roadmap is on display.
	interface Feature {
		tag: string; // OpenType tag, e.g. 'liga'
		name: string;
		description: string;
		sample: string;
	}

	interface Props {
		fontFamily: string;
		title?: string;
		/** Per-font feature list. Defaults to Steiner's current + in-progress set. */
		features?: Feature[];
	}

	// Steiner — shipping roster (Steiner 07).
	// Live OFF → ON demos render against the actual webfont, so what's here
	// reflects what's actually compiled into the OTF/woff2 right now.
	// Coming next: onum / tnum / frac / sups / subs / numr / dnom / case,
	// plus ss01 (a), ss02 (g), ss09 (&) once those alternates are drawn.
	const STEINER_FEATURES: Feature[] = [
		{
			tag: 'liga',
			name: 'Standard Ligatures',
			description: 'fi, fl, ff, ffi and ffl join into single connected glyphs for cleaner rhythm.',
			sample: 'office final fluffy'
		},
		{
			tag: 'smcp',
			name: 'Small Capitals',
			description:
				'Lowercase forms re-drawn at small-cap height — retains visual weight when set in body copy.',
			sample: 'Small Caps'
		},
		{
			tag: 'c2sc',
			name: 'Caps to Small Caps',
			description: 'Converts uppercase to small caps for harmonious all-cap settings.',
			sample: 'TYPE FOUNDRY'
		},
		{
			tag: 'ordn',
			name: 'Ordinals',
			description: 'Raised ordinal markers — ª º — for ordered numbering and abbreviations.',
			sample: 'No 1a 2o'
		},
		{
			tag: 'zero',
			name: 'Slashed Zero',
			description: 'A slashed zero to disambiguate from capital O in technical contexts.',
			sample: '0 1024 305'
		},
		{
			tag: 'ss03',
			name: 'Stylistic Set 03 — Alternate b d p q',
			description: 'Alternate construction for b, d, p and q.',
			sample: 'absurd proposal'
		},
		{
			tag: 'ss07',
			name: 'Stylistic Set 07 — Alternate R',
			description: 'Alternate leg shape for capital R.',
			sample: 'Romance'
		},
		{
			tag: 'ss08',
			name: 'Stylistic Set 08 — Alternate Q',
			description: 'Alternate tail construction for Q.',
			sample: 'Quiet'
		}
	];

	let { fontFamily, title = 'OpenType Features', features = STEINER_FEATURES }: Props = $props();
</script>

<section class="OpenType" aria-label={title}>
	<div class="OpenType__head">
		<p class="OpenType__label">{title}</p>
		<p class="OpenType__hint">
			Toggle previews — each row shows the feature off, then on. Live in the webfont.
		</p>
	</div>

	<ul class="OpenType__list">
		{#each features as f (f.tag)}
			<li class="OpenType__feature">
				<div class="OpenType__meta">
					<div class="OpenType__heading">
						<span class="OpenType__name">{f.name}</span>
						<span class="OpenType__tag">{f.tag}</span>
					</div>
					<p class="OpenType__description">{f.description}</p>
				</div>
				<div class="OpenType__samples" style="font-family: '{fontFamily}', sans-serif;">
					<!-- Preserve site-wide `palt` while toggling the demo feature; the
					     parent base.css applies `font-feature-settings: "palt"` globally,
					     and the CSS rule REPLACES (not merges), so we explicitly combine. -->
					<span class="OpenType__sample" style="font-feature-settings: 'palt', '{f.tag}' 0;">
						{f.sample}
					</span>
					<span class="OpenType__arrow" aria-hidden="true">→</span>
					<span
						class="OpenType__sample OpenType__sample--on"
						style="font-feature-settings: 'palt', '{f.tag}' 1;"
					>
						{f.sample}
					</span>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	/* Black-canvas section: the OT roster reads as a focused, neutral specimen. */
	.OpenType {
		background: #000;
		color: #fff;
		padding: 80px var(--padding) 100px;
	}

	.OpenType__head {
		margin-bottom: 32px;
	}

	.OpenType__label {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h5);
		color: rgba(255, 255, 255, 0.7);
		letter-spacing: 0;
		margin: 0;
	}

	.OpenType__hint {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h6);
		color: rgba(255, 255, 255, 0.5);
		margin: 6px 0 0;
		letter-spacing: 0;
	}

	.OpenType__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.OpenType__feature {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
		padding: 20px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
	}

	.OpenType__meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.OpenType__heading {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}

	.OpenType__name {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-weight: var(--fw-ui);
		letter-spacing: 0;
		color: #fff;
	}

	.OpenType__tag {
		font-family: ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.45);
	}

	.OpenType__description {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-p);
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.55);
		letter-spacing: 0;
		margin: 0;
		max-width: 36ch;
	}

	.OpenType__samples {
		display: flex;
		align-items: baseline;
		gap: 16px;
		font-size: clamp(22px, 4vw, 32px);
		line-height: 1.2;
	}

	.OpenType__sample {
		color: rgba(255, 255, 255, 0.4);
	}

	.OpenType__sample--on {
		/* keep weight in sync; feature applied via inline font-feature-settings */
		color: #fff;
	}

	.OpenType__arrow {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.35);
		align-self: center;
	}

	@media (min-width: 768px) {
		.OpenType__feature {
			grid-template-columns: 260px 1fr;
			gap: 32px;
			align-items: start;
			padding: 28px 0;
		}
	}
</style>
