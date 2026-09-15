<!-- Home page "typeface section" — one full-bleed 100vh/100svh intro per
     typeface (Figma nodes 3:699 "Norma" / 3:733 "Elio" for PC, 7:887 / 7:906
     for SP, file UEy0lKKtgP8jN4x2DWZUOB). Replaces the old Hero/Elio/Alfred
     blocks that used to live directly in +page.svelte.

     Layout: a white sidebar (name/tagline/spec/Discover) beside a large
     colour panel holding a giant classification headline set in the
     typeface's OWN font (self-referential specimen, e.g. Norma's own page
     reads "Natural Humanist Sans" in Norma itself) — then, below the panel,
     two blocks that stand in for real specimen photography. Neither Norma
     nor Elio has real application photography shot yet (see typefaces.ts's
     own documented placeholder conventions for inUseImages/inspiration), and
     Figma's own two photo blocks turned out to be borrowed mockup photos of
     unrelated, unrelated third-party specimens ("Aska", "Saffron" — checked
     during Figma research, not this project's own type at all) — so rather
     than ship someone else's type as if it were ours, these render as solid
     colour + real typographic content instead (the user's own fallback plan
     for exactly this situation). The one exception is Norma, which already
     has a real asset — its existing wght-sweep video — used in block A in
     place of a synthetic glyph tile.

     PC keeps two blocks side by side (402:676 ratio, per Figma); SP shows
     only block A, matching Figma's own single-photo mobile simplification.

     Scroll choreography (2026-09, at the user's request — "かっこよく
     スクロール...ふわっとテキストがoutしたり画像のcontainerがshrink out"):
     the sidebar text and panel headline fade+drift out as the section
     scrolls past (same beat the logo intro's own opacity animation uses),
     and the block containers shrink+fade — then both reverse coming back
     into view. Driven by one scrubbed GSAP timeline per section, tied to
     this section's own position in the viewport, so it plays forward AND
     backward with scroll direction rather than firing once.

     The mobile footer bar is NOT rendered here any more — the user wants
     ONE persistent fixed bar at the bottom of the screen (not one per
     section, scrolling away with it), whose content/colour just switches
     to whichever typeface is currently centred in view. See
     TypefaceFooterBar.svelte (rendered once in +page.svelte) and
     activeTypeface.svelte.ts (the shared signal this section reports
     itself to, the same cross-sibling pattern as homeIntro.svelte.ts). -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Typeface } from '$lib/data/typefaces';
	import Arrow from '$lib/components/Arrow.svelte';
	import { getScrollTrigger } from '$lib/scroll';
	import { activeTypeface } from '$lib/state/activeTypeface.svelte';

	interface Props {
		typeface: Typeface;
	}
	let { typeface }: Props = $props();

	// Narrowed once here — the component is only ever rendered for typefaces
	// that define homeSection (see +page.svelte's filter), but the field is
	// optional on the shared Typeface type.
	const hs = $derived(typeface.homeSection!);

	let sectionEl: HTMLElement | undefined = $state();
	let sidebarEl: HTMLElement | undefined = $state();
	let headlineEl: HTMLElement | undefined = $state();
	let blockAEl: HTMLElement | undefined = $state();
	let blockBEl: HTMLElement | undefined = $state();
	let videoEl: HTMLVideoElement | undefined = $state();

	onMount(() => {
		if (!browser) return;

		// Reports this section to the shared "currently centred typeface"
		// signal the fixed mobile footer bar reads — see the file header
		// comment. `-50% 0px -50% 0px` fires exactly as this section's own
		// bounds cross the viewport's vertical centre, so consecutive
		// sections hand off cleanly with no gap/overlap.
		//
		// Two independent sections' observers can fire in either order on
		// the same frame (browsers don't guarantee it), so the "leaving"
		// branch only clears `visible` if THIS section is still the one
		// current — otherwise a leave event arriving after the next
		// section's own enter would incorrectly hide the bar right as it
		// should be showing the next typeface.
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					activeTypeface.current = typeface;
					activeTypeface.visible = true;
				} else if (activeTypeface.current === typeface) {
					activeTypeface.visible = false;
				}
			},
			{ rootMargin: '-50% 0px -50% 0px', threshold: 0 }
		);
		if (sectionEl) observer.observe(sectionEl);

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			videoEl?.pause();
			return () => observer.disconnect();
		}

		let cancelled = false;
		let scrollTriggerInstance: { kill: () => void } | undefined;
		getScrollTrigger().then(({ gsap }) => {
			if (cancelled || !sectionEl) return;
			videoEl?.pause();
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

			const fadeTargets = [sidebarEl, headlineEl].filter((el): el is HTMLElement => !!el);
			const shrinkTargets = [blockAEl, blockBEl].filter((el): el is HTMLElement => !!el);

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: sectionEl,
					start: 'top bottom',
					end: 'bottom top',
					scrub: 0.4
				}
			});
			tl.fromTo(
				fadeTargets,
				{ opacity: 0, y: 28 },
				{ opacity: 1, y: 0, duration: 0.2, ease: 'power1.out' },
				0
			)
				.to(fadeTargets, { opacity: 0, y: -28, duration: 0.2, ease: 'power1.in' }, 0.8)
				.fromTo(
					shrinkTargets,
					{ opacity: 0, scale: 0.85 },
					{ opacity: 1, scale: 1, duration: 0.2, ease: 'power1.out' },
					0
				)
				.to(shrinkTargets, { opacity: 0, scale: 0.85, duration: 0.2, ease: 'power1.in' }, 0.8);
			scrollTriggerInstance = tl.scrollTrigger;
		});

		return () => {
			cancelled = true;
			observer.disconnect();
			scrollTriggerInstance?.kill();
		};
	});
