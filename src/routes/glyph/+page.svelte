<!-- Glyph Check — internal QA tool for proofing a typeface across a long,
     varied block of running text (not a single word/line, like the Type
     Tester) rather than eyeballing individual characters. Same convention
     as /opentype: noindex, not in nav, direct-URL only.

     Sample texts are deliberately varied (per the user's request, "Lorem
     Ipsumとかから他のサンプルまで"): classic filler text, pangrams (letter-
     frequency-dense), real accented running copy, and a numerals/
     punctuation-heavy block — different failure modes surface in each.
     "Wine & Terroir" reuses Norma's own real, already-vetted defaultTexts
     (typefaces.ts) rather than inventing new French copy for this page. -->
<script lang="ts">
	import { TYPEFACES, getTypeface } from '$lib/data/typefaces.js';

	// Every typeface, hidden ones included — this is an internal glyph-check
	// tool, and checking coverage on an in-development face is the point.
	const typefaceOptions = TYPEFACES.slice().sort((a, b) => a.order - b.order);

	let selectedSlug = $state(typefaceOptions[0]?.slug ?? 'norma');
	const tf = $derived(getTypeface(selectedSlug) ?? typefaceOptions[0]);

	// No weight control was asked for, but rendering at each font's own
	// unset fvar default (Elio's happens to sit at Hair, its lightest
	// master — not a deliberate choice, just what ufo2ft left unset) isn't
	// representative for a coverage check. Resolve each typeface's own
	// "Regular" stop instead, falling back to its middle stop if none is
	// labelled that.
	const weight = $derived(
		tf.weights.find((w) => w.label === 'Regular')?.axisValue ??
			tf.weights[Math.floor(tf.weights.length / 2)]?.axisValue ??
			400
	);

	const LOREM_IPSUM =
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ' +
		'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. ' +
		'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?';

	// English + French pangrams — dense letter-frequency coverage, and the
	// French ones add accented characters English pangrams don't exercise.
	const PANGRAMS =
		'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly. Sphinx of black quartz, judge my vow. Waltz, bad nymph, for quick jigs vex. Jackdaws love my big sphinx of quartz. Two driven jocks help fax my big quiz. Quick zephyrs blow, vexing daft Jim. ' +
		"Portez ce vieux whisky au juge blond qui fume. Voix ambiguë d'un cœur qui au zéphyr préfère les jattes de kiwis.";

	// Real, already-vetted copy (typefaces.ts's Norma entry) rather than
	// invented text — also genuinely useful here since it's dense with
	// French accented characters.
	const WINE_TERROIR = (getTypeface('norma')?.defaultTexts ?? []).join(' ');

	const NUMERALS =
		'Invoice #2026-0917 — Subtotal: $1,234.56; Tax (8.25%): $101.85; Total: $1,336.41. Delivery scheduled for 03/14–03/21, 2027 (Mon–Fri, 9:00–17:30). Contact: +1 (555) 012-3456 or hi@example.com. Terms: Net 30 days; 2% discount if paid within 10 days. Quantities: 1×, 2×, 10×, 100×, 1,000×. Temperature range: −20°C to +45°C. Score: 98.6% (A+). See §4.2, footnote¹, and Table 3.14159. "Quoted text" and \'single quotes\' — plus an em dash — and an ellipsis…';

	const DIACRITICS =
		'Café, naïve, façade, jalapeño, über, résumé, château, cliché, señor, crème brûlée, Zürich, Møller, Åland, île, œuvre, garçon, Noël, açaí, Weiß, Straße, piñata, déjà vu, exposé, fiancée, protégé, tête-à-tête, vis-à-vis.';

	type SampleOption = { key: string; label: string; text: string };
	const SAMPLES: SampleOption[] = [
		{ key: 'lorem', label: 'Lorem Ipsum', text: LOREM_IPSUM },
		{ key: 'pangrams', label: 'Pangrams', text: PANGRAMS },
		{ key: 'wine', label: 'Wine & Terroir', text: WINE_TERROIR },
		{ key: 'numerals', label: 'Numerals & Punctuation', text: NUMERALS },
		{ key: 'diacritics', label: 'Diacritics', text: DIACRITICS }
	];

	let selectedSampleKey = $state(SAMPLES[0].key);
	const sample = $derived(SAMPLES.find((s) => s.key === selectedSampleKey) ?? SAMPLES[0]);

	type TransformOption = 'none' | 'uppercase' | 'capitalize';
	const TRANSFORMS: { key: TransformOption; label: string }[] = [
		{ key: 'none', label: 'None' },
		{ key: 'uppercase', label: 'Uppercase' },
		{ key: 'capitalize', label: 'Capitalise' }
	];
	let transform = $state<TransformOption>('none');
