// Typeface data definitions for August Type Foundry
// Used by /fonts listing and /fonts/[slug] detail pages.

import type { WeightDef } from '$lib/components/TypeTester/presets.js';
import { WEIGHTS } from '$lib/components/TypeTester/presets.js';

export type { WeightDef as TypefaceWeight };

export type TypefaceStatus = 'available' | 'in-development';

export interface Typeface {
	slug: string;
	name: string;
	/** Display order (ascending): 1 = Steiner, 2 = MK Sans, 3 = Atom */
	order: number;
	status: TypefaceStatus;
	/** Temporarily hide from all listings (top page, /fonts, header menu) */
	hidden?: boolean;
	/** CSS font-family value to use in the Type Tester */
	fontFamily: string;
	tagline: string;
	description: string;
	/** Japanese running translation of the description (shown under the English). */
	descriptionJa?: string;
	/** e.g. 'Humanist Sans · 12 weights' */
	classification: string;
	weights: WeightDef[];
	/** Per-weight default words for the Type Tester — row i uses defaultTexts[i % length] */
	defaultTexts: string[];
	/** Optional hero thumbnail (image path under /). When absent, the slide
	 *  falls back to a large typographic placeholder. */
	thumbnail?: string;
	/** Optional hero video (used in preference to thumbnail when present). */
	heroVideo?: string;
	/** Optional credit line for the hero image (photographer / source / licence). */
	imageCredit?: string;
	/** Specimen galleries for the typeface page (each renders an ImageGallery). */
	specimens?: {
		title: string;
		columns?: number;
		ratio?: string;
		items: { src?: string; caption?: string; alt?: string }[];
	}[];
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
		tagline: 'The formative forces of the word, made visible.',
		description:
			"Steiner is a 20-weight neo-humanist sans-serif variable font. " +
			"It takes its name — and its temperament — from Rudolf Steiner: a Goethean reading of nature, where form is never fixed but always in metamorphosis, and an anthroposophy that holds the human being as the measure of things. " +
			"The letters are made to feel grown rather than constructed — organic in their curves, human in their proportion. " +
			"Its humanist lineage runs quietly beneath — Johnston's 1916 Underground alphabet, Gill Sans, Neuzeit, Otl Aicher's Rotis — never the surface, only the soil.",
		descriptionJa:
			'Steiner は、20ウェイトのネオ・ヒューマニスト・サンセリフ（可変フォント）です。その名と気質はルドルフ・シュタイナーに由来します——形を固定されたものでなく絶えざる変容として見るゲーテ的な自然観と、人間を万物の尺度とする人智学。文字は「構築された」のではなく「育った」ように、曲線は有機的に、プロポーションは人間的に。ヒューマニストの系譜は表層ではなく土壌として静かに息づいています——ジョンストンの1916年ロンドン地下鉄書体、Gill Sans、Neuzeit、オトル・アイヒャーの Rotis。',
		classification: 'Neo Humanist Sans · 20 weights',
		weights: WEIGHTS,
		// One German word per weight row (20), in alphabetical order A→T —
		// Steiner / anthroposophy & nature vocabulary
		defaultTexts: [
			'Anthroposophie',
			'Bildekräfte',
			'Christusimpuls',
			'Dreigliederung',
			'Eurythmie',
			'Freiheit',
			'Goetheanum',
			'Herzdenken',
			'Imagination',
			'Jahreslauf',
			'Keimkraft',
			'Lebenskraft',
			'Metamorphose',
			'Naturreich',
			'Organismus',
			'Pflanzenwelt',
			'Quelle',
			'Rhythmus',
			'Seelenkalender',
			'Tierwelt'
		],
		// Hero background — Rudolf Steiner portrait (1905, Otto Rietmann; public domain)
		thumbnail: '/images/Steiner/06_R.-Steiner-1905-Foto-Rietmann.jpg',
		imageCredit:
			'Rudolf Steiner — photograph by Otto Rietmann, 1905. Public domain, courtesy of the Rudolf Steiner Archive, Dornach.',
		// Page specimens (DrawBot / drawbot-skia — see Steiner/00_master/Visuals/page_specimens.py)
		specimens: [
			{
				title: 'Specimens',
				columns: 2,
				ratio: '16 / 10',
				items: [
					{ src: '/images/specimens/steiner/currency_f6.png', caption: 'Currency — Book' },
					{ src: '/images/specimens/steiner/ligatures_f6.png', caption: 'Ligatures — fi fl ff ffi ffl' }
				]
			},
			{
				title: 'Weight',
				columns: 2,
				ratio: '4 / 5',
				items: [{ src: '/images/specimens/steiner/ag_anim_f6.gif', caption: 'ag — wght 1 → 950' }]
			}
		],
		theme: { bg: '#000000', fg: '#ffffff' },
		hero: {
			label: 'Neo Humanist Sans',
			vol: 'vol.01',
			subtitle: '(Formative forces)',
			debut: '26.07.01 Debut'
		}
	},
	{
		slug: 'gq',
		name: 'gQ',
		order: 2,
		status: 'in-development',
		// Latest Mokuseki Sans (v08) webfont
		fontFamily: 'Mokuseki Sans',
		tagline: 'The latest cut of Mokuseki Sans.',
		description:
			'gQ is the latest evolution of Mokuseki Sans — a neo-humanist sans drawn at August Type Foundry. ' +
			'Details on weights and axis range will be published as the design reaches maturity. ' +
			'Debuting 2026.',
		descriptionJa:
			'gQ は Mokuseki Sans の最新進化形——August Type Foundry が描くネオ・ヒューマニスト・サンセリフです。ウェイトや軸の範囲などの詳細は、デザインの成熟に合わせて公開していきます。2026年デビュー予定。',
		classification: 'Neo Humanist Sans · 12 weights',
		// Provisional weights — same 12-stop axis as Steiner until spec is finalised
		weights: WEIGHTS,
		// One long German word per weight row (20) — aesthetic / philosophical vocabulary
		defaultTexts: [
			'Gesamtkunstwerk',
			'Zeitgeist',
			'Sprachgefühl',
			'Augenblick',
			'Fernweh',
			'Weltschmerz',
			'Stimmung',
			'Sehnsucht',
			'Einfühlung',
			'Erscheinung',
			'Verfremdung',
			'Lichtung',
			'Dasein',
			'Zwischenraum',
			'Formwille',
			'Kunstwollen',
			'Querschnitt',
			'Wanderlust',
			'Bildung',
			'Gestalt'
		],
		thumbnail: '/images/fonts/gq.png',
		theme: { bg: '#EDEAE3', fg: '#1a1a1a' },
		hero: {
			label: 'Neo Humanist Sans',
			vol: 'vol.02',
			subtitle: '(Mokuseki Sans)',
			debut: 'Coming soon',
			large: true,
			comingSoon: true,
			intro: 'The next cut from our foundry.',
			statement: 'Mokuseki Sans, maturing.'
		}
	},
	{
		slug: 'atom',
		name: 'Atom',
		order: 3,
		status: 'in-development',
		hidden: true,
		// No font files yet — render as Steiner for preview purposes
		fontFamily: 'Steiner',
		tagline: 'A display typeface in development.',
		description:
			'Atom is a display typeface currently in development at August Type Foundry. ' +
			'Further details on its design direction and release schedule will follow. ' +
			'Coming 2026.',
		descriptionJa:
			'Atom は August Type Foundry で現在開発中のディスプレイ書体です。デザインの方向性やリリース時期の詳細は、追ってお知らせします。2026年公開予定。',
		classification: 'Neo Grotesque · in development',
		// Provisional weights — same 12-stop axis as Steiner until spec is finalised
		weights: WEIGHTS,
		// One long German word per weight row (20) — physics / natural-philosophy vocabulary
		defaultTexts: [
			'Weltanschauung',
			'Quintessenz',
			'Elementarteilchen',
			'Wirklichkeit',
			'Naturphilosophie',
			'Kontinuum',
			'Raumzeit',
			'Unendlichkeit',
			'Materie',
			'Antimaterie',
			'Quantensprung',
			'Gleichgewicht',
			'Schwerkraft',
			'Lichtgeschwindigkeit',
			'Urknall',
			'Kristallgitter',
			'Wellenfunktion',
			'Singularität',
			'Übergang',
			'Urstoff'
		],
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
