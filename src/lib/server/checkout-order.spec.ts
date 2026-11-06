import { describe, it, expect } from 'vitest';
import type { PackageDef } from '$lib/data/pricing';
import { buildOrder, orderProductName, orderStylesSummary } from './checkout-order';

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
// Sold with toppings, in early access, two of its four styles drawn.
const GAMMA: PackageDef = {
	id: 'gamma-complete',
	label: 'Gamma',
	detail: '4 styles',
	styles: ['10', '20', '30', '40'],
	availableStyles: ['10', '20'],
	defaultStyle: '10',
	stage: 'early',
	version: '0.3',
	licensing: 'toppings',
	baseEur: 30
};
const CATALOGUE = [ALPHA, BETA, GAMMA];

const TEAM = 2; // €50 a style
const STUDIO = 3; // €80 a style
const PRESET_USES = [
	{ topping: 'logo', option: 'logo-1' },
	{ topping: 'web', option: 'web-100k' },
	{ topping: 'social', option: 'social' }
];
const ALL_GAMMA = ['10', '20', '30', '40'];

interface Line {
	pkg: string;
	tier: number;
	styles: string[];
	kind?: string;
}

function form(lines: Line[], extra: Record<string, string> = {}): FormData {
	const data = new FormData();
	data.set('licensee_name', 'Acme Studio');
	data.set('eula', '1');
	for (const [k, v] of Object.entries(extra)) data.set(k, v);
	for (const line of lines) {
		data.append('item_kind', line.kind ?? 'tier');
		data.append('item_tier', String(line.tier));
		data.append('item_package', line.pkg);
		for (const s of line.styles) data.append('selected_style', `${line.pkg}:${s}`);
	}
	return data;
}

const gamma = (styles: string[], extra: Record<string, string> = {}) =>
	form([{ pkg: GAMMA.id, tier: TEAM, styles }], extra);
const withUses = (uses: unknown, extra: Record<string, string> = {}) => ({
	uses: JSON.stringify(uses),
	...extra
});

describe('buildOrder — one typeface', () => {
	it('prices tier × styles, with the full-set discount at every style', () => {
		const half = buildOrder(form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10', '20'] }]), CATALOGUE);
		// 2 of 4 styles = half the set: 25% off €100.
		expect(half.ok && half.order.total).toBe(75);
		const full = buildOrder(form([{ pkg: ALPHA.id, tier: TEAM, styles: ALL_GAMMA }]), CATALOGUE);
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
		const data = form([]);
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
		expect(result.ok && result.order.total).toBe(50);
	});
});

describe('buildOrder — several typefaces', () => {
	it('sums each typeface priced at the order’s one tier', () => {
		const result = buildOrder(
			form([
				{ pkg: ALPHA.id, tier: STUDIO, styles: ['10', '20'] },
				{ pkg: BETA.id, tier: STUDIO, styles: ['40', '90'] }
			]),
			CATALOGUE
		);
		// Alpha: 2 of 4 → 25% off €160 = €120. Beta: every style → 50% off €160 = €80.
		expect(result.ok && result.order.total).toBe(200);
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
		expect(orderStylesSummary(result.order)).toBe('Alpha: 40 / Beta: 40');
		expect(orderProductName(result.order)).toBe('Alpha + Beta');
	});

	it('refuses a typeface with no styles, two tiers, or the same typeface twice', () => {
		const bad = (lines: Line[]) => buildOrder(form(lines), CATALOGUE);
		expect(
			bad([
				{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] },
				{ pkg: BETA.id, tier: TEAM, styles: [] }
			])
		).toMatchObject({ ok: false });
		expect(
			bad([
				{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] },
				{ pkg: BETA.id, tier: STUDIO, styles: ['40'] }
			])
		).toMatchObject({ ok: false });
		expect(
			bad([
				{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] },
				{ pkg: ALPHA.id, tier: TEAM, styles: ['20'] }
			])
		).toMatchObject({ ok: false });
	});
});

describe('buildOrder — a tampered or incomplete form', () => {
	it('refuses a typeface not for sale, a style it lacks, or styles for a typeface not in the order', () => {
		expect(
			buildOrder(form([{ pkg: 'zeta-complete', tier: TEAM, styles: ['10'] }]), CATALOGUE)
		).toMatchObject({ ok: false });
		expect(
			buildOrder(form([{ pkg: ALPHA.id, tier: TEAM, styles: ['90'] }]), CATALOGUE)
		).toMatchObject({ ok: false, message: 'Invalid style selection.' });
		const data = form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] }]);
		data.append('selected_style', `${BETA.id}:40`);
		expect(buildOrder(data, CATALOGUE)).toMatchObject({
			ok: false,
			message: 'Invalid style selection.'
		});
	});

	it('refuses an empty order, an unknown kind, no licensee and no EULA', () => {
		expect(buildOrder(form([]), CATALOGUE)).toMatchObject({ ok: false });
		expect(
			buildOrder(form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10'], kind: 'free' }]), CATALOGUE)
		).toMatchObject({ ok: false });
		expect(
			buildOrder(
				form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] }], { licensee_name: ' ' }),
				CATALOGUE
			)
		).toMatchObject({ ok: false, message: expect.stringContaining('licensee') });
		expect(
			buildOrder(form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] }], { eula: '' }), CATALOGUE)
		).toMatchObject({ ok: false, message: expect.stringContaining('EULA') });
	});

	it('sends the Global tier to a custom quote, never to a price', () => {
		expect(buildOrder(form([{ pkg: ALPHA.id, tier: 7, styles: ['10'] }]), CATALOGUE)).toMatchObject(
			{ ok: false, message: expect.stringContaining('custom quote') }
		);
	});
});

