<script lang="ts">
	// StyleList — the styles bundled in a package, as a clean 2-column grid:
	// left column takes the first half in order, right column the second
	// half, paired row by row. Each row uses the same round radio-dot
	// language as Typeface/Collection selection elsewhere on /buy — square
	// checkboxes read as a different control family, so this stays circular
	// even though many rows can be "on" at once. Selection reads through
	// opacity, not a background/colour invert.
	import type { PackageDef } from '$lib/data/pricing';
	import { WEIGHTS } from '$lib/components/TypeTester/presets';

	interface Props {
		pkg: PackageDef;
		/** When true, each style row is an individually toggleable selection. */
		selectable?: boolean;
		/** Selected style names (when selectable). */
		selected?: Set<string>;
		/** Called when a style row is toggled. */
		onToggle?: (name: string) => void;
	}

	let { pkg, selectable = false, selected, onToggle }: Props = $props();

	// Resolve wght axis value from weight name; falls back to 400 if not found.
	function axisValue(weightName: string): number {
		return WEIGHTS.find((w) => w.name === weightName)?.axisValue ?? 400;
	}

	const hasItalic = $derived(pkg.italic === true);
	const styles = $derived(pkg.styles ?? []);

	interface Cell {
		name: string;
		wght: number;
		italic: boolean;
	}

	// Row pairs — left column is the first half in source order, right
	// column the second half (e.g. 1–45 left, 50–95 right for Steiner's 20
	// weights), not an interleaved split.
	const rows = $derived.by<{ left: Cell; right: Cell | null }[]>(() => {
		if (hasItalic) {
			return styles.map((n) => ({
				left: { name: n, wght: axisValue(n), italic: false },
				right: { name: n, wght: axisValue(n), italic: true }
			}));
		}
		const half = Math.ceil(styles.length / 2);
		return Array.from({ length: half }, (_, i) => {
			const r = styles[i + half];
			return {
				left: { name: styles[i], wght: axisValue(styles[i]), italic: false },
				right: r ? { name: r, wght: axisValue(r), italic: false } : null
			};
		});
	});
</script>

{#snippet cell(c: Cell)}
	{@const sel = selected?.has(c.name) ?? false}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="StyleList__row"
		class:is-selectable={selectable}
		class:is-on={selectable && sel}
		role={selectable ? 'button' : undefined}
		tabindex={selectable ? 0 : undefined}
		aria-pressed={selectable ? sel : undefined}
		onclick={selectable ? () => onToggle?.(c.name) : undefined}
		onkeydown={selectable
			? (e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onToggle?.(c.name);
					}
				}
			: undefined}
	>
		{#if selectable}
			<span class="StyleList__radio" aria-hidden="true">
				<span class="StyleList__dot"></span>
			</span>
		{/if}
		<span
			class="StyleList__preview"
			style="font-variation-settings: 'wght' {c.wght};{c.italic ? ' font-style: italic;' : ''}"
			aria-hidden="true">Aa</span>
		<span class="StyleList__name">
			{c.name}{#if c.italic}<span class="StyleList__ital">Italic</span>{/if}
		</span>
	</div>
{/snippet}

{#if styles.length > 0}
	<div class="StyleList">
		{#each rows as row, i (i)}
			{@render cell(row.left)}
			{#if row.right}
				{@render cell(row.right)}
			{:else}
				<div class="StyleList__row StyleList__row--empty"></div>
			{/if}
		{/each}
	</div>
{/if}

<style>
	/* 2-column grid — left = first half in order, right = second half,
	   paired row by row. Full-bleed with a center divider. */
	.StyleList {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border-top: 1px solid var(--color-line);
	}

	.StyleList__row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 0;
		min-height: 44px;
		border-bottom: 1px solid var(--color-line);
		opacity: 1;
		transition: opacity 150ms ease;
	}

	.StyleList__row.is-selectable {
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	/* Selection reads through opacity + a light grey fill — no dark
	   background/colour invert anywhere in this list. */
	.StyleList__row.is-selectable:not(.is-on) {
		opacity: 0.35;
	}

	.StyleList__row.is-selectable:not(.is-on):hover {
		opacity: 0.6;
	}

	.StyleList__row.is-on {
		background: var(--color-bg-gray);
	}

	/* Outer edges align with the panel's own padding; a little breathing
	   room around the center divider. */
	.StyleList__row:nth-child(odd) {
		padding-left: var(--padding);
		padding-right: 12px;
	}

	.StyleList__row:nth-child(even) {
		border-left: 1px solid var(--color-line);
		padding-left: 12px;
		padding-right: var(--padding);
	}

	/* Round radio — same outline-+-fill language as TypefaceCard/CollectionCard. */
	.StyleList__radio {
		width: 11px;
		height: 11px;
		flex-shrink: 0;
		border: 1px solid currentColor;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.StyleList__dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: currentColor;
		opacity: 0;
		transition: opacity 150ms ease;
	}

	.StyleList__row.is-on .StyleList__dot {
		opacity: 1;
	}

	/* "Aa" preview glyph */
	.StyleList__preview {
		font-family: 'Steiner', sans-serif;
		font-size: 18px;
		line-height: 1;
		flex-shrink: 0;
		width: 28px;
		text-align: center;
		color: var(--color-text);
	}

	.StyleList__name {
		font-family: 'Steiner', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 400;
		line-height: 1.25;
		color: var(--color-text);
		letter-spacing: 0;
		font-variant-numeric: tabular-nums;
	}

	/* "Italic" on its own line */
	.StyleList__ital {
		display: block;
		font-size: 10px;
		font-style: italic;
		color: var(--color-text-mute);
	}
</style>
