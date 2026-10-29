import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Stripe from 'stripe';
import { handleStripeWebhook, type WebhookEnv } from './stripe-webhook';

const WEBHOOK_SECRET = 'whsec_test_secret';
const ENV: WebhookEnv = {
	STRIPE_SECRET_KEY: 'sk_test_dummy',
	STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
	RESEND_API_KEY: 're_dummy'
};

function checkoutEvent(type: string, sessionOverrides: Record<string, unknown> = {}): string {
	return JSON.stringify({
		id: 'evt_1',
		object: 'event',
		type,
		data: {
			object: {
				id: 'cs_test_1',
				object: 'checkout.session',
				livemode: false,
				payment_status: 'paid',
				currency: 'eur',
				amount_total: 56000,
				payment_intent: 'pi_1',
				customer_details: { email: 'buyer@example.com' },
				metadata: { licensee_name: 'Studio X' },
				...sessionOverrides
			}
		}
	});
}

/** A request signed exactly the way Stripe signs it. */
async function signedRequest(payload: string, secret = WEBHOOK_SECRET): Promise<Request> {
	const header = await new Stripe('sk_test_dummy').webhooks.generateTestHeaderStringAsync({
		payload,
		secret,
		cryptoProvider: Stripe.createSubtleCryptoProvider()
	});
	return new Request('https://example.com/api/stripe/webhook', {
		method: 'POST',
		headers: { 'stripe-signature': header },
		body: payload
	});
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
	vi.stubGlobal('fetch', fetchMock);
	// The handler logs its failures on purpose; keep the test output readable.
	vi.spyOn(console, 'error').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('handleStripeWebhook', () => {
	it('emails the owner once for a verified, paid checkout.session.completed', async () => {
		const res = await handleStripeWebhook(
			await signedRequest(checkoutEvent('checkout.session.completed')),
			ENV,
			{ dev: false }
		);

		expect(res.status).toBe(200);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe('https://api.resend.com/emails');
		expect(init.headers.Authorization).toBe('Bearer re_dummy');
		const sent = JSON.parse(init.body);
		expect(sent.to).toEqual(['hi@august.tf']);
		expect(sent.subject).toContain('Studio X');
	});

	it('also notifies when a delayed payment method finally succeeds', async () => {
		const res = await handleStripeWebhook(
			await signedRequest(checkoutEvent('checkout.session.async_payment_succeeded')),
			ENV,
			{ dev: false }
		);
		expect(res.status).toBe(200);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('does not notify while a delayed payment is still unpaid', async () => {
		const res = await handleStripeWebhook(
			await signedRequest(
				checkoutEvent('checkout.session.completed', { payment_status: 'unpaid' })
			),
			ENV,
			{ dev: false }
		);
		expect(res.status).toBe(200);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('acknowledges and ignores unrelated event types', async () => {
		const res = await handleStripeWebhook(
			await signedRequest(checkoutEvent('charge.refunded')),
			ENV,
			{ dev: false }
		);
		expect(res.status).toBe(200);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects a request signed with the wrong secret', async () => {
		const res = await handleStripeWebhook(
			await signedRequest(checkoutEvent('checkout.session.completed'), 'whsec_someone_else'),
			ENV,
			{ dev: false }
		);
		expect(res.status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects a payload that was altered after signing', async () => {
		const original = checkoutEvent('checkout.session.completed');
		const signed = await signedRequest(original);
		const tampered = new Request(signed.url, {
			method: 'POST',
			headers: signed.headers,
			body: original.replace('56000', '1')
		});
		const res = await handleStripeWebhook(tampered, ENV, { dev: false });
		expect(res.status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('rejects a request with no signature header', async () => {
		const res = await handleStripeWebhook(
			new Request('https://example.com/api/stripe/webhook', {
				method: 'POST',
				body: checkoutEvent('checkout.session.completed')
			}),
			ENV,
			{ dev: false }
		);
		expect(res.status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('fails loudly (503) when the webhook secret is not configured', async () => {
		const res = await handleStripeWebhook(
			await signedRequest(checkoutEvent('checkout.session.completed')),
			{ ...ENV, STRIPE_WEBHOOK_SECRET: undefined },
			{ dev: false }
		);
		expect(res.status).toBe(503);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('returns 500 so Stripe retries when the email cannot be sent', async () => {
		fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));
		const res = await handleStripeWebhook(
			await signedRequest(checkoutEvent('checkout.session.completed')),
			ENV,
			{ dev: false }
		);
		expect(res.status).toBe(500);
	});

	it('returns 500 in production when RESEND_API_KEY is missing', async () => {
		const res = await handleStripeWebhook(
			await signedRequest(checkoutEvent('checkout.session.completed')),
			{ ...ENV, RESEND_API_KEY: undefined },
			{ dev: false }
		);
		expect(res.status).toBe(500);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('only logs the notice in dev when RESEND_API_KEY is missing', async () => {
		const res = await handleStripeWebhook(
			await signedRequest(checkoutEvent('checkout.session.completed')),
			{ ...ENV, RESEND_API_KEY: undefined },
			{ dev: true }
		);
		expect(res.status).toBe(200);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
