import { error } from '@sveltejs/kit';
import { getTypeface } from '$lib/data/typefaces.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = ({ params }) => {
	const typeface = getTypeface(params.slug);

	// Hidden typefaces are unannounced — keep them out of direct URL reach too.
	if (!typeface || typeface.hidden) {
		error(404, `Typeface "${params.slug}" not found`);
	}

	return { typeface };
};
