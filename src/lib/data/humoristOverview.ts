// Generated from the shipped Ango VF (the face sold as CONTEXT Humorist) by
// docs/gen_humorist_overview.py — the encoded characters by group, the vertical metrics and the
// Hyperglot language list (0.7.3, base support, validity=verified: the same
// method and thresholds as the spec table's language count). Regenerate whenever
// the shipped VF changes; do not edit by hand.

export interface GlyphGroup {
	title: string;
	/** The characters, in code point order. */
	chars: string;
}

export interface MetricLine {
	label: string;
	/** Font units (1000 per em), up from the baseline. */
	value: number;
}

export const HUMORIST_GLYPH_GROUPS: GlyphGroup[] = [
	{ title: 'Latin Uppercase', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
	{ title: 'Latin Lowercase', chars: 'abcdefghijklmnopqrstuvwxyz' },
	{ title: 'Accented Latin Uppercase', chars: 'ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝĀĒĪŌŠŪŸŽ' },
	{ title: 'Accented Latin Lowercase', chars: 'àáâãäåçèéêëìíîïñòóôõöùúûüýÿāēīōšūž' },
	{ title: 'Figures', chars: '0123456789²³¹¼½¾⁴' },
	{ title: 'Punctuation', chars: '!"#%&\'()*,-./:;?[\\]_{}¡§«¶·»¿–—‘’‚“”„•…‰‹›' },
	{ title: 'Symbols', chars: '$+<=>^`|~¢¥¦¨©¬®¯°±´¸×÷˜⁄€™−' },
	{ title: 'Other Letters', chars: 'µºÆÐØÞæðøþıŒœƒˆ' },
];

/** hhea ascent / descent: what the browser sets the line box from (os/2 typo: 800 / -200). */
export const HUMORIST_METRICS: MetricLine[] = [
	{ label: 'Ascender', value: 1000 },
	{ label: 'Cap height', value: 720 },
	{ label: 'x-height', value: 480 },
	{ label: 'Baseline', value: 0 },
	{ label: 'Descender', value: -200 }
];

export const HUMORIST_FEATURES: string[] = ['Kerning', 'Mark Positioning'];

export const HUMORIST_LANGUAGES: string[] = [
	'Afar',
	'Afrikaans',
	'Andaandi',
	'Anuta',
	'Aragonese',
	'Arbëreshë Albanian',
	'Basque',
	'Bemba (Zambia)',
	'Bikol',
	'Bislama',
	'Borana-Arsi-Guji Oromo',
	'Breton',
	'Catalan',
	'Cebuano',
	'Central Aymara',
	'Chamorro',
	'Chavacano',
	'Chiga',
	'Cornish',
	'Corsican',
	'Creek',
	'Danish',
	'Eastern Arrernte',
	'Eastern Oromo',
	'Faroese',
	'Fijian',
	'French',
	'Friulian',
	'Gheg Albanian',
	'Gilbertese',
	'Gusii',
	'Haitian',
	'Hopi',
	'Icelandic',
	'Iloko',
	'Indonesian',
	'Italian',
	'Jamaican Creole English',
	'Javanese',
	'Kabuverdianu',
	'Kalaallisut',
	'Kekchí',
	'Kenzi',
	'Luo (Kenya and Tanzania)',
	'Makonde',
	'Malagasy',
	'Manx',
	'Maori',
	'Minangkabau',
	'Mohawk',
	'Morisyen',
	'Murrinh-Patha',
	'Mwani',
	'Naga Pidgin',
	'Neapolitan',
	'Nobiin',
	'North Ndebele',
	'Norwegian',
	'Nyankole',
	'Orma',
	'Pampanga',
	'Papiamento',
	'Portuguese',
	'Potawatomi',
	'Quechua',
	'Rarotongan',
	'Romansh',
	'Rotokas',
	'Samoan',
	'Saramaccan',
	'Sena',
	'Seselwa Creole French',
	'Sicilian',
	'Soga',
	'Southern Aymara',
	'Southern Sotho',
	'Spanish',
	'Sranan Tongo',
	'Sundanese',
	'Swahili (individual language)',
	'Swiss German',
	'Tagalog',
	'Tetun Dili',
	'Tokelau',
	'Tonga (Tonga Islands)',
	'Tosk Albanian',
	'Tzotzil',
	'Võro',
	'Warlpiri',
	'Wayuu',
	'West Central Oromo',
	'Western Frisian',
];
