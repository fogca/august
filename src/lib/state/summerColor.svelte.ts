// Shared "summer" brand colour used as the background for About and Contact
// (2026-09, at the user's request — "夏らしいブランドカラーを1色選定し、
// AboutやContactで背景色として使うべき...黄色系かオレンジ系、朱色系で試して
// みて、切り替え機能を設置してこちらでデバックできるようにして").
//
// Three candidates to compare live; DebugColorSwitcher.svelte (rendered once,
// in the root layout) is the only writer. Every consumer (AboutSection,
// /about, /contact, the home page's Contact section) reads `hex` reactively,
// so flipping the switch updates all of them at once — that's the point, the
// user wants to compare them applied consistently, not one page at a time.
//
// Text stays black everywhere this is used (the user's own call — "テキスト
// カラーは黒がいいかな") regardless of which candidate is active; none of
// these three are dark enough to need a white-text variant.

export type SummerColorKey = 'amber' | 'orange' | 'vermillion';

interface SummerColorOption {
	key: SummerColorKey;
	label: string;
	/** Matches base.css's existing --color-amber token exactly — this is
	 *  that colour's first real second candidate, not a replacement of it. */
	hex: string;
}

export const SUMMER_COLORS: SummerColorOption[] = [
	{ key: 'amber', label: 'Amber', hex: '#ffbb32' },
	{ key: 'orange', label: 'Orange', hex: '#ff8a3d' },
	{ key: 'vermillion', label: 'Vermillion', hex: '#ff5a36' }
];

class SummerColorState {
	current = $state<SummerColorKey>('amber');
}

export const summerColor = new SummerColorState();

export function summerColorHex(key: SummerColorKey): string {
	return SUMMER_COLORS.find((c) => c.key === key)?.hex ?? SUMMER_COLORS[0].hex;
}
