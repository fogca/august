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
