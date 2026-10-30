<!-- Information, after Kontrapunkt Type's: three columns at 1 : 1 : 2 — the
     particulars (label over value), the OpenType features, the languages. Only
     what the font and the foundry's data hold: the features are the font's own
     feature tags (see $lib/data/humoristOverview.ts), the languages are the
     Hyperglot list, and a particular with nothing behind it is not shown. -->
<script lang="ts">
	import SectionHeading from './SectionHeading.svelte';

	interface Props {
		/** [label, value] pairs, in order. */
		details: [string, string][];
		features: string[];
		languages: string[];
	}

	let { details, features, languages }: Props = $props();
</script>

<section class="FontInformation" aria-label="Information">
	<SectionHeading title="Information" />

	<div class="FontInformation__cols">
		<dl class="FontInformation__details">
			{#each details as [label, value] (label)}
				<dt>{label}</dt>
				<dd>{value}</dd>
			{/each}
		</dl>

		<div class="FontInformation__col">
			<p class="FontInformation__label">OpenType features</p>
			<ul class="FontInformation__list">
				{#each features as f (f)}
					<li>{f}</li>
				{/each}
			</ul>
		</div>

		<div class="FontInformation__col">
			<p class="FontInformation__label">Languages</p>
			<p class="FontInformation__langs">{languages.join(', ')}</p>
		</div>
	</div>
</section>

<style>
	.FontInformation {
		padding: 0 var(--padding) 80px;
		margin-top: 96px;
	}

	.FontInformation__cols {
		display: grid;
		gap: 32px;
		padding-top: 24px;
	}

	@media (min-width: 768px) {
		.FontInformation__cols {
			grid-template-columns: 1fr 1fr 2fr;
			gap: 24px;
		}
	}

	/* base.css re-asserts its own colour per element — set it on each. */
	.FontInformation__details {
		margin: 0;
		display: grid;
		align-content: start;
		gap: 0;
	}

	.FontInformation__details dt,
	.FontInformation__label {
		margin: 0;
		font-size: 15px;
		line-height: 1.4;
		letter-spacing: 0;
		font-weight: 450;
		color: var(--color-text);
	}

	.FontInformation__details dd {
		margin: 0 0 10px;
		font-size: 15px;
		line-height: 1.4;
		letter-spacing: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
	}

	.FontInformation__label {
		margin-bottom: 0;
	}

	.FontInformation__list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.FontInformation__list li,
	.FontInformation__langs {
		font-size: 15px;
		line-height: 1.4;
		letter-spacing: 0;
		font-weight: var(--fw-light);
		color: var(--color-text);
	}

	.FontInformation__langs {
		margin: 0;
	}
</style>
