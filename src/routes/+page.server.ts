// The home page's own form actions. Named rather than default (matching
// CartSummary's `action="?/checkout"`, this codebase's existing precedent) so
// there is room for more than one later.
//
// Why the home page needs its own action at all: SvelteKit reads actions from
// a route's +page.server.ts and nowhere else — not from a layout, and not from
// a sibling route. Pointing the in-page form at `action="/contact"` would work
// with JS but would NAVIGATE a no-JS visitor off the home page, which defeats
// the point of an in-page Contact section.
import { handleEnquiry } from '$lib/server/contact';
import type { Actions } from './$types';

export const actions: Actions = {
	contact: async ({ request }) => handleEnquiry(request)
};
