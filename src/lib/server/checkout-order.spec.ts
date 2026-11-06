import { describe, it, expect } from 'vitest';
import type { PackageDef } from '$lib/data/pricing';
import {
	buildOrder,
	orderBrandsSummary,
	orderProductName,
	orderStylesSummary
} from './checkout-order';

const ALPHA: PackageDef = {
	id: 'alpha-complete',
	label: 'Alpha',
	detail: '4 weights',
	styles: ['10', '20', '30', '40'],
	baseEur: 30
};
const BETA: PackageDef = {
	id: 'beta-complete',
	label: 'Beta',
	detail: '2 weights',
	styles: ['40', '90'],
	baseEur: 30
};
const CATALOGUE = [ALPHA, BETA];

const TEAM = 2; // €50 a style
const STUDIO = 3; // €80 a style

interface Line {
	pkg: string;
	tier: number;
	styles: string[];
	kind?: string;
}

function form(lines: Line[], extra: Record<string, string> = {}): FormData {
	const data = new FormData();
	data.set('licensee_name', 'Acme Studio');
	for (const [k, v] of Object.entries(extra)) data.set(k, v);
	for (const line of lines) {
		data.append('item_kind', line.kind ?? 'tier');
		data.append('item_tier', String(line.tier));
		data.append('item_package', line.pkg);
		for (const s of line.styles) data.append('selected_style', `${line.pkg}:${s}`);
	}
	return data;
}

describe('buildOrder — one typeface', () => {
	it('prices tier × styles, with the full-set discount at every style', () => {
		const half = buildOrder(form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10', '20'] }]), CATALOGUE);
		// 2 of 4 styles = half the set: 25% off €100.
		expect(half.ok && half.order.total).toBe(75);

		const full = buildOrder(
			form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10', '20', '30', '40'] }]),
			CATALOGUE
		);
		// every style: 50% off €200.
		expect(full.ok && full.order.total).toBe(100);
	});

	it('names the product and the styles the way a single typeface always was', () => {
		const result = buildOrder(
			form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10', '30'] }]),
			CATALOGUE
		);
		if (!result.ok) throw new Error(result.message);
		expect(orderProductName(result.order)).toBe('Alpha — 4 weights');
		expect(orderStylesSummary(result.order)).toBe('10,30');
		expect(result.order.descriptions).toEqual(['Team (Up to 5) — 2 styles — Acme Studio']);
	});

	it('reads the form as it was before orders could hold several typefaces', () => {
		const data = new FormData();
		data.set('licensee_name', 'Acme Studio');
		data.append('item_kind', 'tier');
		data.append('item_tier', String(TEAM));
		data.append('item_package', ALPHA.id);
		data.append('selected_style', '10'); // no "<package>:" prefix
		data.append('selected_style', '20');
		const result = buildOrder(data, CATALOGUE);
		expect(result.ok && result.order.total).toBe(75);
	});

	it('counts a repeated style once', () => {
		const result = buildOrder(
			form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10', '10', '10', '10'] }]),
			CATALOGUE
		);
		// one style at €50, not four styles' worth of the full-set discount.
		expect(result.ok && result.order.total).toBe(50);
	});
});

describe('buildOrder — several typefaces', () => {
	const both = [
		{ pkg: ALPHA.id, tier: STUDIO, styles: ['10', '20'] },
		{ pkg: BETA.id, tier: STUDIO, styles: ['40', '90'] }
	];

	it('sums each typeface priced at the order’s one tier', () => {
		const result = buildOrder(form(both), CATALOGUE);
		// Alpha: 2 of 4 → 25% off €160 = €120. Beta: every style → 50% off €160 = €80.
		expect(result.ok && result.order.total).toBe(200);
		expect(result.ok && result.order.items.map((i) => i.packageId)).toEqual([ALPHA.id, BETA.id]);
	});

	it('keeps each typeface’s styles apart (the same style name may be in both)', () => {
		const result = buildOrder(
			form([
				{ pkg: ALPHA.id, tier: TEAM, styles: ['40'] },
				{ pkg: BETA.id, tier: TEAM, styles: ['40'] }
			]),
			CATALOGUE
		);
		if (!result.ok) throw new Error(result.message);
		expect(result.order.lines.map((l) => l.styles)).toEqual([['40'], ['40']]);
		expect(orderStylesSummary(result.order)).toBe('Alpha: 40 / Beta: 40');
		expect(orderProductName(result.order)).toBe('Alpha + Beta');
		expect(result.order.descriptions[1]).toBe('Beta — Team (Up to 5) — 1 style — Acme Studio');
	});

	it('refuses a typeface with no styles picked', () => {
		const result = buildOrder(
			form([
				{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] },
				{ pkg: BETA.id, tier: TEAM, styles: [] }
			]),
			CATALOGUE
		);
		expect(result).toMatchObject({ ok: false, status: 400 });
	});

	it('refuses two different tiers in one order', () => {
		const result = buildOrder(
			form([
				{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] },
				{ pkg: BETA.id, tier: STUDIO, styles: ['40'] }
			]),
			CATALOGUE
		);
		expect(result).toMatchObject({ ok: false, status: 400 });
	});

	it('refuses the same typeface twice', () => {
		const result = buildOrder(
			form([
				{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] },
				{ pkg: ALPHA.id, tier: TEAM, styles: ['20'] }
			]),
			CATALOGUE
		);
		expect(result).toMatchObject({ ok: false, status: 400 });
	});
});

