<script lang="ts">
	// Cover-reveal debug page.
	// Plain full-screen colour blocks (no video / fonts / transitions) so the
	// cover-reveal scroll logic can be isolated and tuned. GSAP markers are on,
	// and a fixed HUD reports scroll position + measured block heights.
	import { onMount } from 'svelte';
	import { coverReveal } from '$lib/actions/coverReveal';
	import { maskReveal } from '$lib/actions/maskReveal';

	type Block = {
		n: string;
		bg: string;
		fg: string;
		note: string;
		cover: boolean; // mark = slides up over the previous block
	};

	const blocks: Block[] = [
		{ n: '00', bg: '#dddddd', fg: '#111', note: 'START — covered by 01', cover: false },
		{ n: '01', bg: '#e23b2e', fg: '#fff', note: 'COVERS 00', cover: true },
		{ n: '02', bg: '#1f9d55', fg: '#fff', note: 'normal', cover: false },
		{ n: '03', bg: '#2b6cb0', fg: '#fff', note: 'normal — covered by 04', cover: false },
		{ n: '04', bg: '#6b46c1', fg: '#fff', note: 'COVERS 03', cover: true },
		{ n: '05', bg: '#b8860b', fg: '#fff', note: 'COVERS 04', cover: true }
	];

	let scrollY = $state(0);
	let vh = $state(0);

	onMount(() => {
		const update = () => {
			scrollY = Math.round(window.scrollY);
			vh = window.innerHeight;
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		// Lenis drives scroll separately — listen to it too if present.
		const lenis = (window as Window & { __lenisInstance?: { on: (e: string, fn: () => void) => void } })
			.__lenisInstance;
		lenis?.on('scroll', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<svelte:head>
	<title>Cover-reveal test</title>
</svelte:head>

<div class="hud">
	scrollY {scrollY}<br />
	vh {vh}<br />
	progress {vh ? (scrollY / vh).toFixed(2) : 0}
</div>

<main class="Test">
	{#each blocks as b (b.n)}
		<section
			class="Block"
			style="background: {b.bg}; color: {b.fg};"
			use:coverReveal={{ enabled: b.cover, markers: true }}
		>
			<div class="Block__num">{b.n}</div>
			<div class="Block__note">{b.note}</div>
		</section>
	{/each}

	<!-- divider into the v2 area -->
	<section class="Block" style="background:#111;color:#fff;">
		<div class="Block__num">V2</div>
		<div class="Block__note">REVEAL — scroll down</div>
	</section>

	<!-- v2 "reveal" — 2 layers. Listed first = on top, clips first. -->
	<section class="Reveal" use:maskReveal={{ markers: true, scale: 1.06 }}>
		<div class="Reveal__layer Reveal__a" data-layer>
			<div class="Reveal__inner Reveal__frame">
				<div class="Block__num">PARA</div>
				<div class="Block__note">shown first — clips up + scales (origin bottom)</div>
			</div>
		</div>
		<div class="Reveal__layer Reveal__b" data-layer>
			<div class="Reveal__inner">
				<div class="Block__num">EMO</div>
				<div class="Block__note">revealed — already in place</div>
			</div>
		</div>
	</section>

	<!-- bridge so the next chain is reached by normal scroll -->
	<section class="Block" style="background:#444;color:#fff;">
		<div class="Block__num">V2·3</div>
		<div class="Block__note">3-LAYER CHAIN — scroll down</div>
	</section>

	<!-- v2 "reveal" — 3-layer chain (mirrors homepage font03 → About → Custom) -->
	<section class="Reveal" use:maskReveal={{ markers: true, scale: 1.06 }}>
		<div class="Reveal__layer Reveal__a" data-layer>
			<div class="Reveal__inner Reveal__frame">
				<div class="Block__num">①</div>
				<div class="Block__note">clips → reveals ②</div>
			</div>
		</div>
		<div class="Reveal__layer Reveal__b" data-layer>
			<div class="Reveal__inner Reveal__frame">
				<div class="Block__num">②</div>
				<div class="Block__note">revealed, then clips → reveals ③</div>
			</div>
		</div>
		<div class="Reveal__layer Reveal__c" data-layer>
			<div class="Reveal__inner">
				<div class="Block__num">③</div>
				<div class="Block__note">final — never clips</div>
			</div>
		</div>
	</section>

	<!-- short trailing block to confirm normal flow resumes after the reveal -->
	<section class="Block Block--short" style="background:#333;color:#fff;">
		<div class="Block__note">END (300px, normal)</div>
	</section>
</main>

<style>
	.hud {
		position: fixed;
		top: 12px;
		right: 12px;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.8);
		color: #0f0;
		font-family: ui-monospace, monospace;
		font-size: 12px;
		line-height: 1.5;
		padding: 8px 10px;
		border-radius: 4px;
		pointer-events: none;
		white-space: nowrap;
	}

	.Block {
		height: 100vh;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}

	.Block--short {
		height: 300px;
		min-height: 300px;
	}

	.Block__num {
		font-family: ui-monospace, monospace;
		font-size: clamp(80px, 18vw, 220px);
		font-weight: 700;
		line-height: 1;
	}

	.Block__note {
		font-family: ui-monospace, monospace;
		font-size: 14px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		opacity: 0.85;
	}

	/* --- v2 reveal ---
	   Flow fallback by default (relative, stacked). The action overlaps the
	   layers (absolute) only when the effect is active. */
	.Reveal {
		position: relative;
		overflow: hidden;
	}

	.Reveal__layer {
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.Reveal__a {
		/* gradient so the scale-up accent is visible on a full-bleed layer */
		background: linear-gradient(160deg, #efe9db 0%, #d8cbb0 100%);
		color: #111;
	}

	.Reveal__b {
		background: #0b3d3a;
		color: #fff;
	}

	.Reveal__c {
		background: #4b2e83;
		color: #fff;
	}

	.Reveal__inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		text-align: center;
		padding: 24px;
	}

	.Reveal__frame {
		border: 2px solid currentColor;
	}
</style>
