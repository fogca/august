// /buy server actions — Stripe Checkout
//
// The client form only declares WHAT is being bought (license kind + tier +
// educational flag). All prices are recomputed server-side from
// $lib/data/pricing so a tampered form cannot change the charge.
//
// Env: STRIPE_SECRET_KEY (see .env.example). Without it the action falls back
// to the pre-Stripe stub redirect so local dev keeps working.
import { redirect, fail } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import type { Actions, PageServerLoad } from './$types';
import { buildOrder, orderProductName, orderStylesSummary } from '$lib/server/checkout-order';
import { getTierLabel } from '$lib/data/pricing';
import {
	checkoutFeatureParams,
	isCheckoutOpen,
	priceTaxBehavior
} from '$lib/server/stripe-options';

// EUR only — Stripe expects minor units (cents).
function toStripeAmount(amount: number): number {
	return Math.round(amount * 100);
}

// Closed until a Stripe key is configured (see isCheckoutOpen): the page then
// shows COMING SOON rather than a flow that could only end in a 503 at checkout.
export const load: PageServerLoad = () => ({
	checkoutOpen: isCheckoutOpen(env, dev)
});

export const actions: Actions = {
	checkout: async ({ request, url }) => {
		// ── Parse, validate and price the order (server-side) ──
		const built = buildOrder(await request.formData());
		if (!built.ok) return fail(built.status, { message: built.message });
		const { order } = built;

		// ── Stripe Checkout Session ────────────────────────────
		const secretKey = env.STRIPE_SECRET_KEY;
		if (!secretKey) {
			// In production a missing key must NEVER fall through to a free
			// "success" — that would mark orders paid without charging. Only the
			// local dev stub is allowed to skip Stripe.
			if (!dev) {
				console.error('STRIPE_SECRET_KEY missing in production — refusing checkout.');
				return fail(503, { message: 'Checkout is temporarily unavailable. Please try again later.' });
			}
			console.warn('STRIPE_SECRET_KEY not set — dev stub, redirecting to success.');
			throw redirect(303, '/buy/success');
		}

		// createFetchHttpClient keeps the SDK compatible with Cloudflare Workers
		const stripe = new Stripe(secretKey, {
			httpClient: Stripe.createFetchHttpClient()
		});

		// Stripe caps metadata values at 500 chars — truncate defensively.
		const licensesSummary = order.descriptions.join(' / ').slice(0, 490);

		let session: Stripe.Checkout.Session;
		try {
			session = await stripe.checkout.sessions.create({
				mode: 'payment',
				line_items: [
					{
						quantity: 1,
						price_data: {
							currency: 'eur',
							unit_amount: toStripeAmount(order.total),
							...priceTaxBehavior(env),
							product_data: {
								name: orderProductName(order),
								description:
									`Licenses: ${licensesSummary}${order.isStudent ? ' · Educational' : ''}`.slice(0, 900)
							}
						}
					}
				],
				metadata: {
					package: order.lines.map((l) => l.pkg.id).join(','),
					licenses: licensesSummary,
					educational: order.isStudent ? 'yes' : 'no',
					licensee_name: order.licenseeName,
					client_name: order.clientName,
					organisation_size:
						order.tierIndex && order.tierIndex > 1 ? getTierLabel(order.tierIndex) : '',
					// What to actually deliver — the Sales Receipt's fulfilment record,
					// not just a headcount tier, now that style count drives price.
					selected_styles: orderStylesSummary(order).slice(0, 490)
				},
				success_url: `${url.origin}/buy/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${url.origin}/buy`,
				// Stripe Tax / invoices — each behind an env flag, see stripe-options.ts
				...checkoutFeatureParams(env)
			});
		} catch (err) {
			// Fails safe: no session, no charge. Keep the buyer on /buy with a message
			// instead of an unhandled 500.
			console.error('Stripe checkout session creation failed:', err);
			return fail(502, {
				message: 'Could not start checkout. Please try again in a moment — your selection is kept.'
			});
		}

		if (!session.url) {
			return fail(500, { message: 'Could not start checkout. Please try again.' });
		}
		throw redirect(303, session.url);
	}
};