describe('buildOrder — a tampered form', () => {
	it('refuses a typeface that is not for sale', () => {
		const result = buildOrder(
			form([{ pkg: 'gamma-complete', tier: TEAM, styles: ['10'] }]),
			CATALOGUE
		);
		expect(result).toMatchObject({ ok: false, status: 400 });
	});

	it('refuses a style the typeface does not have', () => {
		// "90" is Beta's, not Alpha's.
		const result = buildOrder(form([{ pkg: ALPHA.id, tier: TEAM, styles: ['90'] }]), CATALOGUE);
		expect(result).toMatchObject({ ok: false, message: 'Invalid style selection.' });
	});

	it('refuses styles sent for a typeface the order does not contain', () => {
		const data = form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] }]);
		data.append('selected_style', `${BETA.id}:40`);
		expect(buildOrder(data, CATALOGUE)).toMatchObject({
			ok: false,
			message: 'Invalid style selection.'
		});
	});

	it('refuses an order with nothing in it, an unknown kind and a missing organisation', () => {
		expect(buildOrder(new FormData(), CATALOGUE)).toMatchObject({ ok: false });
		expect(
			buildOrder(form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10'], kind: 'free' }]), CATALOGUE)
		).toMatchObject({ ok: false });
		expect(
			buildOrder(
				form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] }], { licensee_name: '' }),
				CATALOGUE
			)
		).toMatchObject({ ok: false, message: 'Please fill in your organisation name in Step 1.' });
	});

	it('sends the Global tier to a custom quote, never to a price', () => {
		const result = buildOrder(form([{ pkg: ALPHA.id, tier: 7, styles: ['10'] }]), CATALOGUE);
		expect(result).toMatchObject({ ok: false, message: expect.stringContaining('custom quote') });
	});
});

// ── Early access, brands (toppings) and subcontractors ───────────────────────

const GAMMA: PackageDef = {
	id: 'gamma-complete',
	label: 'Gamma',
	detail: '4 styles',
	styles: ['10', '20', '30', '40'],
	availableStyles: ['10', '20'], // 30 and 40 are promised, not drawn
	defaultStyle: '10',
	stage: 'early',
	version: '0.3',
	licensing: 'toppings',
	baseEur: 30
};
const WITH_GAMMA = [ALPHA, BETA, GAMMA];
const DEFAULT_USES = [
	{ topping: 'logo', option: 'logo-1' },
	{ topping: 'web', option: 'web-100k' },
	{ topping: 'social', option: 'social' }
];

function brandsOf(brands: unknown): Record<string, string> {
	return { brands: JSON.stringify(brands) };
}

function gammaForm(styles: string[], extra: Record<string, string> = {}): FormData {
	return form([{ pkg: GAMMA.id, tier: TEAM, styles }], extra);
}

describe('buildOrder — early access', () => {
	it('multiplies the licence by the stage’s share, and shows it as a discount', () => {
		// Complete (4 of 4): 50% off €200 = €100 → early ×0.4 = €40.
		const result = buildOrder(gammaForm(['10', '20', '30', '40']), WITH_GAMMA);
		if (!result.ok) throw new Error(result.message);
		expect(result.order.total).toBe(40);
	});

	it('sells a style that is not drawn yet only as part of the Complete Collection', () => {
		// 10 is drawn, 30 is not: not the whole set, so refused.
		expect(buildOrder(gammaForm(['10', '30']), WITH_GAMMA)).toMatchObject({ ok: false });
		// The drawn styles alone are fine: 2 of 4 = half the set, 25% off €100 = €75 → ×0.4.
		const drawn = buildOrder(gammaForm(['10', '20']), WITH_GAMMA);
		expect(drawn.ok && drawn.order.total).toBe(30);
	});
});

