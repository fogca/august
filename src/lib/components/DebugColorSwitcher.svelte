<!-- Temporary debug tool (2026-09, at the user's request — "切り替え機能を
     設置してこちらでデバックできるようにして") for comparing the three
     "summer" background candidates live, wherever they're used (About,
     Contact). Fixed bottom-left, out of the way of real content, and
     obviously a dev affordance rather than site chrome — meant to be removed
     once a colour is picked, not shipped as a permanent feature. -->
<script lang="ts">
	import { summerColor, SUMMER_COLORS } from '$lib/state/summerColor.svelte';
</script>

<div class="DebugColorSwitcher" role="group" aria-label="Debug: summer colour">
	<span class="DebugColorSwitcher__label">Colour debug</span>
	{#each SUMMER_COLORS as c (c.key)}
		<button
			type="button"
			class="DebugColorSwitcher__swatch"
			class:is-active={summerColor.current === c.key}
			style="background: {c.hex};"
			onclick={() => (summerColor.current = c.key)}
			aria-pressed={summerColor.current === c.key}
			title={c.label}
		>
			<span class="DebugColorSwitcher__sr">{c.label}</span>
		</button>
	{/each}
</div>

<style>
	.DebugColorSwitcher {
		position: fixed;
		left: 12px;
		bottom: 12px;
		z-index: 200;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 8px;
		background: #ffffff;
		border: 1px solid #000000;
		font-family: 'Norma', sans-serif;
	}

	.DebugColorSwitcher__label {
		font-size: 10px;
		color: #000000;
		opacity: 0.5;
		margin-right: 2px;
		white-space: nowrap;
	}

	.DebugColorSwitcher__swatch {
		width: 20px;
		height: 20px;
		border: 1px solid rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		padding: 0;
		cursor: pointer;
	}

	.DebugColorSwitcher__swatch.is-active {
		border: 2px solid #000000;
	}

	.DebugColorSwitcher__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
