import type { Action } from 'svelte/action';
import { getScrollTrigger } from '$lib/scroll';

export interface MaskRevealOptions {
	/** When false the action is inert. */
	enabled?: boolean;
	/** Reveal runway per transition, as a multiple of viewport height (default 1). */
	distance?: number;
	/** Leaving layer's accent scale at full reveal (default 1.06, origin bottom). */
	scale?: number;
	/** Show GSAP ScrollTrigger start/end markers for debugging. */
	markers?: boolean;
}

// v2 "reveal" — all layers stay STATIC. Layers are stacked (first on top), and
// as you scroll each layer except the last is masked away from the bottom up
// via clip-path while scaling up slightly from its bottom edge (the accent),
// uncovering the already-in-place layer beneath. Chains any number of layers:
// 2 layers = one reveal, 3 = two reveals, etc.
//
// Markup — apply to a wrapper holding ordered, full-bleed layers (reveal order
// = DOM order; first shown is listed first):
//   <section use:maskReveal>
//     <div data-layer>shown first — clips away first</div>
//     <div data-layer>revealed, then clips (if more follow)</div>
//     <div data-layer>final — never clips</div>
//   </section>
//
// Mechanics: the wrapper is pinned (pinSpacing:true adds the runway) so every
// layer holds still in the viewport while a scrubbed timeline drives each
// leaving layer's clip-path inset (bottom 0→100%) and scale.
//
// Fallback: CSS keeps the layers in normal flow (relative, stacked). Only when
// the effect is active does this action overlap them (absolute) — so reduced
// motion and no-JS render every layer as a plain scrollable section.
export const maskReveal: Action<HTMLElement, MaskRevealOptions | undefined> = (
	node,
	options
) => {
	type Killable = { kill: (revert?: boolean) => void };
	let st: Killable | null = null;
	let restore: (() => void) | null = null;
	let disposed = false;

	async function build(opts: MaskRevealOptions | undefined) {
		if ((opts?.enabled ?? true) === false) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		// Phones: skip the pinned clip-path reveal entirely. The pin spacer is a
		// fixed pixel height while the layers are sized in dvh, so the mobile URL
		// bar showing/hiding desyncs them and leaves a white band below the
		// section. The CSS fallback (layers stacked in normal flow) scrolls
		// cleanly on mobile — dvh works fine when nothing is pinned.
		if (window.matchMedia('(max-width: 767.98px)').matches) return;

		const layers = Array.from(node.querySelectorAll<HTMLElement>('[data-layer]'));
		if (layers.length < 2) return;

		// Shared gsap instance, registered and wired to Lenis before any trigger
		// is created (see $lib/scroll.ts).
		const { gsap } = await getScrollTrigger();
		if (disposed) return;

		const n = layers.length;
		const segments = n - 1;
		const distance = opts?.distance ?? 1;
		const scale = opts?.scale ?? 1.06;

		// Switch from flow fallback to overlapped layers. The wrapper holds one
		// screen; each layer is full-bleed; first listed paints on top.
		// Use dvh so the wrapper respects the mobile address bar — otherwise
		// content pushed to the bottom (e.g. margin-top: auto) gets clipped behind it.
		const wrapperHeight = node.style.height;
		node.style.height = CSS.supports('height', '100dvh') ? '100dvh' : '100vh';
		const layerStyles = layers.map((el) => ({
			position: el.style.position,
			inset: el.style.inset,
			zIndex: el.style.zIndex
		}));
		layers.forEach((el, i) => {
			el.style.position = 'absolute';
			el.style.inset = '0';
			el.style.zIndex = String(n - i);
		});
		restore = () => {
			node.style.height = wrapperHeight;
			layers.forEach((el, i) => {
				el.style.position = layerStyles[i].position;
				el.style.inset = layerStyles[i].inset;
				el.style.zIndex = layerStyles[i].zIndex;
			});
		};

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: node,
				start: 'top top',
				end: () => '+=' + window.innerHeight * distance * segments,
				scrub: true,
				pin: true,
				pinSpacing: true,
				invalidateOnRefresh: true,
				markers: opts?.markers ?? false
			}
		});

		// Every layer but the last clips away during its own segment.
		layers.slice(0, segments).forEach((el, k) => {
			gsap.set(el, { transformOrigin: '50% 100%', willChange: 'clip-path, transform' });
			tl.fromTo(
				el,
				{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
				{ clipPath: 'inset(0% 0% 100% 0%)', scale, ease: 'none', duration: 1 },
				k // segment k → scroll window [k, k+1] viewports
			);
		});

		st = {
			kill: (revert) => {
				tl.scrollTrigger?.kill(revert);
				tl.kill();
			}
		};
	}

	build(options);

	return {
		update(next: MaskRevealOptions | undefined) {
			st?.kill(true);
			restore?.();
			st = null;
			restore = null;
			build(next);
		},
		destroy() {
			disposed = true;
			st?.kill(true);
			restore?.();
		}
	};
};
