// Typeface data definitions for August Type Foundry
// Used by /fonts listing and /fonts/[slug] detail pages.

import type { WeightDef } from '$lib/components/TypeTester/presets.js';
import { WEIGHTS } from '$lib/components/TypeTester/presets.js';

export type { WeightDef as TypefaceWeight };

export type TypefaceStatus = 'available' | 'in-development';

export interface Typeface {
	slug: string;
	name: string;
	/** Display order (ascending): 1 = Scheteiner, 2 = MK Sans, 3 = Atom */
	order: number;
	status: TypefaceStatus;
	/** CSS font-family value to use in the Type Tester */
	fontFamily: string;
	tagline: string;
	description: string;
	/** e.g. 'Humanist Sans · 12 weights' */
	classification: string;
	weights: WeightDef[];
	defaultText: string;
	/** Optional hero thumbnail (image path under /). When absent, the slide
	 *  falls back to a large typographic placeholder. */
	thumbnail?: string;
	/** Optional hero video (used in preference to thumbnail when present). */
	heroVideo?: string;
	/** Hero slide colour theme — gives each typeface a distinct light/dark tone. */
	theme: { bg: string; fg: string };
	/** Hero metadata (per Figma SP design 280:104 / 274:18) */
	hero: {
		label: string; // e.g. 'Neo Humanist Sans'
		vol: string; // e.g. 'vol.01'
		subtitle: string; // e.g. '(Geometry breathing)'
		debut: string; // e.g. '26.06.06 Debut'
		/** Render the hero wordmark larger (e.g. gQ) */
		large?: boolean;
		/** Coming-soon hero variant: shows intro + name + statement, no meta/Discover */
		comingSoon?: boolean;
		/** Small intro line shown above the name in the coming-soon variant */
		intro?: string;
		/** Centered statement line (e.g. 'Geometry, breathing.') */
		statement?: string;
	};
}

export const TYPEFACES: Typeface[] = [
	{
		slug: 'steiner',
		name: 'Steiner',
		order: 1,
		status: 'available',
		fontFamily: 'Steiner',
		tagline: 'The medium meaning passes through.',
		description:
			"Steiner is a 12-weight humanist sans-serif variable font, drawn in Tokyo. " +
			"The name is rooted in the classical Greek word for the upper air — the medium through which light and form once travelled. " +
			"In lineage it stands as a sibling to Apercu, but reaches deeper: through Johnston's 1916 Underground alphabet, Gill Sans, Neuzeit, and Otl Aicher's Rotis (1988). " +
			"Where Apercu draws on Franklin Gothic, Steiner draws on Rotis — seventy years of humanist tradition folded into a single voice.",
		classification: 'Humanist Sans · 12 weights',
		weights: WEIGHTS,
		defaultText: 'The aether carries Rudolf Steiner anthroposophy.',
		// Existing Scheteiner motion specimen doubles as the hero slide background
		heroVideo: '/images/August_Scheteiner_01.mp4',
		theme: { bg: '#000000', fg: '#ffffff' },
		hero: {
			label: 'Neo Humanist Sans',
			vol: 'vol.01',
			subtitle: '(Geometry breathing)',
			debut: '26.06.06 Debut'
		}
	},
	{
		slug: 'gq',
		name: 'gQ',
		order: 2,
		status: 'in-development',
		// Latest Mokuseki Sans (v05) webfont
		fontFamily: 'Mokuseki Sans',
		tagline: 'The latest cut of Mokuseki Sans.',
		description:
			'gQ is the latest evolution of Mokuseki Sans — a neo-humanist sans drawn at August Type Foundry. ' +
			'Details on weights and axis range will be published as the design reaches maturity. ' +
			'Debuting 2026.',
		classification: 'Neo Humanist Sans · 12 weights',
		// Provisional weights — same 12-stop axis as Scheteiner until spec is finalised
		weights: WEIGHTS,
		defaultText: 'gQ — the latest Mokuseki Sans.',
		thumbnail: '/images/fonts/gq.png',
		theme: { bg: '#EDEAE3', fg: '#1a1a1a' },
		hero: {
			label: 'Neo Humanist Sans',
			vol: 'vol.02',
			subtitle: '(Mokuseki Sans)',
			debut: '26.06.06 Debut',
			large: true
		}
	},
	{
		slug: 'atom',
		name: 'Atom',
		order: 3,
		status: 'in-development',
		// No font files yet — render as Scheteiner for preview purposes
		fontFamily: 'Steiner',
		tagline: 'A display typeface in development.',
		description:
			'Atom is a display typeface currently in development at August Type Foundry. ' +
			'Further details on its design direction and release schedule will follow. ' +
			'Coming 2026.',
		classification: 'Neo Grotesque · in development',
		// Provisional weights — same 12-stop axis as Scheteiner until spec is finalised
		weights: WEIGHTS,
		defaultText: 'Atom — coming 2026.',
		thumbnail: '/images/fonts/atom.png',
		theme: { bg: '#15181C', fg: '#ffffff' },
		hero: {
			label: 'Neo Grotesque',
			vol: 'vol.03',
			subtitle: '(Coming soon)',
			debut: 'Coming soon',
			comingSoon: true,
			intro: 'The very first Neo Grotesque from our foundry.',
			statement: 'Geometry, breathing.'
		}
	}
];

export function getTypeface(slug: string): Typeface | undefined {
	return TYPEFACES.find((tf) => tf.slug === slug);
}