describe('buildOrder — early access', () => {
	it('multiplies the licence by the stage’s share', () => {
		// Complete (4 of 4): 50% off €200 = €100 → early ×0.4 = €40.
		expect(buildOrder(gamma(ALL_GAMMA), CATALOGUE)).toMatchObject({
			ok: true,
			order: { total: 40 }
		});
	});

	it('sells a style not drawn yet only as part of the Complete Collection', () => {
		expect(buildOrder(gamma(['10', '30']), CATALOGUE)).toMatchObject({ ok: false });
		// The drawn styles alone: 2 of 4 = half the set, 25% off €100 = €75 → ×0.4.
		expect(buildOrder(gamma(['10', '20']), CATALOGUE)).toMatchObject({
			ok: true,
			order: { total: 30 }
		});
	});
});

describe('buildOrder — toppings', () => {
	it('adds each topping’s ratio to every style, under the package and early discounts', () => {
		// €50 × (1 + 2 + 0.3 + 0.2) × 4 = €700 → Complete 50% = €350 → early ×0.4 = €140.
		const result = buildOrder(gamma(ALL_GAMMA, withUses(PRESET_USES)), CATALOGUE);
		expect(result).toMatchObject({ ok: true, order: { total: 140 } });
		if (result.ok) expect(result.order.descriptions.join(' | ')).toContain('Logo (1 logo)');
	});

	it('takes a topping off and the price drops', () => {
		// €50 × 1.5 × 4 = €300 → €150 → ×0.4 = €60.
		expect(buildOrder(gamma(ALL_GAMMA, withUses(PRESET_USES.slice(1))), CATALOGUE)).toMatchObject({
			ok: true,
			order: { total: 60 }
		});
	});

	it('leaves a typeface sold bundled at its own price in the same order', () => {
		const result = buildOrder(
			form(
				[
					{ pkg: ALPHA.id, tier: TEAM, styles: ['10', '20'] },
					{ pkg: GAMMA.id, tier: TEAM, styles: ALL_GAMMA }
				],
				withUses(PRESET_USES)
			),
			CATALOGUE
		);
		// Alpha €75 + Gamma €140.
		expect(result).toMatchObject({ ok: true, order: { total: 215 } });
	});

	it('refuses toppings on an order with nothing sold with them', () => {
		expect(
			buildOrder(
				form([{ pkg: ALPHA.id, tier: TEAM, styles: ['10'] }], withUses(PRESET_USES)),
				CATALOGUE
			)
		).toMatchObject({ ok: false });
	});

	it('refuses an unknown or repeated topping and bad JSON', () => {
		expect(
			buildOrder(gamma(ALL_GAMMA, withUses([{ topping: 'logo', option: 'logo-99' }])), CATALOGUE)
		).toMatchObject({ ok: false });
		expect(
			buildOrder(gamma(ALL_GAMMA, withUses([PRESET_USES[0], PRESET_USES[0]])), CATALOGUE)
		).toMatchObject({ ok: false });
		expect(buildOrder(gamma(ALL_GAMMA, { uses: '{oops' }), CATALOGUE)).toMatchObject({ ok: false });
		expect(buildOrder(gamma(ALL_GAMMA, { uses: '"logo"' }), CATALOGUE)).toMatchObject({
			ok: false
		});
	});

	it('registers website domains for the Web topping, as bare hosts', () => {
		const data = gamma(ALL_GAMMA, withUses(PRESET_USES));
		data.append('web_domain', 'https://WWW.Acme.com/shop');
		data.append('web_domain', 'acme.com');
		const result = buildOrder(data, CATALOGUE);
		expect(result.ok && result.order.webDomains).toEqual(['www.acme.com', 'acme.com']);
	});

	it('refuses a domain that isn’t one, and ignores domains without the Web topping', () => {
		const bad = gamma(ALL_GAMMA, withUses(PRESET_USES));
		bad.append('web_domain', 'not a domain');
		expect(buildOrder(bad, CATALOGUE)).toMatchObject({ ok: false });
		const noWeb = gamma(ALL_GAMMA, withUses([PRESET_USES[0]]));
		noWeb.append('web_domain', 'acme.com');
		expect(buildOrder(noWeb, CATALOGUE)).toMatchObject({ ok: true, order: { webDomains: [] } });
	});
});

describe('buildOrder — subcontractors', () => {
	it('adds a flat fee each, outside the early-access factor', () => {
		// Licence €100 × 0.4 = €40, plus 2 × €50 untouched.
		expect(buildOrder(gamma(ALL_GAMMA, { subcontractors: '2' }), CATALOGUE)).toMatchObject({
			ok: true,
			order: { total: 140 }
		});
	});

	it('refuses a negative, fractional or absurd count', () => {
		for (const n of ['-1', '1.5', '6', 'many']) {
			expect(buildOrder(gamma(ALL_GAMMA, { subcontractors: n }), CATALOGUE)).toMatchObject({
				ok: false
			});
		}
	});
});
