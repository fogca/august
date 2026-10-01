# august.tf Web Fonts

Only fonts actually referenced by the site live here. Old builds are archived
outside the repo (Projects/brands/August/Steiner/00_master/Export/).

| File | Used by | Loaded from |
|------|---------|-------------|
| `Norma-VF09.woff2` | Site-wide primary typeface (variable, wght 1–950) — re-exported 2026-09-29. History: VF03-05 tightened/redrew `t`; VF06 tightened `s`; VF07 refined `N`/`t`; VF08 unified the accent anchor system (205 composites). **VF09** refines `A`'s outline — the width change cascades to every Aacute-type composite and to `parenleft`/`parenright.case` (sized off cap width); the only real change vs VF08, confirmed by a full byte-diff; all 985 kerning pairs unchanged. `baht`/`ogonekcomb` remain excluded. | `src/app.html` @font-face |
| `Elio-VF20.woff2` | Elio's own variable font — 2 masters, Hair (wght 150) / Ultra (wght 950, moved up from 850 on 2026-09-22 to make room for a full 9-stop named scale — 150 Hair/250 Thin/350 Light/450 Regular/550 Medium/650 Bold/750 Heavy/850 Black/950 Ultra). Early history (VF01-13): renamed from Asta, first Ultra composites wired up, mark-anchor bug fixed, kerning added, web-equivalent default letter-spacing, big Ultra-compatibility jump at VF11, Ō/ō added at VF13. VF15-16 (2026-09-29) shipped the weight-scheme change plus `N`/`M`/`S`/`dollar` outline touch-ups and new kerning pairs. VF17 (2026-09-30) shipped `yen` — its Ultra layer was missing the `Y` component reference entirely, restored by re-referencing Ultra's own `Y` the same way `dollar`/`cent`/`euro` already do. VF18 (same day) refined `G`/`K`/`R`/`f`/`g`/`t` outlines and touched up `yen` further. VF19 (same day) shipped `endash` too, plus outline refinement on `e`/`eacute`/`egrave`/`ecircumflex`/`edieresis`/`d`/`A`/`emdash`/`b`/`w`/`r`/`g`/`two`/`three`. **VF20** (2026-10-01) refines `s` further — no compatibility change. **151 glyphs ship** (measured cmap, unchanged since VF19). Still excluded: most remaining punctuation, `sterling` (its Hair layer is a single hand-drawn path, not a letter+bar composite like yen, so Ultra needs genuine freehand redraw rather than a component fix), and two unencoded stylistic-alternate slots (`three.ss01`, `t.ss01`). Build script: `Projects/brands/August/00_Typeface/Asta/Export/compile_vf.py`. | `src/app.html` @font-face |
| `MokusekiSans08-Regular.woff2` | Home-page wordmark, general use (v08) | `src/app.html` @font-face |
| `MokusekiSans01-Regular.woff2` | ANDERSEN logotype on the top-page KV (v01, first cut) | `src/app.html` @font-face |
| `otref-inter.woff2` | /opentype feature-reference demos | `OpenTypeReference.svelte` |
| `otref-garamond.woff2` | /opentype feature-reference demos | `OpenTypeReference.svelte` |

When shipping a new Norma build: add the new `Norma-VF##.woff2` (woff2
only — never ship the .ttf, it's a full desktop-installable font), update the
`@font-face` src (and `?v=` cache-buster) in `src/app.html`, and DELETE the old
file — superseded builds must not remain publicly downloadable.

Note (resolved 2026-09-05): earlier builds' internal name-table metadata
(Family/PostScript name) still said "Steiner" even after the site-wide
rename to "Norma" — only the filename/CSS/copy had been updated, not the
font binary itself. `build_vf.sh` (in the Glyphs source repo, outside this
one) now takes a 2nd argument for the family base name; VF02 was built with
`./build_vf.sh 02 Norma`, so the binary's own name table says "Norma" too.
