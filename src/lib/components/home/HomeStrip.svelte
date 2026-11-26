<!-- The home page's first screen and, on PC, the row of typeface thumbnails
     along its foot (2026-11-27, at the user's request — "OP終わったら画面下30vh
     くらいの高さで50vw widthくらいで横にどんどん入れていってほしい。そこまでは
     縦にスクロール動作で横スクロールになるように"). Each thumbnail is half the
     screen wide and 30vh tall; they come in from the right one after another as
     the opening ends.

     Scrolling down then moves the row sideways, one px for one px: the section
     is a tall track with the screen pinned (sticky) inside it, as the Custom
     section's zoom is, and its extra height is exactly how far the row has to
     travel. When the last thumbnail is fully in, the page goes on downwards.

     Without a script, or under reduced motion, nothing is pinned and the row
     scrolls sideways itself. Phones have no row.

     A typeface without a thumbnail image yet shows a stand-in: its home
     panel's ground with the name set in the face. -->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { HomePanel } from '$lib/data/typefaces';
	import { getLenis, onScroll } from '$lib/scroll';
	import { homeIntro } from '$lib/state/homeIntro.svelte';

	interface Props {
		panels: HomePanel[];
		/** The opening was skipped: the row stands in place, with no entrance. */
		skipped?: boolean;
		/** What else is on the first screen, above the row. */
		children: Snippet;
	}

	let { panels, skipped = false, children }: Props = $props();

	/** Where the row is pinned and driven by the page's scroll. The width is the
	 *  one the styles below show the row from. */
	const PIN_QUERY = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';

	let trackEl: HTMLElement | undefined = $state();
	let stageEl: HTMLElement | undefined = $state();
	let rowEl: HTMLElement | undefined = $state();
	let pinned = $state(false);
	/** How far the row has to move to bring its last thumbnail fully in, px. */
	let travel = $state(0);
	/** How far it has moved, px. */
	let offset = $state(0);

	function update() {
		if (!pinned || !trackEl) return;
		offset = Math.min(travel, Math.max(0, -trackEl.getBoundingClientRect().top));
	}

	function measure() {
		if (!stageEl || !rowEl) return;
		// The layout width: scrollWidth would also count the thumbnails still on
		// their way in from the right.
		travel = pinned ? Math.max(0, rowEl.offsetWidth - stageEl.clientWidth) : 0;
		if (!pinned) offset = 0;
	}

	// The track's height follows `travel`, so the position is read again once
	// that is on the page. The Header waits out the same distance.
	$effect(() => {
		homeIntro.holdScroll = travel;
		update();
		return () => (homeIntro.holdScroll = 0);
	});

	/** A thumbnail reached by keyboard may be off to the side: scroll the page
	 *  to where the row has brought it to the middle. */
	function reveal(event: FocusEvent) {
		const link = event.currentTarget as HTMLElement;
		const item = link.parentElement;
		if (!pinned || !trackEl || !stageEl || !item || !link.matches(':focus-visible')) return;
		const middle = item.offsetLeft + item.offsetWidth / 2 - stageEl.clientWidth / 2;
		const top =
			window.scrollY + trackEl.getBoundingClientRect().top + Math.min(travel, Math.max(0, middle));
		const lenis = getLenis();
		// force: Lenis ignores scrollTo while it is stopped (just after an
		// in-app navigation, or during the opening).
		if (lenis) lenis.scrollTo(top, { force: true });
		else window.scrollTo({ top });
	}

	onMount(() => {
		const query = window.matchMedia(PIN_QUERY);
		const apply = () => {
			pinned = query.matches;
			// The row's own sideways scroll, if it was used before pinning.
			rowEl?.parentElement?.scrollTo({ left: 0 });
			requestAnimationFrame(measure);
		};
		apply();
		query.addEventListener('change', apply);
		const off = onScroll(update);
		// A frame later: measuring inside the observer's own callback changes
		// layout there, which WebKit reports as an observer loop.
		const resized = new ResizeObserver(() => requestAnimationFrame(measure));
		if (stageEl) resized.observe(stageEl);
		return () => {
			query.removeEventListener('change', apply);
			resized.disconnect();
			off();
		};
	});
</script>

<section
	class="HomeScreen"
	class:is-pinned={pinned}
	class:is-skipped={skipped}
	style:--travel="{travel}px"
	bind:this={trackEl}
>
	<div class="HomeScreen__stage" bind:this={stageEl}>
		{@render children()}

		<div class="Strip">
			<ul class="Strip__row" bind:this={rowEl} style:transform="translate3d({-offset}px, 0, 0)">
				{#each panels as panel, i (panel.key)}
					<li class="Strip__item" style:--i={i}>
						<svelte:element
							this={panel.href ? 'a' : 'div'}
							class="Strip__link"
							href={panel.href}
							aria-label="{panel.name}, {panel.meta.join(', ')}"
							style="--panel-bg: {panel.bg}; --panel-fg: {panel.fg}; --panel-font: '{panel.fontFamily}'; --panel-weight: {panel.weight};"
							onfocus={reveal}
						>
							{#if panel.thumb}
								<img class="Strip__image" src={panel.thumb} alt="" loading="lazy" />
							{:else}
								<span class="Strip__name" aria-hidden="true">{panel.lines.join(' ')}</span>
							{/if}
						</svelte:element>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.HomeScreen {
		/* No row on phones, so nothing to keep clear of. */
		--strip-h: 0px;
		position: relative;
		padding: 0;
	}

	/* One screen. The large viewport, so what follows never peeks in when a
	   phone's URL bar folds away. */
	.HomeScreen__stage {
		position: relative;
		height: 100vh;
		height: 100lvh;
	}

	.Strip {
		display: none;
	}

	@media (min-width: 768px) {
		.HomeScreen {
			--strip-h: 30vh;
		}

		/* Without the pin, the row scrolls sideways by itself. */
		.Strip {
			display: block;
			position: absolute;
			left: 0;
			bottom: 0;
			width: 100%;
			height: var(--strip-h);
			overflow-x: auto;
			overflow-y: hidden;
		}

		/* The track: one screen for the pinned stage plus the row's travel. No
		   clipping here — a clipping ancestor is what breaks position:sticky. */
		.HomeScreen.is-pinned {
			height: calc(100vh + var(--travel));
			height: calc(100lvh + var(--travel));
		}

		.is-pinned .HomeScreen__stage {
			position: sticky;
			top: 0;
		}

		/* clip, not hidden: focusing a thumbnail must not scroll this box. */
		.is-pinned .Strip {
			overflow: clip;
		}
	}

	.Strip__row {
		display: flex;
		width: max-content;
		height: 100%;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.Strip__item {
		flex: none;
		width: 50vw;
		height: 100%;
		/* After the opening's letters have landed (--lead-at, set by HomeTop),
		   one after another from the right. */
		animation: strip-in 1.2s cubic-bezier(0.16, 1, 0.3, 1)
			calc(var(--lead-at, 0s) + var(--i) * 0.12s) backwards;
	}

	@keyframes strip-in {
		from {
			transform: translateX(100vw);
		}
	}

	.is-skipped .Strip__item {
		animation: none;
	}

	/* The ground is a plain CSS background, which is what the Header samples to
	   pick its own colour. */
	.Strip__link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--panel-bg);
		text-decoration: none;
	}

	.Strip__link:focus-visible {
		outline: 2px solid var(--panel-fg);
		outline-offset: -6px;
	}

	.Strip__image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* base.css sets font-family and color straight on every span, so both are
	   set here rather than inherited. */
	.Strip__name {
		font-family: var(--panel-font), var(--font-norma), sans-serif;
		font-size: min(7vw, 12vh);
		font-weight: var(--panel-weight);
		font-variation-settings: 'wght' var(--panel-weight);
		line-height: 1;
		white-space: nowrap;
		color: var(--panel-fg);
	}

	@media (prefers-reduced-motion: reduce) {
		.Strip__item {
			animation: none;
		}
	}
</style>
