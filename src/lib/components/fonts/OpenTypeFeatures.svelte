<script lang="ts">
	// OpenType features specimen — each row shows a sample with the feature OFF,
	// then ON, via `font-feature-settings`. Live (renders in the webfont), so the
	// difference appears as soon as the font ships the feature.
	interface Feature {
		tag: string; // OpenType tag, e.g. 'liga'
		name: string;
		sample: string;
	}

	interface Props {
		fontFamily: string;
		title?: string;
	}

	let { fontFamily, title = 'OpenType Features' }: Props = $props();

	const features: Feature[] = [
		{ tag: 'liga', name: 'Standard Ligatures', sample: 'office final fluffy' },
		{ tag: 'dlig', name: 'Discretionary Ligatures', sample: 'ct st Th' },
		{ tag: 'tnum', name: 'Tabular Figures', sample: '10,938 24,517' },
		{ tag: 'onum', name: 'Oldstyle Figures', sample: '0123456789' },
		{ tag: 'frac', name: 'Fractions', sample: '1/2 3/4 7/8' },
		{ tag: 'zero', name: 'Slashed Zero', sample: '0 1024 305' },
		{ tag: 'smcp', name: 'Small Caps', sample: 'Small Caps' },
		{ tag: 'case', name: 'Case-Sensitive Forms', sample: '(Hello) —[A]' },
		{ tag: 'ss01', name: 'Stylistic Set 01', sample: 'agky' }
	];
</script>

<section class="OpenType" aria-label={title}>
	<p class="OpenType__label">{title}</p>

	<ul class="OpenType__list">
		{#each features as f (f.tag)}
			<li class="OpenType__feature">
				<div class="OpenType__meta">
					<span class="OpenType__name">{f.name}</span>
					<span class="OpenType__tag">{f.tag}</span>
				</div>
				<div class="OpenType__samples" style="font-family: '{fontFamily}', sans-serif;">
					<span class="OpenType__sample" style="font-feature-settings: '{f.tag}' 0;">
						{f.sample}
					</span>
					<span class="OpenType__arrow" aria-hidden="true">→</span>
					<span class="OpenType__sample OpenType__sample--on" style="font-feature-settings: '{f.tag}' 1;">
						{f.sample}
					</span>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	.OpenType {
		padding: 48px var(--padding) 56px;
		border-top: 1px solid var(--color-line);
	}

	.OpenType__label {
		font-family: 'Steiner', sans-serif;
		font-size: var(--fs-h5);
		color: var(--color-text-mute);
		letter-spacing: 0;
		margin: 0 0 20px;
	}

	.OpenType__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.OpenType__feature {
		display: grid;
		grid-template-columns: 1fr;
		gap: 8px;
		padding: 16px 0;
		border-top: 1px solid var(--color-line);
	}

	.OpenType__feature:first-child {
		border-top: 0;
	}

	.OpenType__meta {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}

	.OpenType__name {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 450;
		letter-spacing: 0;
	}

	.OpenType__tag {
		font-family: ui-monospace, monospace;
		font-size: 10px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-mute);
	}

	.OpenType__samples {
		display: flex;
		align-items: baseline;
		gap: 16px;
		font-size: clamp(22px, 4vw, 32px);
		line-height: 1.2;
	}

	.OpenType__sample {
		font-variation-settings: 'wght' 400;
	}

	.OpenType__sample--on {
		/* keep weight in sync; feature applied via inline font-feature-settings */
		font-variation-settings: 'wght' 400;
	}

	.OpenType__arrow {
		font-size: 14px;
		color: var(--color-text-mute);
		align-self: center;
	}

	@media (min-width: 768px) {
		.OpenType__feature {
			grid-template-columns: 220px 1fr;
			gap: 24px;
			align-items: baseline;
		}
	}
</style>
