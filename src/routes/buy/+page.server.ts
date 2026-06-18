// /buy server actions — Stripe Checkout
//
// The client form only declares WHAT is being bought (license types + tiers +
// currency + educational flag). All prices are recomputed server-side from
// $lib/data/pricing so a tampered form cannot change the charge.
//
// Env: STRIPE_SECRET_KEY (see .env.example). Without it the action falls back
// to the pre-Stripe stub redirect so local dev keeps working.
import { redirect, fail } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import type { Actions } from './$types';
import {
	LICENSES,
	TYPEFACE_PRICING,
	getPrice,
	getGrossPrice,
	getTierLabel
} from '$lib/data/pricing';
import type { Currency, LicenseType } from '$lib/data/pricing';
import { computeTotal } from '$lib/data/discounts';
import type { CartItem } from '$lib/data/discounts';

const STEINER = TYPEFACE_PRICING[0].packages[0];

const SUPPORTED_CURRENCIES: Currency[] = ['EUR', 'JPY', 'USD'];

// Stripe expects minor units except for zero-decimal currencies (JPY).
function toStripeAmount(amount: number, currency: Currency): number {
	return currency === 'JPY' ? Math.round(amount) : Math.round(amount * 100);
}

export const actions: Actions = {
	checkout: async ({ request, url }) => {
		const data = await request.formData();

		// ── Parse + validate the order ─────────────────────────
		const currency = String(data.get('currency') ?? 'EUR') as Currency;
		if (!SUPPORTED_CURRENCIES.includes(currency)) {
			return fail(400, { message: 'Unsupported currency.' });
		}
		const isStudent = data.get('educational') === '1';

		const licenses = data.getAll('item_license').map(String) as LicenseType[];
		const tiers = data.getAll('item_tier').map((t) => Number(t));
		if (licenses.length === 0 || licenses.length !== tiers.length) {
			return fail(400, { message: 'No license selected.' });
		}

		// ── Recompute prices server-side ───────────────────────
		const items: CartItem[] = [];
		const lineDescriptions: string[] = [];
		for (let i = 0; i < licenses.length; i++) {
			const license = LICENSES.find((l) => l.id === licenses[i]);
			const tierIndex = tiers[i];
			if (!license || !Number.isInteger(tierIndex)) {
				return fail(400, { message: 'Invalid license selection.' });
			}
			const price = getPrice(STEINER, license, tierIndex, currency);
			const gross = getGrossPrice(STEINER, license, tierIndex, currency);
			if (price === null || gross === null) {
				// Enterprise tier — handled via /contact, not self-serve checkout
				return fail(400, { message: 'This scale requires a custom quote — please contact us.' });
			}
			items.push({
				licenseType: license.id,
				tierId: String(tierIndex),
				tierIndex,
				basePrice: price,
				grossPrice: gross,
				packageId: STEINER.id
			});
			lineDescriptions.push(`${license.label} (${getTierLabel(license, tierIndex)})`);
		}

		const { total } = computeTotal({
			currency,
			items,
			isStudent,
			packageDef: STEINER,
			packageDefs: [STEINER]
		});
		if (total <= 0) {
			return fail(400, { message: 'Invalid order total.' });
		}

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

		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			line_items: [
				{
					quantity: 1,
					price_data: {
						currency: currency.toLowerCase(),
						unit_amount: toStripeAmount(total, currency),
						product_data: {
							name: `${STEINER.label} — ${STEINER.detail}`,
							description: `Licenses: ${lineDescriptions.join(' / ')}${isStudent ? ' · Educational' : ''}`
						}
					}
				}
			],
			metadata: {
				package: STEINER.id,
				licenses: lineDescriptions.join(' / '),
				educational: isStudent ? 'yes' : 'no'
			},
			success_url: `${url.origin}/buy/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${url.origin}/buy`
		});

		if (!session.url) {
			return fail(500, { message: 'Could not start checkout. Please try again.' });
		}
		throw redirect(303, session.url);
	}
};
