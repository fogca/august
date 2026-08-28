// Discount rules for August Type Foundry
//
// Discount stacking rules:
//   - Package discount (built into base price, displayed as anchoring vs gross)
//   - Educational −30% applies on top of the post-package subtotal
//   - Early Bird stacks on the post-package subtotal when active
//
// | Discount        | Rate | Stacks with         |
// |-----------------|------|---------------------|
// | Package         | varies (built into base) | displayed as anchoring |
// | Early Bird      | −30% | Package (on top)    |
// | Educational     | −30% | Package (on top)    |

import type { PackageDef } from './pricing';

export type DiscountId = 'early-bird' | 'educational';

// Toggle Early Bird globally — set to false after launch period
export const EARLY_BIRD_ACTIVE = false;

export const EARLY_BIRD_RATE = 0.3;
export const EDUCATIONAL_RATE = 0.3;

// 'tier' = standard company-size licence (tierIndex set).
// 'project' = flat-priced Project License, single-brand scope (tierIndex null).
export type CartItemKind = 'tier' | 'project';

export interface CartItem {
	kind: CartItemKind;
	tierIndex: number | null;
	basePrice: number; // post-package price in EUR (at selected tier, or flat Project License price)
	grossPrice: number; // pre-package price in EUR (for anchoring)
	packageId: string;
}

export interface CartState {
	items: CartItem[];
	isStudent: boolean;
	// Selected packages info for display (supports multiple selections)
	packageDef: PackageDef | null;
	packageDefs?: PackageDef[];
}

export interface AppliedDiscount {
	id: DiscountId | 'package';
	label: string;
	rate: number;
	amount: number; // savings in EUR (positive = savings)
}

// Gross subtotal: sum of gross prices (before package discount) per item
function grossSubtotal(items: CartItem[]): number {
	return items.reduce((s, i) => s + i.grossPrice, 0);
}

// Post-package subtotal: sum of base prices per item
function baseSubtotal(items: CartItem[]): number {
	return items.reduce((s, i) => s + i.basePrice, 0);
}

/**
 * Compute the final total — supports multiple packages.
 *
 * Subtotal shown = gross (pre-package) so package discount lines are visible.
 * Stacking:
 *   - Per-package discount lines, then Educational / Early Bird on the
 *     post-package subtotal
 *
 * When packageDefs is provided, each package shows its own discount line.
 * Falls back to legacy single packageDef behaviour for backwards compatibility.
 */
export function computeTotal(cart: CartState): {
	subtotal: number;
	discounts: AppliedDiscount[];
	total: number;
} {
	const { items, isStudent, packageDef, packageDefs } = cart;
	if (items.length === 0) return { subtotal: 0, discounts: [], total: 0 };

	const gross = grossSubtotal(items);
	const base = baseSubtotal(items);
	const discounts: AppliedDiscount[] = [];

	// Package discount(s): one row per package whose items are actually
	// discounted right now. Derived from the items themselves (gross vs.
	// base), not a static rate on the package — the full-set discount in
	// $lib/data/pricing is conditional on selected style count, so whether
	// it applies can only be read off the priced cart items, not the
	// package definition alone.
	const pkgList = packageDefs && packageDefs.length > 0 ? packageDefs : packageDef ? [packageDef] : [];
	for (const pkg of pkgList) {
		// Items belonging to this package
		const pkgItems = items.filter((i) => i.packageId === pkg.id);
		if (pkgItems.length === 0) continue;
		const pkgGross = grossSubtotal(pkgItems);
		const pkgBase = baseSubtotal(pkgItems);
		const pkgAmount = pkgGross - pkgBase;
		if (pkgAmount <= 0) continue;
		const pct = Math.round((pkgAmount / pkgGross) * 100);
		discounts.push({
			id: 'package',
			label: `${pkg.label} (−${pct}%)`,
			rate: pkgAmount / pkgGross,
			amount: pkgAmount
		});
	}

	// Educational: −30% on post-package subtotal
	if (isStudent) {
		const amount = Math.round(base * EDUCATIONAL_RATE);
		discounts.push({
			id: 'educational',
			label: 'Educational (−30%)',
			rate: EDUCATIONAL_RATE,
			amount
		});
	}

	// Early Bird: −30% on post-package subtotal
	if (EARLY_BIRD_ACTIVE) {
		const amount = Math.round(base * EARLY_BIRD_RATE);
		discounts.push({
			id: 'early-bird',
			label: 'Early Bird (−30%)',
			rate: EARLY_BIRD_RATE,
			amount
		});
	}

	const totalDiscount = discounts.reduce((s, d) => s + d.amount, 0);
	const total = Math.max(0, gross - totalDiscount);
	return { subtotal: gross, discounts, total };
}
