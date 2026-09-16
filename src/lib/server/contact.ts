// Enquiry handling, shared by BOTH routes that accept one: /contact's own
// default action and the home page's named `?/contact` action. SvelteKit only
// reads actions from a route's own +page.server.ts (never from a layout), so
// the two routes each keep a thin action that calls straight through to this.
//
// Sends via Resend's HTTP API — a plain fetch, not their Node SDK: one call
// doesn't need it, and avoiding it keeps this clear of the Cloudflare Workers
// runtime that adapter-cloudflare deploys onto. The real secret lives in
// RESEND_API_KEY (see .env.example for what it needs: a Resend account with
// august.tf verified as a sending domain). Without it, local dev logs the
// message to the console instead of sending, so the form is still exercisable
// without the key; production instead fails the action clearly rather than
// pretending to have sent something it didn't.

import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const TO_ADDRESS = 'hi@august.tf';
const FROM_ADDRESS = 'Ōgast website <hi@august.tf>';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface EnquiryFields {
	name: string;
	email: string;
	/** Both optional (2026-09, at the user's request — "必須ではないけど会社
	 *  名・スタジオ名、またそのリンクも入力できるようにして"). */
	company: string;
	companyUrl: string;
	reason: string;
	message: string;
}

function readFields(data: FormData): EnquiryFields {
	return {
		name: String(data.get('name') ?? '')
			.trim()
			.slice(0, 200),
		email: String(data.get('email') ?? '')
			.trim()
			.slice(0, 200),
		company: String(data.get('company') ?? '')
			.trim()
			.slice(0, 200),
		companyUrl: String(data.get('companyUrl') ?? '')
			.trim()
			.slice(0, 300),
		reason: String(data.get('reason') ?? '')
			.trim()
			.slice(0, 120),
		message: String(data.get('message') ?? '')
			.trim()
			.slice(0, 5000)
	};
}

/**
 * Validate and send one enquiry. Returns exactly the shapes both routes'
 * UIs already branch on: `{ success: true }`, `{ success: true, dev: true }`,
 * or a `fail()` carrying the submitted fields plus one of the error codes
 * `missing` / `invalid_email` / `not_configured` / `send_failed`.
 */
export async function handleEnquiry(request: Request) {
	const data = await request.formData();
	const fields = readFields(data);
	const { name, email, company, companyUrl, reason, message } = fields;

	if (!name || !email || !message) {
		return fail(400, { ...fields, error: 'missing' as const });
	}
	// A shape check, not a full RFC 5322 validator — just enough to catch an
	// obviously mistyped address before attempting to send anything.
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
	const companyLine = company
		? `Company: ${company}${companyUrl ? ` (${companyUrl})` : ''}\n`
		: '';
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
				text: `From: ${name} <${email}>\n${companyLine}Reason: ${reason || '(not specified)'}\n\n${message}`
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
