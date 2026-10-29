// POST /api/stripe/webhook — Stripe calls this; see $lib/server/stripe-webhook.ts.
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { handleStripeWebhook } from '$lib/server/stripe-webhook';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ request }) => handleStripeWebhook(request, env, { dev });
