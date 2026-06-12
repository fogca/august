<script lang="ts">
	// StyleList — the styles bundled in a package, as a simple 2-column grid.
	//  - italic packages: same weight's upright (left) + italic (right).
	//  - non-italic packages: weight list split in half (e.g. 8 → 4×2).
	// Lives inside the package card; colours inherit so it adapts to the
	// card's selected (inverted) state. Faux italic until italic masters ship.
	import type { PackageDef } from '$lib/data/pricing';
	import { WEIGHTS } from '$lib/components/TypeTester/presets';

	interface Props {
		pkg: PackageDef;
		/** Whether the parent card is selected (inverted). Makes all text fully white. */
		active?: boolean;
		/** When true, each style row is an individually toggleable selection (gQ). */
		selectable?: boolean;
		/** Selected style names (when selectable). */
		selected?: Set<string>;
		/** Called when a style row is toggled. */
		onToggle?: (name: string) => void;
	}

	let { pkg, active = false, selectable = false, selected, onToggle }: Props = $props();

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
			<span class="StyleList__check" aria-hidden="true"></span>
		{/if}
		<span
			class="StyleList__preview"
			style="font-variation-settings: 'wght' {c.wght};{c.italic ? ' font-style: italic;' : ''}"
			aria-hidden="true">Aa</span>
		<span class="StyleList__name">
			{c.name}{#if c.italic}<span class="StyleList__ital">Italic</span>{/if}
		</span>
		<span class="StyleList__num">{c.wght}</span>
	</div>
{/snippet}

{#if styles.length > 0}
	<div class="StyleList" class:is-active={active}>
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
	/* 2-column grid — full-bleed (no padding), white lines, center divider. */
	.StyleList {
		display: grid;
		grid-template-columns: 1fr 1fr;
		border-top: 2px solid rgba(255, 255, 255, 0.6);
	}

	.StyleList__row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		min-height: 40px;
		border-bottom: 2px solid rgba(255, 255, 255, 0.6);
	}

	/* Outer edges align with the head (var(--padding)); 12px around the divider */
	.StyleList__row:nth-child(odd) {
		padding-left: var(--padding);
		padding-right: 12px;
	}

	.StyleList__row:nth-child(even) {
		border-left: 2px solid rgba(255, 255, 255, 0.6);
		padding-left: 12px;
		padding-right: var(--padding);
	}

	/* Selectable rows (gQ): toggle individual weights */
	.StyleList__row.is-selectable {
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	/* Checkbox indicator — fills when the weight is selected */
	.StyleList__check {
		width: 11px;
		height: 11px;
		flex-shrink: 0;
		border: 1px solid currentColor;
	}

	/* Selected weight: only this row goes black (the card itself stays grey) */
	.StyleList__row.is-on {
		background: var(--color-text);
		color: var(--color-bg);
	}

	.StyleList__row.is-on .StyleList__name,
	.StyleList__row.is-on .StyleList__preview {
		color: var(--color-bg);
	}

	.StyleList__row.is-on .StyleList__num {
		color: var(--color-bg);
		opacity: 0.6;
	}

	.StyleList__row.is-on .StyleList__check {
		background: var(--color-bg);
		border-color: var(--color-bg);
	}

	/* "Aa" preview glyph — inherits card text colour */
	.StyleList__preview {
		font-family: 'Steiner', sans-serif;
		font-size: 18px;
		line-height: 1;
		flex-shrink: 0;
		width: 30px;
		text-align: center;
		color: inherit;
	}

	.StyleList__name {
		font-family: 'Steiner', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 350;
		line-height: 1.25;
		color: inherit;
		letter-spacing: 0;
	}

	/* "Italic" on its own line */
	.StyleList__ital {
		display: block;
		font-style: italic;
		opacity: 0.7;
	}

	/* Weight number (e.g. 50, 150) — right-aligned, muted */
	.StyleList__num {
		margin-left: auto;
		font-family: 'Steiner', sans-serif;
		font-size: 10px;
		color: inherit;
		opacity: 0.45;
		font-variant-numeric: tabular-nums;
	}

	/* Selected card: all text fully white (drop muting) */
	.StyleList.is-active .StyleList__num,
	.StyleList.is-active .StyleList__ital {
		opacity: 1;
	}
</style>
