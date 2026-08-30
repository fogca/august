# august.tf Web Fonts

Only fonts actually referenced by the site live here. Old builds are archived
outside the repo (Projects/brands/August/Steiner/00_master/Export/).

| File | Used by | Loaded from |
|------|---------|-------------|
| `Atom-VF75.woff2` | Site-wide primary typeface (variable, wght 1–950) — renamed from `Steiner-VF75.woff2` 2026-08-30 | `src/app.html` @font-face |
| `MokusekiSans08-Regular.woff2` | Home-page wordmark, general use (v08) | `src/app.html` @font-face |
| `MokusekiSans01-Regular.woff2` | ANDERSEN logotype on the top-page KV (v01, first cut) | `src/app.html` @font-face |
| `otref-inter.woff2` | /opentype feature-reference demos | `OpenTypeReference.svelte` |
| `otref-garamond.woff2` | /opentype feature-reference demos | `OpenTypeReference.svelte` |

When shipping a new Atom build: add the new `Atom-VF##.woff2` (woff2
only — never ship the .ttf, it's a full desktop-installable font), update the
`@font-face` src (and `?v=` cache-buster) in `src/app.html`, and DELETE the old
file — superseded builds must not remain publicly downloadable.

Note: the underlying font binary's own internal name-table metadata
(Family/PostScript name) still says "Steiner" — this rename only covers the
website (filename, CSS, copy). A true rebuild with the name table updated
needs the Glyphs source + VF pipeline, which lives outside this repo.
