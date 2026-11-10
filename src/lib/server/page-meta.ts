// Per-page Open Graph / Twitter tags (2026-11-11, at the user's request —
// "OGPも対応してね"). app.html carries site-wide defaults; every page already
// sets its own <title> and meta description, so the share tags are filled in
// from those here rather than repeated in each page: og:title / twitter:title
// from the <title>, og:description / twitter:description from the
// description, plus og:url and a canonical link on the site's own origin.

export const SITE_ORIGIN = 'https://timetokyo.pages.dev';

const TITLE_RE = /<title>([^<]*)<\/title>/;
const DESCRIPTION_RE = /<meta\s+name="description"\s+content="([^"]*)"/;

function setContent(html: string, attr: 'property' | 'name', key: string, value: string): string {
	const tag = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
	return html.replace(tag, `$1${value}$2`);
}

/** Fills the share tags from the page's own title and description. */
export function applyPageMeta(html: string, pathname: string): string {
	const title = html.match(TITLE_RE)?.[1]?.replaceAll('"', '&quot;');
	const description = html.match(DESCRIPTION_RE)?.[1];
	let out = html;
	if (title) {
		out = setContent(out, 'property', 'og:title', title);
		out = setContent(out, 'name', 'twitter:title', title);
	}
	if (description) {
		out = setContent(out, 'property', 'og:description', description);
		out = setContent(out, 'name', 'twitter:description', description);
	}
	const url = SITE_ORIGIN + pathname;
	return out.replace(
		'<meta property="og:type" content="website" />',
		`<meta property="og:type" content="website" />\n\t\t<meta property="og:url" content="${url}" />\n\t\t<link rel="canonical" href="${url}" />`
	);
}
