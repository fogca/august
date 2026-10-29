// The owner-facing "new order" email sent from the Stripe webhook.
//
// Fulfilment is still manual (Legal Notice: download link emailed within 24h of
// payment), so this email is the trigger: it carries everything needed to send
// the right files to the right buyer without opening the Stripe dashboard first.
// Pure function of the Checkout Session so it unit-tests without any network.
import type Stripe from 'stripe';

// Stripe amounts are minor units except zero-decimal currencies. Only JPY is
// relevant to this shop; extend if another one is ever sold.
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY']);

export interface OrderNotice {
	subject: string;
	text: string;
}

function toMajorUnits(minor: number, currency: string): number {
	return ZERO_DECIMAL_CURRENCIES.has(currency) ? minor : minor / 100;
}

function formatMoney(minor: number, currency: string): string {
	const digits = ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2;
	return `${currency} ${toMajorUnits(minor, currency).toFixed(digits)}`;
}

/** Subject lines must stay on one line, whatever the buyer typed into the form. */
function oneLine(value: string): string {
	return value.replace(/[\r\n]+/g, ' ').trim();
}

function paymentIntentId(session: Stripe.Checkout.Session): string | null {
	const pi = session.payment_intent;
	if (!pi) return null;
	return typeof pi === 'string' ? pi : pi.id;
}

function line(label: string, value: string | null | undefined): string | null {
	return value ? `${label.padEnd(13)}${value}` : null;
}

export function buildOrderNotice(session: Stripe.Checkout.Session): OrderNotice {
	const currency = (session.currency ?? 'eur').toUpperCase();
	const total = formatMoney(session.amount_total ?? 0, currency);
	const tax = session.total_details?.amount_tax;
	const pi = paymentIntentId(session);
	const meta = session.metadata ?? {};
	const customer = session.customer_details;
	const buyer = [customer?.name, customer?.email ? `<${customer.email}>` : null]
		.filter(Boolean)
		.join(' ');
	const invoice = typeof session.invoice === 'string' ? session.invoice : session.invoice?.id;

	// Test-mode payments live under /test in the dashboard.
	const dashboardUrl = pi
		? `https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}payments/${pi}`
		: null;

	const subject = oneLine(
		`New order — ${total}${meta.licensee_name ? ` — ${meta.licensee_name}` : ''}${
			session.livemode ? '' : ' [TEST]'
		}`
	);

	const rows = [
		line('Paid:', tax ? `${total} (incl. tax ${formatMoney(tax, currency)})` : total),
		line('Buyer:', buyer),
		line('Country:', customer?.address?.country),
		line('Licensee:', meta.licensee_name),
		line('Client:', meta.client_name),
		line('Size:', meta.organisation_size),
		line('Educational:', meta.educational),
		line('Licenses:', meta.licenses),
		line('Styles:', meta.selected_styles),
		line('Invoice:', invoice),
		line('Reference:', pi ?? session.id),
		line('Dashboard:', dashboardUrl)
	].filter((row): row is string => row !== null);

	const text = [
		'A payment was completed on the Apres Guerre /buy page.',
		'',
		...rows,
		'',
		'To do: email the buyer their download link within 24 hours (Legal Notice).'
	].join('\n');

	return { subject, text };
}