</script>

<svelte:head>
	<title>Glyph Check — Ôgast</title>
	<meta name="description" content="Proof a typeface across long, varied sample text." />
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="GlyphCheck">
	<header class="GlyphCheck__head">
		<h1 class="GlyphCheck__title">Glyph Check</h1>

		<div class="GlyphCheck__controls">
			<label class="GlyphCheck__field">
				<span>Typeface</span>
				<select bind:value={selectedSlug}>
					{#each typefaceOptions as t (t.slug)}
						<option value={t.slug}>{t.name}</option>
					{/each}
				</select>
			</label>

			<label class="GlyphCheck__field">
				<span>Sample</span>
				<select bind:value={selectedSampleKey}>
					{#each SAMPLES as s (s.key)}
						<option value={s.key}>{s.label}</option>
					{/each}
				</select>
			</label>

			<div class="GlyphCheck__field">
				<span>Transform</span>
				<div class="GlyphCheck__transform" role="group" aria-label="Text transform">
					{#each TRANSFORMS as t (t.key)}
						<button
							type="button"
							class:is-active={transform === t.key}
							aria-pressed={transform === t.key}
							onclick={() => (transform = t.key)}
						>
							{t.label}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</header>

	<div
		class="GlyphCheck__sample"
		style="--sample-font: '{tf.fontFamily}'; --sample-wght: {weight}; --sample-transform: {transform};"
		lang={sample.key === 'wine' || sample.key === 'pangrams' ? 'fr' : 'en'}
	>
		{sample.text}
	</div>
</main>

<style>
	.GlyphCheck {
		min-height: 100vh;
		min-height: 100dvh;
		padding: 96px var(--padding) 64px;
	}

	@media (min-width: 768px) {
		.GlyphCheck {
			padding-top: 120px;
		}
	}

	.GlyphCheck__head {
		margin-bottom: 40px;
	}

	.GlyphCheck__title {
		font-family: 'Norma', sans-serif;
		font-size: clamp(28px, 4vw, 40px);
		letter-spacing: 0;
		margin: 0 0 24px;
	}

	.GlyphCheck__controls {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: flex-end;
	}

	.GlyphCheck__field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-family: 'Norma', sans-serif;
	}

	.GlyphCheck__field > span {
		font-size: 11px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.55;
	}

	.GlyphCheck__field select {
		font-family: 'Norma', sans-serif;
		font-size: 14px;
		color: var(--color-text);
		background: var(--color-bg-gray, #f3f3f3);
		border: 1px solid var(--color-line);
		padding: 8px 10px;
		min-width: 180px;
		border-radius: 0;
	}

	.GlyphCheck__transform {
		display: flex;
		gap: 8px;
	}

	.GlyphCheck__transform button {
		font-family: 'Norma', sans-serif;
		font-size: 13px;
		color: var(--color-text);
		background: transparent;
		border: 1px solid var(--color-line);
		padding: 8px 12px;
		cursor: pointer;
		opacity: 0.55;
		transition:
			opacity 0.15s ease,
			background-color 0.15s ease;
	}

	.GlyphCheck__transform button:hover {
		opacity: 0.85;
	}

	.GlyphCheck__transform button.is-active {
		opacity: 1;
		background: var(--color-text);
		color: var(--color-bg);
	}

	/* The actual proof — no width cap (this is for scanning a lot of text
	   at once, not for reading comfort), generous line-height so accents
	   and descenders don't collide across lines. */
	.GlyphCheck__sample {
		font-family: var(--sample-font), sans-serif;
		font-variation-settings: 'wght' var(--sample-wght);
		text-transform: var(--sample-transform);
		font-size: clamp(20px, 2.2vw, 32px);
		line-height: 1.5;
		letter-spacing: 0;
		max-width: 100%;
	}
</style>
