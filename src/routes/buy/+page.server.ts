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
import type { Actions } from './$types';
import {
	TYPEFACE_PRICING,
	getPrice,
	getGrossPrice,
	getTierName,
	getTierLabel,
	PROJECT_LICENSE_EUR,
	PROJECT_LICENSE_LABEL
} from '$lib/data/pricing';
import { computeTotal } from '$lib/data/discounts';
import type { CartItem, CartItemKind } from '$lib/data/discounts';

const STEINER = TYPEFACE_PRICING[0].packages[0];

// EUR only — Stripe expects minor units (cents).
function toStripeAmount(amount: number): number {
	return Math.round(amount * 100);
}

export const actions: Actions = {
	checkout: async ({ request, url }) => {
		const data = await request.formData();

		// ── Parse + validate the order ─────────────────────────
		const isStudent = data.get('educational') === '1';
		const licenseeName = String(data.get('licensee_name') ?? '').trim().slice(0, 200);
		// Project License isn't reachable from the current /buy intake form
		// (see LicenseIntake) — kept here so the server still handles it
		// correctly if that path is reintroduced.
		const clientName = String(data.get('client_name') ?? '').trim().slice(0, 200);

		const kinds = data.getAll('item_kind').map(String) as CartItemKind[];
		const tiersRaw = data.getAll('item_tier').map(String);
		if (kinds.length === 0) {
			return fail(400, { message: 'No license selected.' });
		}

		// Selected styles — required for a 'tier' item, since price is now
		// per-style × how many were picked (see $lib/data/pricing's
		// computeEur). Validate against the real style list so a tampered
		// form can't invent styles or inflate/deflate the count.
		const selectedStyles = data.getAll('selected_style').map(String);
		const validStyles = new Set(STEINER.styles ?? []);
		const styleCount = selectedStyles.filter((s) => validStyles.has(s)).length;
		if (styleCount !== selectedStyles.length) {
			return fail(400, { message: 'Invalid style selection.' });
		}

		// ── Recompute prices server-side ───────────────────────
		const items: CartItem[] = [];
		const lineDescriptions: string[] = [];
		for (let i = 0; i < kinds.length; i++) {
			const kind = kinds[i];
			if (kind !== 'tier' && kind !== 'project') {
				return fail(400, { message: 'Invalid license selection.' });
			}

			if (kind === 'project') {
				// Project License needs both the purchasing studio/agency and the
				// named client Brand on record — the Sales Receipt's Purchaser/Brand.
				if (!licenseeName || !clientName) {
					return fail(400, { message: 'A Project License needs your studio name and a client name.' });
				}
				items.push({
					kind: 'project',
					tierIndex: null,
					basePrice: PROJECT_LICENSE_EUR,
					grossPrice: PROJECT_LICENSE_EUR,
					packageId: STEINER.id
				});
				lineDescriptions.push(`${PROJECT_LICENSE_LABEL} — ${licenseeName} for ${clientName}`);
				continue;
			}

			const tierIndex = Number(tiersRaw[i]);
			if (!Number.isInteger(tierIndex)) {
				return fail(400, { message: 'Invalid license selection.' });
			}
			if (styleCount < 1) {
				return fail(400, { message: 'Please select at least one style in Step 3.' });
			}

			// Tier 1 (Individual, not currently offered by the intake form —
			// see LicenseIntake) needs no organisation name. Every other tier
			// came from a fixed-range select, not a freely typed number, so
			// there's no separate headcount to cross-check — just require the
			// organisation is named.
			if (tierIndex > 1 && !licenseeName) {
				return fail(400, { message: 'Please fill in your organisation name in Step 1.' });
			}

			const price = getPrice(STEINER, tierIndex, styleCount);
			const gross = getGrossPrice(STEINER, tierIndex, styleCount);
			if (price === null || gross === null) {
				// Global tier — handled via /contact, not self-serve checkout
				return fail(400, { message: 'This scale requires a custom quote — please contact us.' });
			}
			items.push({
				kind: 'tier',
				tierIndex,
				basePrice: price,
				grossPrice: gross,
				packageId: STEINER.id
			});
			lineDescriptions.push(
				`${getTierName(tierIndex)} (${getTierLabel(tierIndex)}) — ${styleCount} style${styleCount === 1 ? '' : 's'}${licenseeName ? ` — ${licenseeName}` : ''}`
			);
		}

		const { total } = computeTotal({
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

		// Stripe caps metadata values at 500 chars — truncate defensively.
		const licensesSummary = lineDescriptions.join(' / ').slice(0, 490);

		let session: Stripe.Checkout.Session;
		try {
			session = await stripe.checkout.sessions.create({
				mode: 'payment',
				line_items: [
					{
						quantity: 1,
						price_data: {
							currency: 'eur',
							unit_amount: toStripeAmount(total),
							product_data: {
								name: `${STEINER.label} — ${STEINER.detail}`,
								description:
									`Licenses: ${licensesSummary}${isStudent ? ' · Educational' : ''}`.slice(0, 900)
							}
						}
					}
				],
				metadata: {
					package: STEINER.id,
					licenses: licensesSummary,
					educational: isStudent ? 'yes' : 'no',
					licensee_name: licenseeName,
					client_name: clientName,
					organisation_size:
						items[0]?.kind === 'tier' && items[0].tierIndex && items[0].tierIndex > 1
							? getTierLabel(items[0].tierIndex)
							: '',
					// What to actually deliver — the Sales Receipt's fulfilment record,
					// not just a headcount tier, now that style count drives price.
					selected_styles: selectedStyles.join(',').slice(0, 490)
				},
				success_url: `${url.origin}/buy/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${url.origin}/buy`
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
