// Discount rules for Apres Guerre
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

import { packageStage, stageFactor, STAGE_LABELS } from './pricing';
import type { PackageDef } from './pricing';

export type DiscountId = 'early-bird' | 'educational' | 'early-access';

// Toggle Early Bird globally — set to false after launch period
export const EARLY_BIRD_ACTIVE = false;

// Educational discount — left out for now (2026-08-29, at the user's
// request): the toggle and its copy stay in the codebase, just inert,
// same pattern as EARLY_BIRD_ACTIVE above. Flip back to true to re-enable.
export const EDUCATIONAL_ACTIVE = false;

export const EARLY_BIRD_RATE = 0.3;
export const EDUCATIONAL_RATE = 0.3;

// 'tier' = a typeface's licence at the buyer's company size (tierIndex set).
// 'topping' = a brand's use of one typeface (logo, web …; tierIndex = the
//   brand's own size) — never discounted for the full set.
// 'sub' = a subcontractor licence: flat, no typeface (packageId '').
// (The flat-priced 'project' kind was retired 2026-11-06 — see TOPPINGS.)
export type CartItemKind = 'tier' | 'topping' | 'sub';

export interface CartItem {
	kind: CartItemKind;
	tierIndex: number | null;
	basePrice: number; // post-package price in EUR (at selected tier, or the topping / subcontractor price)
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
	const pkgList =
		packageDefs && packageDefs.length > 0 ? packageDefs : packageDef ? [packageDef] : [];
	for (const pkg of pkgList) {
		// Items belonging to this package
		const pkgItems = items.filter((i) => i.packageId === pkg.id && i.kind === 'tier');
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

	// Early access: a family not yet at its release stage costs its stage's
	// share of the price — on the licence and on the brands' toppings alike
	// (a subcontractor licence has no typeface, so it is left out).
	let stageAmount = 0;
	for (const pkg of pkgList) {
		const factor = stageFactor(pkg);
		if (factor >= 1) continue;
		const pkgItems = items.filter((i) => i.packageId === pkg.id);
		const amount = Math.round(baseSubtotal(pkgItems) * (1 - factor));
		if (amount <= 0) continue;
		const version = pkg.version ? ` v${pkg.version}` : '';
		discounts.push({
			id: 'early-access',
			label: `${pkg.label} ${STAGE_LABELS[packageStage(pkg)]}${version} (−${Math.round((1 - factor) * 100)}%)`,
			rate: 1 - factor,
			amount
		});
		stageAmount += amount;
	}

	// Educational: −30% on post-package subtotal
	if (EDUCATIONAL_ACTIVE && isStudent) {
		const amount = Math.round((base - stageAmount) * EDUCATIONAL_RATE);
		discounts.push({
			id: 'educational',
			label: 'Educational (−30%)',
			rate: EDUCATIONAL_RATE,
			amount
		});
	}

	// Early Bird: −30% on post-package subtotal
	if (EARLY_BIRD_ACTIVE) {
		const amount = Math.round((base - stageAmount) * EARLY_BIRD_RATE);
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
