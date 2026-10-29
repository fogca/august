import { describe, it, expect } from 'vitest';
import type Stripe from 'stripe';
import { buildOrderNotice } from './order-notice';

// Only the fields the notice reads — the real object has hundreds.
function session(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
	return {
		id: 'cs_test_123',
		livemode: true,
		currency: 'eur',
		amount_total: 56000,
		payment_intent: 'pi_abc',
		customer_details: {
			name: 'Ada Lovelace',
			email: 'ada@example.com',
			address: { country: 'GB' }
		},
		total_details: { amount_tax: 0 },
		metadata: {
			licensee_name: 'Analytical Engines Ltd',
			client_name: '',
			organisation_size: '11–50',
			educational: 'no',
			licenses: 'Studio (11–50) — 2 styles — Analytical Engines Ltd',
			selected_styles: 'Regular,Bold'
		},
		...overrides
	} as unknown as Stripe.Checkout.Session;
}

describe('buildOrderNotice', () => {
	it('puts amount, buyer and fulfilment details in the email', () => {
		const { subject, text } = buildOrderNotice(session());
		expect(subject).toBe('New order — EUR 560.00 — Analytical Engines Ltd');
		expect(text).toContain('Ada Lovelace <ada@example.com>');
		expect(text).toContain('Regular,Bold');
		expect(text).toContain('Reference:   pi_abc');
		expect(text).toContain('https://dashboard.stripe.com/payments/pi_abc');
	});

	it('shows the included tax when Stripe Tax charged some', () => {
		const { text } = buildOrderNotice(session({ total_details: { amount_tax: 9333 } }));
		expect(text).toContain('EUR 560.00 (incl. tax EUR 93.33)');
	});

	it('does not divide zero-decimal currencies (JPY)', () => {
		const { subject } = buildOrderNotice(session({ currency: 'jpy', amount_total: 84000 }));
		expect(subject).toContain('JPY 84000');
	});

	it('marks test-mode payments and links to the test dashboard', () => {
		const { subject, text } = buildOrderNotice(session({ livemode: false }));
		expect(subject.endsWith('[TEST]')).toBe(true);
		expect(text).toContain('https://dashboard.stripe.com/test/payments/pi_abc');
	});

	it('keeps the subject on one line even if the licensee name has line breaks', () => {
		const { subject } = buildOrderNotice(
			session({ metadata: { licensee_name: 'Evil\r\nBcc: someone@example.com' } })
		);
		expect(subject).not.toMatch(/[\r\n]/);
	});

	it('leaves out rows that have no value instead of printing null/undefined', () => {
		const { text } = buildOrderNotice(session({ customer_details: null, metadata: {} }));
		expect(text).not.toMatch(/undefined|null/);
		expect(text).not.toContain('Client:');
		expect(text).toContain('Reference:');
	});

	it('falls back to the session id when there is no payment intent', () => {
		const { text } = buildOrderNotice(session({ payment_intent: null }));
		expect(text).toContain('cs_test_123');
		expect(text).not.toContain('Dashboard:');
	});
});
