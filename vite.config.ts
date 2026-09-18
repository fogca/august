import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			// SvelteKit hands Vite an empty `base`, and vite-plugin-pwa builds
			// both the <link rel="manifest"> href and the service-worker
			// registration URL from it — so they came out RELATIVE
			// ("manifest.webmanifest", "sw.js") and resolved against whatever
			// route was open: /fonts/manifest.webmanifest, /fonts/sw.js → 404
			// on every nested page (reported 2026-09). Pinning base/scope to
			// "/" makes both absolute; the files themselves were always at the
			// root.
			base: '/',
			scope: '/',
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			devOptions: {
				enabled: true,
				type: 'module'
			},
			manifest: {
				name: 'Ōgast',
				short_name: 'Ōgast',
				description: 'An independent type foundry from Tokyo.',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: '/',
				scope: '/',
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
				// Explicitly undefined, not omitted -- @vite-pwa/sveltekit's own
				// wrapper re-adds navigateFallback:'/' whenever this key is
				// absent from the object (checks `'navigateFallback' in
				// options.workbox`, which `undefined` satisfies but a missing
				// key doesn't). Left at its forced default, that fallback
				// registers a NavigationRoute bound to a precache entry for '/'
				// that can never exist here (this app is fully SSR'd, nothing
				// prerendered, so globPatterns -- static assets only, no .html
				// -- never puts page markup in the precache) -- and because
				// Workbox tries routes in registration order, that route would
				// claim every navigation before the NetworkFirst 'pages' rule
				// below ever got a chance to run, silently breaking offline
				// page loads outright rather than falling through to it.
				// (Confirmed live in the sibling OTIF project; avoided here
				// and in Mokuseki from the start.)
				navigateFallback: undefined,
				cleanupOutdatedCaches: true,
				runtimeCaching: [
					/* Page HTML — cache after first visit so offline browsing works
					   for the informational pages (home, fonts, about, contact, ...).
					   NetworkFirst falls back to cache when the network call fails.

					   Explicitly EXCLUDES /buy and /buy/success: /buy's action posts
					   straight to Stripe Checkout (server-recomputed pricing — a
					   stale cached page could show an old price even though the
					   actual charge is always correct), and /buy/success renders
					   one specific buyer's order (masked email, amount, licenses)
					   looked up by a one-time session_id query param — caching that
					   risks showing a stale or wrong order, not just a stale page.
					   Everything else is read-only marketing/informational content. */
					{
						urlPattern: ({ request, url }) =>
							request.mode === 'navigate' && !url.pathname.startsWith('/buy'),
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages',
							networkTimeoutSeconds: 3,
							expiration: {
								maxEntries: 50,
								// 1 day, not 7 (2026-09, at the user's request — the design
								// changes frequently and this is only ever a fallback for
								// a failed/slow network call in the first place, so
								// shortening it costs nothing on the common path and caps
								// how stale that fallback can be on the uncommon one.
								maxAgeSeconds: 60 * 60 * 24
							}
						}
					}
				]
			}
		})
	],
	// 3000 is used by the Dev/takumiisobe dev server, so August defaults to 3100.
	// host: true exposes the dev server on the LAN (test on phone via the IP).
	server: {
		port: 3100,
		host: true
	},
	preview: {
		port: 3100
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
