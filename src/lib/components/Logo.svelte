<!-- The Ōgast wordmark — the same five-glyph artwork IntroHero.svelte animates
     on the home page (Figma node 1:655, file UEy0lKKtgP8jN4x2DWZUOB), used
     here as-is (no motion) wherever the site needs a plain, static logo:
     Header.svelte and Footer.svelte, at the user's request (2026-09,
     "ロゴは、OGASTに全て入れ替えて" — replace the header/footer's plain
     text logo with the real logotype). This file used to hold different,
     older artwork (drawn for "August," the foundry's pre-rebrand name) that
     had gone unused since the site's copy moved to plain text; that artwork
     is gone now that there's a real use for this component again.

     fill="currentColor" on every path, so callers set colour via CSS
     `color` — Header paints it via its own mix-blend-mode:difference
     `color: inherit` chain, Footer via its plain black. The viewBox
     (0 0 1400 385.524) is IntroHero's own resting-state box: baseline-
     to-cap runs the full height (no extra side-bearing built in), so
     `height` below scales directly to the rendered glyph height — there is
     no separate cap-height factor to account for, unlike the old artwork
     this replaced. -->
<script lang="ts">
	interface Props {
		/** Rendered height in px (width follows the artwork's own ~3.63:1
		 *  aspect ratio, viewBox 1400 x 385.524). */
		height?: number;
		/** Accessible label. Pass '' when the artwork sits inside an element
		 *  that already carries its own accessible name (e.g. a linked
		 *  <a aria-label="…">) — an inner role="img" label would either be
		 *  redundant or, in a browser that exposes both, misleadingly
		 *  duplicated. */
		label?: string;
	}

	let { height = 20, label = 'Ōgast' }: Props = $props();
</script>

<svg
	class="Logo"
	viewBox="0 0 1400 385.524"
	role={label ? 'img' : 'presentation'}
	aria-label={label || undefined}
	aria-hidden={label ? undefined : 'true'}
	style="height: {height}px;"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		fill="currentColor"
		d="M0 215.153C0 124.553 60.5539 56.7302 148.863 56.7302C231.717 56.7302 297.726 120.465 297.726 215.153C297.726 309.84 244.012 380.86 148.863 380.86C60.0924 380.86 0 317.587 0 215.153ZM265.01 246.138C282.448 181.052 253.225 100.176 185.502 82.0296C120.416 64.5919 53.0877 115.356 34.5952 184.398C12.9217 265.307 46.2642 337.876 112.224 355.544C183.013 374.515 245.463 319.136 265.026 246.138H265.01ZM217.262 6.46084L80.4639 14.8995V0H217.262V6.46084Z"
	/>
	<path
		fill="currentColor"
		d="M572.065 362.318V363.224C549.765 373.69 518.812 380.53 493.315 380.53C393.634 380.53 333.08 313.614 333.08 222.569C333.08 131.524 398.628 59.6143 493.315 59.6143C526.542 59.6143 563.412 71.0031 586.635 84.65V116.971C567.055 101.033 520.625 84.65 487.398 84.65C421.389 84.65 360.39 140.177 360.39 220.295C360.39 291.298 418.653 355.94 487.398 355.94C516.538 355.94 548.397 347.748 572.065 333.64V242.595H486.492L468.279 217.097H602.111V385.524L572.065 362.318Z"
	/>
	<path
		fill="currentColor"
		d="M759.161 86.9084L740.043 59.5981H791.482L920.765 378.24H891.625L842.922 255.797H725.934L678.599 378.24H649.459L759.161 86.9084ZM832.901 230.761L780.555 100.572L733.664 230.761H832.901Z"
	/>
	<path
		fill="currentColor"
		d="M1035.97 378.701C1010.93 378.701 981.347 369.142 956.756 360.489L950.84 320.438C978.15 340.019 1009.56 352.759 1045.97 352.759C1075.56 352.759 1107.43 335.008 1107.43 304.055C1107.43 267.647 1064.18 242.595 1046.9 230.316C1000.47 202.099 961.322 182.058 961.322 136.09C961.322 84.6505 1004.11 59.1532 1056.92 59.1532C1073.3 59.1532 1098.8 65.0701 1111.09 71.8936C1117.47 74.6296 1120.19 76.904 1123.83 77.8105V111.944C1108.82 96.9293 1079.22 82.3595 1052.83 82.3595C1009.58 82.3595 988.187 108.763 988.187 133.799C988.187 158.835 1019.6 183.409 1066.48 213.917C1094.69 229.393 1136.13 263.527 1136.13 302.687C1136.13 361.412 1087.87 378.701 1035.98 378.701H1035.97Z"
	/>
	<path
		fill="currentColor"
		d="M1260.71 82.8205H1156.47V60.0592H1400L1384.99 82.8205H1288.02V378.701H1260.71V82.8205Z"
	/>
</svg>

<style>
	.Logo {
		display: block;
		width: auto;
	}
</style>
