# august.tf Web Fonts

Only fonts actually referenced by the site live here. Old builds are archived
outside the repo (Projects/brands/August/Steiner/00_master/Export/).

| File | Used by | Loaded from |
|------|---------|-------------|
| `Norma-VF02.woff2` | Site-wide primary typeface (variable, wght 1–950) — re-exported 2026-09-05. Fixes since VF01: `t` had a Book-only topology mismatch vs Hair/Ultra (Book's shape replaced with the Hair/Ultra-interpolated one, t=(400-1)/(950-1), since those two already agreed); `baht` and `ogonekcomb` are newly master-incompatible and are excluded entirely (ogonekcomb's removal cascades to Aogonek/Eogonek/Iogonek/Uogonek + `.smcp` + standalone `ogonek`, which reference it as a component); `germandbls` remains excluded as before (Hair-only, never finished). This build also finally bakes "Norma" into the binary's own name table (`build_vf.sh`'s 2nd arg) — see the note below, now resolved. | `src/app.html` @font-face |
| `Elio-VF01.woff2` | Elio's own font — now a real variable font (2026-09-02), superseding the earlier Hair-only static build. 2 masters, Hair (wght 150) / Ultra (wght 850), full range interpolated between them; 8 named instances at 150/250/350/450(Regular)/550/650/750/850. Built from `Asta.glyphs` (internal working-name source file, publicly renamed "Elio" 2026-08-31) via Glyphs' own `ExportDesignspaceAndUFO` + ufo2ft — glyphsLib's direct `.glyphs` parser errors on this file's format-4 node data, so the designspace/UFO route is required, not the raw-file route Norma's build script uses. 174 glyphs (Western European accented letters, punctuation, math symbols, currency/marks ¢ £ ¥ € © ® ™); still no AE/ae, Thorn/thorn, germandbls, ampersand, at-sign, or fractions. Build script: `Projects/brands/August/00_Typeface/Asta/Export/compile_vf.py` | `src/app.html` @font-face |
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
