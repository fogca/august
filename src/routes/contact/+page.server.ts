// /contact — the enquiry form's own route. All of the actual work (validation,
// the Resend call, the error shapes) lives in $lib/server/contact.ts, shared
// with the home page's in-page Contact section, so the two can never drift.
import { handleEnquiry } from '$lib/server/contact';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => handleEnquiry(request)
};
