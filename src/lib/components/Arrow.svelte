<script lang="ts">
	// Small chevron-arrow glyph used inline after CTA text (replaces the plain
	// unicode "→"). fill="currentColor" so it follows the parent's text color.
	interface Props {
		/** Rendered height in px (width scales with the source 384.36:615.17 aspect ratio) */
		size?: number;
		class?: string;
	}

	let { size = 11, class: className = '' }: Props = $props();
</script>

<svg
	class="Arrow {className}"
	viewBox="0 0 384.36 615.17"
	style="height: {size}px;"
	fill="none"
	aria-hidden="true"
	xmlns="http://www.w3.org/2000/svg"
>
	<polygon
		points="56.19 615.17 8.69 563.76 281.28 311.88 0 51.36 47.57 0 384.36 311.94 56.19 615.17"
		fill="currentColor"
	/>
</svg>

<style>
	.Arrow {
		display: inline-block;
		width: auto;
		vertical-align: middle;
		flex-shrink: 0;
	}
</style>
