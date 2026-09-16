// Site-wide primary navigation — shared verbatim between Header.svelte
// (its desktop inline nav) and Footer.svelte (its own nav column), at the
// user's own request (2026-09, "FooterのリンクはHeaderと共有して") so the
// two can't quietly drift out of sync with each other.
//
// License -> /licensing, not /license — that shorter URL is a stable
// redirect to /legal/eula baked into the shipped fonts' own OpenType
// nameID 13/14 metadata (see Footer.svelte's own LEGAL array).
export interface NavItem {
	label: string;
	href: string;
}

export const SITE_NAV: NavItem[] = [
	{ label: 'Fonts', href: '/fonts' },
	{ label: 'Custom', href: '/custom' },
	{ label: 'License', href: '/licensing' },
	{ label: 'About', href: '/about' },
	{ label: 'Contact', href: '/contact' }
];
