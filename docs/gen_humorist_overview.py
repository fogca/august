"""Generate src/lib/data/humoristOverview.ts from the shipped Ango VF (the face
sold as APGR Humorist): the encoded glyphs by group, the vertical metrics and
the Hyperglot language list. Run from anywhere:

    python3 docs/gen_humorist_overview.py <path to Ango-VF*.woff2> <out .ts>
"""
import sys
import unicodedata

from fontTools.ttLib import TTFont
from hyperglot.checker import FontChecker

font_path, out_path = sys.argv[1], sys.argv[2]
font = TTFont(font_path)
cmap = font.getBestCmap()
os2, hhea, post = font['OS/2'], font['hhea'], font['post']

chars = [chr(cp) for cp in sorted(cmap) if cp > 0x20 and cp != 0xA0 and unicodedata.category(chr(cp)) != 'Cc']


def base_letter(c):
    d = unicodedata.normalize('NFD', c)
    return d[0] if len(d) > 1 and d[0].isascii() and d[0].isalpha() else None


groups = {
    'Latin Uppercase': [], 'Latin Lowercase': [],
    'Accented Latin Uppercase': [], 'Accented Latin Lowercase': [],
    'Figures': [], 'Punctuation': [], 'Symbols': [], 'Marks': [], 'Other Letters': [],
}
for c in chars:
    cat = unicodedata.category(c)
    if c.isascii() and c.isalpha():
        groups['Latin Uppercase' if c.isupper() else 'Latin Lowercase'].append(c)
    elif cat in ('Lu', 'Ll') and base_letter(c):
        groups['Accented Latin Uppercase' if cat == 'Lu' else 'Accented Latin Lowercase'].append(c)
    elif cat.startswith('N'):
        groups['Figures'].append(c)
    elif cat.startswith('P'):
        groups['Punctuation'].append(c)
    elif cat.startswith('S'):
        groups['Symbols'].append(c)
    elif cat.startswith('M'):
        groups['Marks'].append(c)
    else:
        groups['Other Letters'].append(c)

# GPOS feature tags -> the names a reader knows them by
gpos = sorted({fr.FeatureTag for fr in font['GPOS'].table.FeatureList.FeatureRecord}) if 'GPOS' in font else []
gsub = sorted({fr.FeatureTag for fr in font['GSUB'].table.FeatureList.FeatureRecord}) if 'GSUB' in font else []
NAMES = {'kern': 'Kerning', 'mark': 'Mark Positioning', 'mkmk': 'Mark to Mark Positioning'}
features = [NAMES.get(t, t) for t in gpos + gsub]

res = FontChecker(font_path).get_supported_languages(supportlevel='base', validity='verified')
languages = sorted(d.get('name') or iso for langs in res.values() for iso, d in langs.items())


def js(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


lines = []
lines.append("// Generated from the shipped Ango VF (the face sold as APGR Humorist) by")
lines.append("// docs/gen_humorist_overview.py — the encoded characters by group, the vertical metrics and the")
lines.append("// Hyperglot language list (0.7.3, base support, validity=verified: the same")
lines.append("// method and thresholds as the spec table's language count). Regenerate whenever")
lines.append("// the shipped VF changes; do not edit by hand.")
lines.append('')
lines.append('export interface GlyphGroup {')
lines.append('\ttitle: string;')
lines.append('\t/** The characters, in code point order. */')
lines.append('\tchars: string;')
lines.append('}')
lines.append('')
lines.append('export interface MetricLine {')
lines.append('\tlabel: string;')
lines.append('\t/** Font units (1000 per em), up from the baseline. */')
lines.append('\tvalue: number;')
lines.append('}')
lines.append('')
lines.append('export const HUMORIST_GLYPH_GROUPS: GlyphGroup[] = [')
# Combining marks are left out: on their own they have no base to sit on.
for title, cs in groups.items():
    if cs and title != 'Marks':
        lines.append(f"\t{{ title: {js(title)}, chars: {js(''.join(cs))} }},")
lines.append('];')
lines.append('')
lines.append(f'/** hhea ascent / descent: what the browser sets the line box from (os/2 typo: {os2.sTypoAscender} / {os2.sTypoDescender}). */')
lines.append('export const HUMORIST_METRICS: MetricLine[] = [')
lines.append(f"\t{{ label: 'Ascender', value: {hhea.ascent} }},")
lines.append(f"\t{{ label: 'Cap height', value: {os2.sCapHeight} }},")
lines.append(f"\t{{ label: 'x-height', value: {os2.sxHeight} }},")
lines.append("\t{ label: 'Baseline', value: 0 },")
lines.append(f"\t{{ label: 'Descender', value: {hhea.descent} }}")
lines.append('];')
lines.append('')
lines.append('export const HUMORIST_FEATURES: string[] = [' + ', '.join(js(f) for f in features) + '];')
lines.append('')
lines.append('export const HUMORIST_LANGUAGES: string[] = [')
for n in languages:
    lines.append(f'\t{js(n)},')
lines.append('];')
open(out_path, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('glyphs', len(chars), {k: len(v) for k, v in groups.items() if v}, 'features', features, 'languages', len(languages), 'hhea', hhea.ascent, hhea.descent, 'typo', os2.sTypoAscender, os2.sTypoDescender, 'fsSelection bit7', bool(os2.fsSelection & (1 << 7)))
