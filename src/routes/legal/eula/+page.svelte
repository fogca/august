<!--
  End User Licence Agreement — one Article-numbered mini-agreement per
  licence sold on /buy (Individual / Organisation / Project License),
  matching the tiers in $lib/data/pricing.ts. Content lives in
  $lib/data/eula.ts. Layout: Figma node 3:671 long-form (PageSection
  `flow`) — the title, version line and the scrollspy section nav stay put
  in the left column; the agreements run on down the right.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import PageSection from '$lib/components/PageSection.svelte';
	import { EULA_SECTIONS } from '$lib/data/eula.js';

	let activeId = $state(EULA_SECTIONS[0].id);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				}
			},
			// Counts a section "active" once its heading has cleared the fixed
			// header, and before the next section's heading arrives.
			{ rootMargin: '-140px 0px -75% 0px', threshold: 0 }
		);

		const els = EULA_SECTIONS.map((s) => document.getElementById(s.id)).filter(
			(el): el is HTMLElement => !!el
		);
		els.forEach((el) => observer.observe(el));

		return () => observer.disconnect();
	});

	function jumpTo(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<svelte:head>
	<title>Licence (EULA) — Ōgast</title>
	<meta
		name="description"
		content="End User Licence Agreement for Ōgast fonts — Individual, Organisation, and Project licenses."
	/>
</svelte:head>

<main class="Eula">
	<PageSection
		title="EULA"
		as="h1"
		subtitle="End User Licence Agreement — Version 2.0, August 2026"
		flow
	>
		{#snippet head()}
			<nav class="Eula__nav" aria-label="Licence sections">
				<ul>
					{#each EULA_SECTIONS as section (section.id)}
						<li>
							<button
								type="button"
								class="Eula__nav-link"
								class:is-active={activeId === section.id}
								onclick={() => jumpTo(section.id)}
								aria-current={activeId === section.id ? 'true' : undefined}
							>
								{section.navLabel}
							</button>
						</li>
					{/each}
				</ul>
			</nav>
		{/snippet}

		<div class="Eula__lead">
			<p>
				Ōgast fonts are licensed, not sold. Each licence below — Individual, Organisation, and
				Project License — is its own standalone agreement; your Sales Receipt records which one you
				have bought and at what tier.
			</p>
		</div>

		{#each EULA_SECTIONS as section, i (section.id)}
			<section class="Eula__section" id={section.id}>
				<h2 class="Eula__heading">{section.heading}</h2>
				<p class="Eula__intro">{section.intro}</p>

				{#each section.articles as article (article.number)}
					<div class="Eula__article">
						<h3>Article {article.number}: {article.title}</h3>
						<ol class="Eula__clauses">
							{#each article.clauses as clause}
								<li>{clause}</li>
							{/each}
						</ol>
					</div>
				{/each}
			</section>
			{#if i < EULA_SECTIONS.length - 1}
				<div class="Eula__divider" aria-hidden="true"></div>
			{/if}
		{/each}
	</PageSection>
</main>

<style>
	.Eula {
		background: #f1f0ef;
	}

	/* Section nav — a wrapping pill row on phones, a plain stacked list in
	   the sticky left column on PC. Type (Elio, black) comes from
	   PageSection's head rules; only the geometry is set here. */
	.Eula__nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.Eula__nav-link {
		font: inherit;
		font-size: 12px;
		letter-spacing: 0;
		opacity: 0.55;
		background: transparent;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		padding: 6px 14px;
		cursor: pointer;
		transition:
			opacity 0.15s,
			border-color 0.15s;
	}

	.Eula__nav-link.is-active {
		opacity: 1;
		border-color: var(--color-text);
	}

	@media (min-width: 768px) {
		.Eula__nav ul {
			flex-direction: column;
			gap: 12px;
		}

		.Eula__nav-link {
			font-size: 14px;
			text-align: left;
			border: none;
			border-radius: 0;
			padding: 0;
		}

		.Eula__nav-link.is-active {
			font-weight: 500;
			font-variation-settings: 'wght' 500;
		}
	}

	/* Spacing lives on wrappers, not the <p>s — PageSection's own paragraph
	   rule (0 0 1em) outranks a scoped class here. */
	.Eula__lead {
		margin-bottom: 48px;
		opacity: 0.7;
	}

	.Eula__section {
		padding-inline: 0;
	}

	.Eula__heading {
		font-size: clamp(28px, 2.8vw, 40px);
		line-height: 1.2;
		font-weight: 350;
		font-variation-settings: 'wght' 350;
		letter-spacing: 0;
		margin: 0 0 20px;
	}

	.Eula__intro + .Eula__article {
		margin-top: 32px;
	}

	.Eula__article {
		margin-bottom: 28px;
	}

	.Eula__clauses {
		margin: 0;
		padding-left: 1.6em;
		font-size: 14px;
		line-height: 1.6;
		font-weight: 350;
		font-variation-settings: 'wght' 350;
	}

	@media (min-width: 768px) {
		.Eula__clauses {
			font-size: 16px;
			line-height: 1.5;
		}
	}

	.Eula__clauses li {
		margin-bottom: 0.4em;
	}

	.Eula__divider {
		border-top: 1px solid var(--color-line);
		margin: 56px 0;
	}
</style>
