// /buy/success — verifies the Stripe Checkout session before confirming anything.
//
// Without this, anyone could open /buy/success directly and read a false
// "Order Received". We retrieve the session server-side, require it to be paid,
// and pass the order details (reference, email, licenses) to the page.
// The local dev stub (no STRIPE_SECRET_KEY) renders the page without an order.
import { redirect } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import type { PageServerLoad } from './$types';

export interface SuccessOrder {
	reference: string;
	email: string | null;
	amount: number; // major units in `currency`
	currency: string;
	licenses: string | null;
	educational: boolean;
}

export const load: PageServerLoad = async ({ url }) => {
	const sessionId = url.searchParams.get('session_id');
	const secretKey = env.STRIPE_SECRET_KEY;

	// Dev stub checkout redirects here without a session — render the generic page.
	if (!sessionId || !secretKey) {
		if (dev) return { order: null };
		throw redirect(303, '/buy');
	}

	let session: Stripe.Checkout.Session;
	try {
		const stripe = new Stripe(secretKey, { httpClient: Stripe.createFetchHttpClient() });
		session = await stripe.checkout.sessions.retrieve(sessionId);
	} catch (err) {
		console.error('Could not retrieve checkout session:', err);
		throw redirect(303, '/buy');
	}

	// Only confirm orders Stripe says are settled. Every session this app creates
	// is mode:'payment' with a positive total, so require exactly that.
	if (session.mode !== 'payment' || session.payment_status !== 'paid') {
		throw redirect(303, '/buy');
	}

	const currency = (session.currency ?? 'eur').toUpperCase();
	const raw = session.amount_total ?? 0;
	// Stripe amounts are minor units except zero-decimal currencies (JPY).
	const amount = currency === 'JPY' ? raw : raw / 100;

	// The payment intent id (pi_…) is directly searchable in the Stripe dashboard,
	// so it makes the best support-quotable reference. Session-id tail as fallback.
	const pi = session.payment_intent;
	const reference =
		typeof pi === 'string' ? pi : (pi?.id ?? session.id.slice(-10));

	const order: SuccessOrder = {
		reference,
		// The success URL is a bearer link — mask the local part so a forwarded
		// link doesn't expose the full address.
		email: maskEmail(session.customer_details?.email ?? null),
		amount,
		currency,
		licenses: session.metadata?.licenses ?? null,
		educational: session.metadata?.educational === 'yes'
	};

	return { order };
};

// t•••@example.com — recognizable to the owner, useless to a stranger.
function maskEmail(email: string | null): string | null {
	if (!email) return null;
	const at = email.indexOf('@');
	if (at <= 0) return email;
	return `${email[0]}•••${email.slice(at)}`;
}
