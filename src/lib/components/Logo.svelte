<script lang="ts">
	// August wordmark — supplied as artwork, imported verbatim. The only edit to
	// the source SVG is fill: the export carried a hard-coded #fff class, so each
	// path now takes fill="currentColor" and the mark follows the parent's CSS
	// `color` (Header paints it signal red, Footer #fff, etc).
	//
	// The viewBox is tight to the ink and INCLUDES the descender of the g
	// (baseline sits at 40.12 of 51.45), so `height` is not a cap height and not
	// an em box. Call-site heights are set so the rendered cap height matches the
	// mark this one replaced: cap = height x 0.780.
	interface Props {
		/** Rendered height in px (width scales with the 3.207:1 aspect ratio) */
		height?: number;
		/** Accessible label */
		label?: string;
	}

	let { height = 29, label = 'August Type Foundry' }: Props = $props();
</script>

<svg
	class="Logo"
	viewBox="0 0 164.99 51.45"
	role="img"
	aria-label={label}
	style="height: {height}px;"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		fill="currentColor"
		d="M16.3,0h5.47l16.47,40.12h-5.91l-4.64-11.66H10.11l-4.37,11.66H0L16.3,0ZM26.09,24.04l-3.81-10.33c-1.05-2.87-2.21-5.64-3.15-8.46h-.22c-.94,2.71-1.93,5.58-2.98,8.34l-4.03,10.45h14.2Z"
	/>
	<path
		fill="currentColor"
		d="M39.91,35.65c-.94-1.93-.94-4.75-.94-7.46V11.61h5.03v16.08c0,4.37.55,9.01,6.02,9.01,4.75,0,7.57-3.26,7.57-10.11v-14.98h5.03v28.52h-4.7v-3.65c-2.54,3.43-6.13,4.26-9.01,4.26-4.97,0-7.52-2.04-9.01-5.08Z"
	/>
	<path
		fill="currentColor"
		d="M67.49,42.5h5.25c.22,3.54,2.6,5.14,6.63,5.14,4.97,0,7.57-2.43,7.57-9.95v-2.82c-2.43,3.26-4.97,4.31-9.01,4.31-7.07,0-11.66-5.8-11.66-13.87,0-7.41,4.37-14.31,11.94-14.31,4.15,0,7.19,1.55,8.84,4.59v-3.98h4.7v24.43c0,9.73-2.76,15.42-12.49,15.42-6.91,0-11.27-2.93-11.77-8.95ZM87,24.82c0-5.8-3.15-9.89-7.79-9.89-4.92,0-7.74,3.98-7.74,9.84,0,6.58,2.98,10.5,7.74,10.5s7.79-4.04,7.79-10.45Z"
	/>
	<path
		fill="currentColor"
		d="M97.83,35.65c-.94-1.93-.94-4.75-.94-7.46V11.61h5.03v16.08c0,4.37.55,9.01,6.02,9.01,4.75,0,7.57-3.26,7.57-10.11v-14.98h5.03v28.52h-4.7v-3.65c-2.54,3.43-6.13,4.26-9.01,4.26-4.97,0-7.52-2.04-9.01-5.08Z"
	/>
	<path
		fill="currentColor"
		d="M122.76,30.95h5.14c0,4.04,2.71,6.08,7.41,6.08,3.87,0,6.08-1.49,6.08-4.26,0-3.48-3.48-4.2-7.35-4.92-4.97-.94-10.61-1.82-10.61-8.79,0-4.86,4.42-8.29,11.16-8.29,7.18,0,11.33,3.37,11.38,9.56h-5.03c-.06-3.76-2.1-5.58-6.47-5.58-3.48,0-5.75,1.55-5.75,3.98,0,3.21,3.26,3.92,7.02,4.64,5.08,1,11.05,1.99,11.05,9.06,0,5.14-4.92,8.51-11.61,8.51-7.9,0-12.38-3.65-12.44-10Z"
	/>
	<path
		fill="currentColor"
		d="M153.6,32.39V15.81h-5.25v-4.2h5.25v-6.91h5.08v6.91h6.19v4.2h-6.19v14.2c0,4.04.17,6.3,3.43,6.3.77,0,1.71,0,2.87-.28v4.09c-1.49.33-2.93.5-4.2.5-4.48,0-7.19-1.99-7.19-8.23Z"
	/>
</svg>

<style>
	.Logo {
		display: block;
		width: auto;
	}
</style>
