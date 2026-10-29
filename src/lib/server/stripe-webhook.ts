// Stripe webhook handler: verifies the signature, then emails the owner a
// "new order" notice for every settled Checkout payment.
//
// Why a webhook at all: /buy/success only runs if the buyer's browser comes
// back. A closed tab, a lost connection or a delayed payment method would
// leave a paid order with no trace on our side. The webhook is Stripe calling
// us, so it fires regardless of what the buyer's browser does.
//
// Kept free of `$env` / `$app` imports (env is passed in) so it unit-tests in
// plain node. The route file is the thin SvelteKit wrapper.
//
// Dashboard setup: Developers → Webhooks → endpoint `<origin>/api/stripe/webhook`
// listening to `checkout.session.completed` and
// `checkout.session.async_payment_succeeded`; copy its signing secret into
// STRIPE_WEBHOOK_SECRET (see .env.example).
import Stripe from 'stripe';
import { buildOrderNotice } from './order-notice';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TO_ADDRESS = 'hi@august.tf';
const FROM_ADDRESS = 'Apres Guerre orders <hi@august.tf>';

/** Reads STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and RESEND_API_KEY. Typed as a
 *  plain env record so SvelteKit's `$env/dynamic/private` object can be passed as-is. */
export type WebhookEnv = Record<string, string | undefined>;

function reply(status: number, body: string): Response {
	return new Response(body, { status, headers: { 'content-type': 'text/plain' } });
}

/** True when the notice was delivered (or, in dev only, logged instead). */
async function sendOwnerNotice(
	session: Stripe.Checkout.Session,
	env: WebhookEnv,
	dev: boolean
): Promise<boolean> {
	const notice = buildOrderNotice(session);

	const apiKey = env.RESEND_API_KEY;
	if (!apiKey) {
		if (dev) {
			console.warn(
				'[stripe-webhook] RESEND_API_KEY not set — logging instead of sending (dev only).'
			);
			console.warn(`${notice.subject}\n${notice.text}`);
			return true;
		}
		console.error('[stripe-webhook] RESEND_API_KEY missing — cannot send the order notice.');
		return false;
	}

	try {
		const res = await fetch(RESEND_ENDPOINT, {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				from: FROM_ADDRESS,
				to: [TO_ADDRESS],
				subject: notice.subject,
				text: notice.text
			})
		});
		if (!res.ok) {
			console.error(
				'[stripe-webhook] Resend API error',
				res.status,
				await res.text().catch(() => '')
			);
			return false;
		}
		return true;
	} catch (err) {
		console.error('[stripe-webhook] Resend request failed', err);
		return false;
	}
}

export async function handleStripeWebhook(
	request: Request,
	env: WebhookEnv,
	options: { dev: boolean }
): Promise<Response> {
	const secretKey = env.STRIPE_SECRET_KEY;
	const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
	if (!secretKey || !webhookSecret) {
		// 5xx (not 2xx): a misconfigured endpoint must show up as failing deliveries
		// in the Stripe dashboard rather than silently swallowing events.
		console.error('[stripe-webhook] STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET not configured.');
		return reply(503, 'Webhook not configured');
	}

	const signature = request.headers.get('stripe-signature');
	if (!signature) return reply(400, 'Missing signature');

	// The signature covers the exact bytes Stripe sent, so read the raw text and
	// never parse it before verifying.
	const payload = await request.text();

	let event: Stripe.Event;
	try {
		const stripe = new Stripe(secretKey, { httpClient: Stripe.createFetchHttpClient() });
		// Workers have no Node crypto; the async + SubtleCrypto path works there and in Node.
		event = await stripe.webhooks.constructEventAsync(
			payload,
			signature,
			webhookSecret,
			undefined,
			Stripe.createSubtleCryptoProvider()
		);
	} catch (err) {
		console.warn('[stripe-webhook] Signature verification failed:', err);
		return reply(400, 'Invalid signature');
	}

	if (
		event.type === 'checkout.session.completed' ||
		event.type === 'checkout.session.async_payment_succeeded'
	) {
		const session = event.data.object;
		// A delayed payment method completes the session before the money arrives;
		// the later async_payment_succeeded event is the one that means "paid".
		if (session.payment_status === 'paid') {
			const sent = await sendOwnerNotice(session, env, options.dev);
			// A non-2xx makes Stripe retry later, so a temporary Resend outage
			// doesn't lose the notice.
			if (!sent) return reply(500, 'Notice not sent');
		}
	}

	// Every other event type is acknowledged and ignored (no retries wanted).
	return reply(200, 'ok');
}
