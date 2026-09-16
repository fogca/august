// Matter.js loader — same shape as scroll.ts's initScroll(): one idempotent
// promise latch so a second mount (or Vite HMR) reuses the in-flight import
// instead of pulling the chunk twice.
//
// Dynamic import rather than a top-level one: matter-js is only needed by the
// home page's Custom section, and this site is fully SSR'd (adapter-cloudflare),
// where a module that touches `window` at eval time would break the render.

import { browser } from '$app/environment';

type MatterNS = typeof import('matter-js');

let ready: Promise<MatterNS> | null = null;

/** Load Matter.js. Resolves to the module namespace; rejects on the server. */
export function loadMatter(): Promise<MatterNS> {
	if (!browser) return Promise.reject(new Error('matter-js is browser-only'));
	if (ready) return ready;

	ready = import('matter-js').then((mod) => {
		// matter-js ships UMD; depending on how Vite interops it the namespace
		// can arrive either flat or under `.default`. Take whichever actually
		// carries the Engine constructor rather than assuming.
		const ns = mod as unknown as { default?: MatterNS } & MatterNS;
		return ns.Engine ? ns : (ns.default as MatterNS);
	});

	return ready;
}
