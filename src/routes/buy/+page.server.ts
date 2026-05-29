// /buy server actions
// Phase 4 (Stripe): replace the stub below with real Checkout Session creation.
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	checkout: async ({ request }) => {
		const data = await request.formData();

		// TODO Phase 4 — create Stripe Checkout Session here
		// const session = await stripe.checkout.sessions.create({ ... });
		// throw redirect(303, session.url);

		console.log('Cart submitted (stub):', Object.fromEntries(data));
		throw redirect(303, '/buy/success');
	}
};
