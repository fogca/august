// Cache countermeasures for a site whose design changes frequently (2026-09,
// at the user's request — "頻繁にデザイン変更するので、キャッシュ対策も
// しておいてほしい。ずっと同じままだとダメなので、あまり溜めないように").
//
// Two distinct problems, both load-bearing:
//
// 1. Requests for a MISSING /_app/* asset must never fall through to SSR.
//    Cloudflare Pages' own static-asset layer serves any /_app/immutable/*
//    file that actually exists straight from hosting, before this Worker
//    ever runs — so by the time a /_app/ path reaches here, the platform has
//    already established it does NOT exist (a stale chunk URL from an old
//    deploy, most often). Left alone, SvelteKit would SSR-render a normal
//    HTML page for that path, and Cloudflare stamps a one-year immutable
//    cache-control on anything matching /_app/immutable/* regardless of
//    what it actually contains — permanently caching that wrong HTML at the
//    edge under the .js URL (module MIME-type errors + a recursive
//    modulepreload cascade for every future visitor hitting that same old
//    URL). Ported verbatim from the same fix already shipped in the
//    Etcetera project (Dev/Ωclients/Etcetera/src/hooks.server.js).
//
// 2. Page documents themselves must not be cached long-term anywhere — not
//    at Cloudflare's edge, not in a visitor's browser — since a fresh
//    deploy should be visible immediately, not whenever some cache happens
//    to expire. `no-cache` (not `no-store`): a cached copy can still be
//    reused, but only after a cheap revalidation round-trip, never blindly.
//
// Also: the page theme (2026-10 Apres Guerre redesign). app.html ships
// data-theme="page" (blue on peach); the home page alone is "home" (white),
// swapped in here so the very first paint is already the right colour.
// +layout.svelte keeps the attribute in sync on client-side navigation.
import type { Handle } from '@sveltejs/kit';

const PAGE_THEME_ATTR = 'data-theme="page"';
const HOME_THEME_ATTR = 'data-theme="home"';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/_app/')) {
		return new Response('Not found', {
			status: 404,
			headers: { 'cache-control': 'no-store' }
		});
	}

	const isHome = event.url.pathname === '/';
	const response = await resolve(event, {
		transformPageChunk: isHome
			? ({ html }) => html.replace(PAGE_THEME_ATTR, HOME_THEME_ATTR)
			: undefined
	});

	if (response.headers.get('content-type')?.includes('text/html')) {
		response.headers.set('cache-control', 'no-cache');
	}

	return response;
};