describe('buildOrder — brands', () => {
	const complete = ['10', '20', '30', '40'];
	const acme = { name: 'Acme', tier: TEAM, uses: DEFAULT_USES, styles: { [GAMMA.id]: ['10'] } };

	it('prices a brand at its own size, per use and per style, under the early factor', () => {
		const result = buildOrder(gammaForm(complete, brandsOf([acme])), WITH_GAMMA);
		if (!result.ok) throw new Error(result.message);
		// Licence €100 + logo €100 + web €15 + social €10 = €225 → ×0.4.
		expect(result.order.total).toBe(90);
		expect(result.order.brands[0].price).toBe(125);
		expect(orderBrandsSummary(result.order)).toContain('Acme');
	});

	it('charges each style a brand names, with no Complete discount', () => {
		const two = {
			...acme,
			uses: [{ topping: 'logo', option: 'logo-1' }],
			styles: { [GAMMA.id]: ['10', '20'] }
		};
		const result = buildOrder(gammaForm(complete, brandsOf([two])), WITH_GAMMA);
		// Licence €100 + logo 2 styles × €100 = €300 → ×0.4.
		expect(result.ok && result.order.total).toBe(120);
	});

	it('takes a use off and the price drops', () => {
		const noLogo = { ...acme, uses: DEFAULT_USES.slice(1) };
		const result = buildOrder(gammaForm(complete, brandsOf([noLogo])), WITH_GAMMA);
		// €100 + €15 + €10 = €125 → ×0.4.
		expect(result.ok && result.order.total).toBe(50);
	});

	it('prices each brand by its own size', () => {
		const studio = {
			...acme,
			name: 'Big Co',
			tier: 4,
			uses: [{ topping: 'logo', option: 'logo-1' }]
		};
		const result = buildOrder(gammaForm(complete, brandsOf([acme, studio])), WITH_GAMMA);
		// Acme €125 + Big Co logo at €130 × 2 = €260; licence €100 → €485 × 0.4.
		expect(result.ok && result.order.total).toBe(194);
	});

	it('refuses styles the licence does not hold, or has not drawn', () => {
		// Only 10 and 20 are bought and drawn; a brand may not use 30 …
		const base = ['10', '20'];
		const uses30 = { ...acme, styles: { [GAMMA.id]: ['30'] } };
		expect(buildOrder(gammaForm(base, brandsOf([uses30])), WITH_GAMMA)).toMatchObject({
			ok: false
		});
		// … nor 30 even with the Complete Collection, since it is not drawn.
		expect(buildOrder(gammaForm(complete, brandsOf([uses30])), WITH_GAMMA)).toMatchObject({
			ok: false
		});
	});

	it('refuses brand uses on a typeface that is sold bundled', () => {
		const onAlpha = { ...acme, styles: { [ALPHA.id]: ['10'] } };
		const result = buildOrder(
			form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10', '20'] }], brandsOf([onAlpha])),
			WITH_GAMMA
		);
		expect(result).toMatchObject({ ok: false, message: 'Invalid style selection.' });
	});

	it('refuses a nameless brand, an unknown or repeated use, no uses, and bad JSON', () => {
		const bad = (brand: unknown) => buildOrder(gammaForm(complete, brandsOf([brand])), WITH_GAMMA);
		expect(bad({ ...acme, name: ' ' })).toMatchObject({ ok: false });
		expect(bad({ ...acme, uses: [{ topping: 'logo', option: 'logo-99' }] })).toMatchObject({
			ok: false
		});
		expect(bad({ ...acme, uses: [DEFAULT_USES[0], DEFAULT_USES[0]] })).toMatchObject({ ok: false });
		expect(bad({ ...acme, uses: [] })).toMatchObject({ ok: false });
		expect(buildOrder(gammaForm(complete, { brands: '{not json' }), WITH_GAMMA)).toMatchObject({
			ok: false
		});
		expect(buildOrder(gammaForm(complete, { brands: '"a string"' }), WITH_GAMMA)).toMatchObject({
			ok: false
		});
	});

	it('sends a Global-size brand to a custom quote', () => {
		const result = buildOrder(gammaForm(complete, brandsOf([{ ...acme, tier: 7 }])), WITH_GAMMA);
		expect(result).toMatchObject({ ok: false, message: expect.stringContaining('custom quote') });
	});

	it('refuses more brands than a page could send', () => {
		const many = Array.from({ length: 21 }, () => acme);
		expect(buildOrder(gammaForm(complete, brandsOf(many)), WITH_GAMMA)).toMatchObject({
			ok: false
		});
	});
});

describe('buildOrder — subcontractors', () => {
	const complete = ['10', '20', '30', '40'];

	it('adds a flat fee each, outside the early-access factor', () => {
		const result = buildOrder(gammaForm(complete, { subcontractors: '2' }), WITH_GAMMA);
		// Licence €100 × 0.4 = €40, plus 2 × €50 untouched.
		expect(result.ok && result.order.total).toBe(140);
	});

	it('refuses a negative, fractional or absurd count', () => {
		for (const n of ['-1', '1.5', '21', 'many']) {
			expect(buildOrder(gammaForm(complete, { subcontractors: n }), WITH_GAMMA)).toMatchObject({
				ok: false
			});
		}
	});
});