</script>

<section
	class="TypefaceSection"
	bind:this={sectionEl}
	style="--type-font: '{typeface.fontFamily}'; --panel-bg: {hs.panelBg}; --panel-fg: {hs.panelFg}; --block-bg: {hs.blockBg}; --block-fg: {hs.blockFg};"
>
	<!-- PC only — name/tagline/spec/Discover, always on a white ground -->
	<div class="TypefaceSection__sidebar" bind:this={sidebarEl}>
		<p class="TypefaceSection__name">{typeface.name} Ôgast</p>
		<p class="TypefaceSection__tagline">{typeface.tagline}</p>
		<p class="TypefaceSection__meta">
			{typeface.weights.length} weights / {typeface.info?.languages ?? '—'} languages supported
		</p>
		<a class="TypefaceSection__cta" href="/fonts/{typeface.slug}">
			<span class="CtaLabel">Discover</span>
			<Arrow size={9} />
		</a>
	</div>

	<div class="TypefaceSection__panel">
		<p
			class="TypefaceSection__headline"
			bind:this={headlineEl}
			style="font-family: '{typeface.fontFamily}', sans-serif; font-variation-settings: 'wght' {hs.headlineWeight}; font-weight: {hs.headlineWeight};"
		>
			{hs.headline}
		</p>
	</div>

	<div class="TypefaceSection__blocks">
		<div class="TypefaceSection__blockA" bind:this={blockAEl}>
			{#if typeface.heroVideo}
				<video
					bind:this={videoEl}
					class="TypefaceSection__video"
					src={typeface.heroVideo}
					autoplay
					loop
					muted
					playsinline
					aria-label="{typeface.name} variable weight axis specimen"
				></video>
			{:else}
				<span
					class="TypefaceSection__glyph"
					style="font-family: '{typeface.fontFamily}', sans-serif;">{hs.glyph}</span
				>
			{/if}
		</div>
		<div class="TypefaceSection__blockB" bind:this={blockBEl}>
			{#if typeface.specimen}
				<div
					class="TypefaceSection__specimen"
					style="font-family: '{typeface.fontFamily}', sans-serif;"
				>
					{#each typeface.specimen as line (line)}
						<span class="TypefaceSection__specimen-line">{line}</span>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.TypefaceSection {
		/* base.css's global `section { padding-left/right: var(--padding) }`
		   reset would otherwise inset this whole full-bleed section from
		   both edges (visible as a stray white margin down the left of the
		   sidebar AND the right of the panel/blocks) — this is a 100vw
		   section by design, not one of the site's inset content sections. */
		padding-left: 0;
		padding-right: 0;
		display: grid;
		grid-template-columns: 362fr 1078fr;
		grid-template-rows: 453fr 447fr;
		grid-template-areas: 'sidebar panel' 'sidebar blocks';
		height: 100vh;
		height: 100svh;
		background: #ffffff;
	}

	/* --- Sidebar (PC only) --- */
	.TypefaceSection__sidebar {
		grid-area: sidebar;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8px;
		padding-inline: clamp(24px, 3.4vw, 49px);
	}

	.TypefaceSection__name {
		font-family: var(--type-font), sans-serif;
		font-size: clamp(22px, 2.2vw, 32px);
		line-height: 1.25;
		font-weight: 400;
		color: #000000;
		margin: 0;
	}

	.TypefaceSection__tagline {
		font-family: var(--type-font), sans-serif;
		font-size: clamp(13px, 1.1vw, 16px);
		line-height: 1.25;
		font-weight: var(--fw-light);
		color: #000000;
		margin: 8px 0 0;
	}

	.TypefaceSection__meta {
		font-family: var(--type-font), sans-serif;
		font-size: clamp(11px, 0.85vw, 12px);
		line-height: 1.25;
		font-weight: var(--fw-light);
		color: #000000;
		opacity: 0.6;
		margin: 20px 0 0;
	}

	.CtaLabel {
		display: inline-block;
		transform: translateY(1.5px);
	}

	.TypefaceSection__cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 28px;
		font-family: var(--type-font), sans-serif;
		font-size: 14px;
		font-weight: var(--fw-ui);
		color: #000000;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.TypefaceSection__cta:hover {
		opacity: 0.6;
	}

	/* --- Panel: giant self-referential headline --- */
	.TypefaceSection__panel {
		grid-area: panel;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--panel-bg);
		overflow: hidden;
	}

	.TypefaceSection__headline {
		font-size: clamp(40px, 6.1vw, 88px);
		line-height: 1.25;
		color: var(--panel-fg);
		text-align: center;
		white-space: nowrap;
		margin: 0;
		padding-inline: 16px;
	}

	/* --- Blocks: two concept tiles standing in for real specimen photography --- */
	.TypefaceSection__blocks {
		grid-area: blocks;
		display: grid;
		grid-template-columns: 402fr 676fr;
	}

	.TypefaceSection__blockA,
	.TypefaceSection__blockB {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: var(--block-bg);
	}

	.TypefaceSection__video {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.TypefaceSection__glyph {
		font-size: clamp(96px, 13vw, 190px);
		line-height: 1;
		color: var(--block-fg);
	}

	.TypefaceSection__specimen {
		text-align: center;
		color: var(--block-fg);
	}

	.TypefaceSection__specimen-line {
		display: block;
		font-size: clamp(16px, 2.6vw, 30px);
		line-height: 1.3;
		/* base.css's tag-selector reset sets color directly on span, which
		   beats inheriting from the wrapping .TypefaceSection__specimen div
		   above — same gotcha as .Elio__abc-line elsewhere in this codebase. */
		color: var(--block-fg);
	}

	@media (max-width: 767.98px) {
		.TypefaceSection {
			grid-template-columns: 1fr;
			/* No footer row any more — the fixed TypefaceFooterBar overlays
			   the bottom instead, so blocks now runs the rest of the height
			   that used to belong to the footer (304+58). */
			grid-template-rows: 358fr 362fr;
			grid-template-areas: 'panel' 'blocks';
		}

		.TypefaceSection__sidebar,
		.TypefaceSection__cta {
			display: none;
		}

		.TypefaceSection__headline {
			font-size: 64px;
			line-height: 1;
			white-space: normal;
			max-width: 90%;
		}

		.TypefaceSection__blocks {
			grid-template-columns: 1fr;
		}

		/* SP shows only block A, matching Figma's own single-photo mobile
		   simplification (see file header comment). */
		.TypefaceSection__blockB {
			display: none;
		}

		.TypefaceSection__glyph {
			font-size: 140px;
		}
	}
</style>
