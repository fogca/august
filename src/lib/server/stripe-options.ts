// Optional Stripe Checkout features, each behind its own env flag so the code
// can ship BEFORE the matching Stripe dashboard setup exists.
//
// Why flags and not "always on": `automatic_tax` makes Checkout Session
// creation FAIL until Stripe Tax has an origin address (and registrations)
// configured in the dashboard. Shipping it unconditionally would break every
// purchase in the gap between deploy and dashboard setup. Flip the flag after
// the dashboard side is done (see docs/STRIPE.md).
//
//   STRIPE_AUTOMATIC_TAX=1     Stripe Tax: tax calculated at Checkout, billing
//                              address required, buyers can enter a tax ID.
//   STRIPE_INVOICE_CREATION=1  Post-purchase invoice (PDF) for every payment.
//                              Off by default: Stripe may bill per paid
//                              invoice — check Stripe's pricing page first.
//
// Pure functions of `env` so they unit-test without SvelteKit.
import type Stripe from 'stripe';

/** Reads STRIPE_AUTOMATIC_TAX and STRIPE_INVOICE_CREATION. Typed as a plain env
 *  record so SvelteKit's `$env/dynamic/private` object can be passed as-is. */
export type StripeFeatureEnv = Record<string, string | undefined>;

const ENABLED_VALUES = new Set(['1', 'true', 'on']);

/**
 * Whether /buy should show the purchase flow or COMING SOON. Open exactly when
 * a payment could actually be taken: a Stripe key is configured, or it is local
 * dev (where the stub / a test key keeps the flow exercisable). So production
 * stays closed until the live key is added, and a preview deployment opens only
 * once it is given a key.
 */
export function isCheckoutOpen(env: StripeFeatureEnv, dev: boolean): boolean {
	return dev || Boolean(env.STRIPE_SECRET_KEY?.trim());
}

/** Shop prices are shown tax-included (Legal Notice: "tax included"). */
const PRICE_TAX_BEHAVIOR = 'inclusive' as const;

function isOn(value: string | undefined): boolean {
	return value !== undefined && ENABLED_VALUES.has(value.trim().toLowerCase());
}

/**
 * Spread into `price_data`. With Stripe Tax on, the displayed amount must be
 * declared tax-inclusive, otherwise Stripe would add tax on top of it and the
 * buyer would pay more than the price shown on /buy.
 */
export function priceTaxBehavior(env: StripeFeatureEnv): {
	tax_behavior?: typeof PRICE_TAX_BEHAVIOR;
} {
	return isOn(env.STRIPE_AUTOMATIC_TAX) ? { tax_behavior: PRICE_TAX_BEHAVIOR } : {};
}

/** Spread into `checkout.sessions.create`. Empty when every flag is off. */
export function checkoutFeatureParams(
	env: StripeFeatureEnv
): Partial<Stripe.Checkout.SessionCreateParams> {
	const tax = isOn(env.STRIPE_AUTOMATIC_TAX);
	const invoice = isOn(env.STRIPE_INVOICE_CREATION);
	const params: Partial<Stripe.Checkout.SessionCreateParams> = {};

	if (tax) {
		params.automatic_tax = { enabled: true };
		// Tax is decided by the buyer's address, so a full billing address is needed.
		params.billing_address_collection = 'required';
		// Organisation licences: lets a business buyer enter a VAT / tax ID.
		params.tax_id_collection = { enabled: true };
	}
	if (invoice) {
		params.invoice_creation = { enabled: true };
	}
	if (tax || invoice) {
		// Tax IDs and invoices hang off a Customer, so always create one
		// (the payment-mode default only creates it when required).
		params.customer_creation = 'always';
	}
	return params;
}
