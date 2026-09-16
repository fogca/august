// /contact — sends the enquiry form via Resend's HTTP API (a plain fetch,
// not their SDK: Resend's own Node SDK isn't needed for one call, and
// avoiding it keeps this out of the way of Cloudflare's Workers runtime,
// which adapter-cloudflare deploys onto and which doesn't support every
// Node API a heavier SDK might assume).
//
// Same pattern as /buy's own Stripe action (see that file's own header
// comment): the real secret lives in RESEND_API_KEY (see .env.example for
// what it needs — a Resend account + august.tf verified as a sending
// domain there). Without it, local dev logs the message to the console
// instead of sending it, so the form is still exercisable without the key;
// production instead fails the action clearly rather than pretending to
// have sent something it didn't.
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import type { Actions } from './$types';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TO_ADDRESS = 'hi@august.tf';
const FROM_ADDRESS = 'Ōgast website <hi@august.tf>';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormFields {
	name: string;
	email: string;
	reason: string;
	message: string;
}

function readFields(data: FormData): FormFields {
	return {
		name: String(data.get('name') ?? '')
			.trim()
			.slice(0, 200),
		email: String(data.get('email') ?? '')
			.trim()
			.slice(0, 200),
		reason: String(data.get('reason') ?? '')
			.trim()
			.slice(0, 120),
		message: String(data.get('message') ?? '')
			.trim()
			.slice(0, 5000)
	};
}

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const fields = readFields(data);
		const { name, email, reason, message } = fields;

		if (!name || !email || !message) {
			return fail(400, { ...fields, error: 'missing' as const });
		}
		// A shape check, not a full RFC 5322 validator — just enough to catch
		// an obviously mistyped address before attempting to send anything.
		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, { ...fields, error: 'invalid_email' as const });
		}

		const apiKey = env.RESEND_API_KEY;
		if (!apiKey) {
			if (dev) {
				console.warn(
					'[contact] RESEND_API_KEY not set — logging instead of sending (dev only).',
					fields
				);
				return { success: true as const, dev: true as const };
			}
			return fail(503, { ...fields, error: 'not_configured' as const });
		}

		const subject = reason ? `${reason} — ${name}` : `Contact form — ${name}`;
		let res: Response;
		try {
			res = await fetch(RESEND_ENDPOINT, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from: FROM_ADDRESS,
					to: [TO_ADDRESS],
					reply_to: email,
					subject,
					text: `From: ${name} <${email}>\nReason: ${reason || '(not specified)'}\n\n${message}`
				})
			});
		} catch (err) {
			console.error('[contact] Resend request failed', err);
			return fail(502, { ...fields, error: 'send_failed' as const });
		}

		if (!res.ok) {
			console.error('[contact] Resend API error', res.status, await res.text().catch(() => ''));
			return fail(502, { ...fields, error: 'send_failed' as const });
		}

		return { success: true as const };
	}
};
