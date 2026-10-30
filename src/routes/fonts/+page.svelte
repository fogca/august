<!-- Catalogue. Layout: Figma node 3:671 long-form (PageSection `full`) —
     "Fonts" as the page title with its one-line sub-heading, the list
     underneath. The list was redone 2026-10-30, at the user's request, after
     Kontrapunkt Type's shop (type.kontrapunkt.com/en/shop): one row to a
     typeface, the name set huge in its own face (the "APGR" prefix dropped
     there), the full name and "1 family, N styles" bottom-left, a pill
     bottom-right, a rule between rows. It was a two-column card grid.
     nativeBody: each name is set in that typeface's own face (inline
     font-family below), which PageSection's brand-font rule would otherwise
     flatten to Ango. The chrome (names, counts, pills) is in Ango (--font-en). -->
<script lang="ts">
	import PageSection from '$lib/components/PageSection.svelte';
	import { TYPEFACES, displayName } from '$lib/data/typefaces.js';
	import type { Typeface } from '$lib/data/typefaces.js';

	// Sort by order (ascending) to guarantee display sequence
	const typefaces = TYPEFACES.filter((f) => !f.hidden).sort((a, b) => a.order - b.order);
	// "APGR Humorist and upcoming releases" — the first of the visible ones
	// (Norma is hidden; it leads again when it is shown).
	const lead = typefaces[0]?.name ?? 'Typefaces';

	// "1 family, 9 styles" — upright styles, as on the typeface page. A name
	// with no drawings yet has no count to give, so it says what it is.
	function caption(tf: Typeface): string {
		return tf.placeholder ? 'In development' : `1 family, ${tf.weights.length} styles`;
	}
</script>

<svelte:head>
	<title>Fonts — Apres Guerre</title>
	<meta
		name="description"
		content="Apres Guerre typeface catalogue — {lead} and upcoming releases."
	/>
</svelte:head>

<main class="Fonts">
	<PageSection title="Fonts" as="h1" subtitle="{lead} and upcoming releases" full nativeBody>
		<div class="Fonts__list" aria-label="Typeface catalogue">
			{#each typefaces as tf (tf.slug)}
				<a href="/fonts/{tf.slug}" class="FontRow" aria-label="View {tf.name}">
					<!-- font-family inline on the element itself: base.css puts its own
					     on every tag, which beats anything inherited. -->
					<p
						class="FontRow__name"
						style="font-family: '{tf.fontFamily}', sans-serif; font-variation-settings: 'wght' {tf.specimenWeight ??
							400}; font-weight: {tf.specimenWeight ?? 400};"
					>
						{displayName(tf)}
					</p>

					<div class="FontRow__foot">
						<div class="FontRow__caption">
							<span class="FontRow__title">{tf.name}</span>
							<span class="FontRow__count">{caption(tf)}</span>
						</div>
						<span class="FontRow__pill">{tf.status === 'available' ? 'Buy' : 'Coming soon'}</span>
					</div>
				</a>
			{/each}
		</div>
	</PageSection>
</main>

<style>
	.Fonts {
		background: var(--color-bg);
	}

	/* A rule above the first row and under every one, at the page's own inset
	   (the section's padding) — the rows are not full-bleed. */
	.Fonts__list {
		border-top: 1px solid var(--color-text);
	}

	.FontRow {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 24px;
		/* Kontrapunkt's rows are about a third of the page's width tall. */
		min-height: clamp(300px, 33vw, 480px);
		padding: 20px 0;
		text-decoration: none;
		color: var(--color-text);
		border-bottom: 1px solid var(--color-text);
		transition: opacity 0.15s ease;
	}

	.FontRow:hover {
		opacity: 0.75;
	}

	/* The name: huge, centred in the space above the caption. */
	.FontRow__name {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		font-size: clamp(64px, 12vw, 180px);
		line-height: 1;
		letter-spacing: 0;
		text-align: center;
		color: var(--color-text);
	}

	.FontRow__foot {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
	}

	.FontRow__caption {
		display: grid;
		gap: 2px;
	}

	/* base.css puts its own font-family straight on every span; the brand
	   face has to be asserted per element, not inherited. */
	.FontRow__title,
	.FontRow__count,
	.FontRow__pill {
		font-family: var(--font-en), sans-serif;
		font-variation-settings: 'wght' 350;
		letter-spacing: 0;
		color: var(--color-text);
	}

	.FontRow__title {
		font-size: 15px;
		line-height: 1.3;
	}

	.FontRow__count {
		font-size: 15px;
		line-height: 1.3;
		opacity: 0.6;
	}

	/* A filled pill, as Kontrapunkt's "Buy". The ink and the page colour swap,
	   so it follows the page's theme. */
	.FontRow__pill {
		flex: none;
		font-size: 16px;
		line-height: 1.2;
		color: var(--color-bg);
		background: var(--color-text);
		border-radius: 999px;
		padding: 8px 16px;
		white-space: nowrap;
	}
</style>
