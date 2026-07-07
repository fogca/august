# august.tf Web Fonts

Only fonts actually referenced by the site live here. Old builds are archived
outside the repo (Projects/brands/August/Steiner/00_master/Export/).

| File | Used by | Loaded from |
|------|---------|-------------|
| `Steiner-VF57.woff2` | Site-wide primary typeface (variable, wght 1–950) | `src/app.html` @font-face |
| `MokusekiSans08-Regular.woff2` | Home-page wordmark (A.tf) | `src/app.html` @font-face |
| `otref-inter.woff2` | /opentype feature-reference demos | `OpenTypeReference.svelte` |
| `otref-garamond.woff2` | /opentype feature-reference demos | `OpenTypeReference.svelte` |

When shipping a new Steiner build: add the new `Steiner-VF##.woff2`, update the
`@font-face` src (and `?v=` cache-buster) in `src/app.html`, and DELETE the old
file — superseded builds must not remain publicly downloadable.
