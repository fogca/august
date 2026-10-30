import { error, redirect } from '@sveltejs/kit';
import { LEGACY_SLUGS, getTypeface } from '$lib/data/typefaces.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = ({ params }) => {
	// Pre-rename addresses (/fonts/ango, /fonts/gq …) go to the new page for good.
	const renamed = LEGACY_SLUGS[params.slug];
	if (renamed) {
		redirect(301, `/fonts/${renamed}`);
	}

	const typeface = getTypeface(params.slug);

	// Hidden typefaces are unannounced — keep them out of direct URL reach too.
	if (!typeface || typeface.hidden) {
		error(404, `Typeface "${params.slug}" not found`);
	}

	return { typeface };
};
