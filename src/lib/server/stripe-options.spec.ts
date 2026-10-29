import { describe, it, expect } from 'vitest';
import { checkoutFeatureParams, priceTaxBehavior } from './stripe-options';

describe('checkoutFeatureParams', () => {
	it('adds nothing when every flag is off (the default)', () => {
		expect(checkoutFeatureParams({})).toEqual({});
		expect(
			checkoutFeatureParams({ STRIPE_AUTOMATIC_TAX: '', STRIPE_INVOICE_CREATION: '0' })
		).toEqual({});
		expect(priceTaxBehavior({})).toEqual({});
	});

	it('turns on Stripe Tax with address + tax ID collection and a Customer', () => {
		const params = checkoutFeatureParams({ STRIPE_AUTOMATIC_TAX: '1' });
		expect(params).toEqual({
			automatic_tax: { enabled: true },
			billing_address_collection: 'required',
			tax_id_collection: { enabled: true },
			customer_creation: 'always'
		});
	});

	it('declares prices tax-inclusive only while Stripe Tax is on', () => {
		expect(priceTaxBehavior({ STRIPE_AUTOMATIC_TAX: '1' })).toEqual({ tax_behavior: 'inclusive' });
		expect(priceTaxBehavior({ STRIPE_INVOICE_CREATION: '1' })).toEqual({});
	});

	it('enables invoices independently of tax', () => {
		const params = checkoutFeatureParams({ STRIPE_INVOICE_CREATION: '1' });
		expect(params).toEqual({ invoice_creation: { enabled: true }, customer_creation: 'always' });
		expect(params.automatic_tax).toBeUndefined();
	});

	it('accepts true/on in any case and ignores surrounding spaces', () => {
		for (const value of ['true', 'TRUE', ' On ', '1']) {
			expect(checkoutFeatureParams({ STRIPE_AUTOMATIC_TAX: value }).automatic_tax).toEqual({
				enabled: true
			});
		}
	});

	it('treats anything else as off', () => {
		for (const value of ['0', 'false', 'off', 'yes', 'enabled']) {
			expect(checkoutFeatureParams({ STRIPE_AUTOMATIC_TAX: value })).toEqual({});
		}
	});
});
