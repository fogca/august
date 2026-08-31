<!--
  End User Licence Agreement — one Article-numbered mini-agreement per
  licence sold on /buy (Individual / Organisation / Project License),
  matching the tiers in $lib/data/pricing.ts. Layout: a sticky sidebar
  (scrollspy-highlighted) beside the stacked sections — content lives in
  $lib/data/eula.ts.
-->
<script lang="ts">
	import { onMount } from 'svelte';
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
	<title>Licence (EULA) — August Type Foundry</title>
	<meta
		name="description"
		content="End User Licence Agreement for August Type Foundry fonts — Individual, Organisation, and Project licenses."
	/>
</svelte:head>

<main class="Eula">
	<div class="Eula__layout">
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

		<div class="Eula__content">
			<p class="Eula__lead">
				August Type Foundry fonts are licensed, not sold. Each licence below — Individual,
				Organisation, and Project License — is its own standalone agreement; your Sales Receipt
				records which one you have bought and at what tier.
			</p>

			{#each EULA_SECTIONS as section, i (section.id)}
				<section class="Eula__section" id={section.id}>
					<h1>{section.heading}</h1>
					<p class="Eula__intro">{section.intro}</p>

					{#each section.articles as article (article.number)}
						<div class="Eula__article">
							<h2>Article {article.number}: {article.title}</h2>
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

			<p class="Eula__note">Version 2.0 — August 2026.</p>
		</div>
	</div>
</main>

<style>
	.Eula {
		min-height: 100vh;
		min-height: 100dvh;
		padding-block: 96px;
	}

	@media (min-width: 768px) {
		.Eula {
			padding-top: 120px;
		}
	}

	.Eula__layout {
		padding-inline: var(--padding);
	}

	/* PC: unlike the other legal pages, the sidebar stays near the left edge
	   (normal page padding) — matching the reference screenshot — and it's
	   the wide gap before the content column that does the "leaning right"
	   work, not a margin pushing the whole layout over. */
	@media (min-width: 768px) {
		.Eula__layout {
			display: flex;
			align-items: flex-start;
			gap: 25vw;
		}
	}

	/* Mobile: a horizontal, wrapping pill row — no sticky (little vertical
	   room to spare on a phone), just a quick way to skip to a section. */
	.Eula__nav {
		margin-bottom: 32px;
	}

	.Eula__nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.Eula__nav-link {
		font-family: 'Norma', sans-serif;
		font-size: 12px;
		letter-spacing: 0;
		color: var(--color-text-mute);
		background: transparent;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		padding: 6px 14px;
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s, background-color 0.15s;
	}

	.Eula__nav-link.is-active {
		color: var(--color-bg);
		background: var(--color-text);
		border-color: var(--color-text);
	}

	@media (min-width: 768px) {
		.Eula__nav {
			flex: none;
			width: 140px;
			margin-bottom: 0;
			position: sticky;
			top: 140px;
			align-self: flex-start;
		}

		.Eula__nav ul {
			flex-direction: column;
			gap: 14px;
		}

		.Eula__nav-link {
			font-size: 13px;
			text-align: left;
			border: none;
			border-radius: 0;
			padding: 0;
			background: transparent;
		}

		.Eula__nav-link.is-active {
			color: var(--color-text);
			background: transparent;
			font-weight: var(--fw-strong);
		}
	}

	.Eula__content {
		min-width: 0;
	}

	.Eula__lead {
		margin-bottom: 48px;
		max-width: 60ch;
		color: var(--color-text-mute);
	}

	.Eula__section {
		padding-inline: 0;
	}

	.Eula__section h1 {
		font-size: clamp(28px, 4vw, 40px);
		margin: 0 0 20px;
	}

	.Eula__intro {
		margin-bottom: 32px;
		max-width: 100%;
	}

	.Eula__article {
		margin-bottom: 28px;
	}

	.Eula__article h2 {
		font-size: var(--fs-h3);
		margin: 0 0 10px;
	}

	.Eula__clauses {
		margin: 0;
		padding-left: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.Eula__clauses li {
		line-height: 1.6;
	}

	/* Font size per spec: 14px mobile (base), 16px desktop. */
	.Eula p,
	.Eula ol {
		font-size: 14px;
		font-weight: var(--fw-light);
	}

	@media (min-width: 768px) {
		.Eula p,
		.Eula ol {
			font-size: 16px;
		}
	}

	.Eula__divider {
		border-top: 1px solid var(--color-line);
		margin: 56px 0;
	}

	.Eula__note {
		margin-top: 40px;
		font-size: 11px;
		opacity: 0.5;
	}

	.Eula a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
