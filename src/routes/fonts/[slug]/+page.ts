import { error } from '@sveltejs/kit';
import { getTypeface } from '$lib/data/typefaces.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = ({ params }) => {
	const typeface = getTypeface(params.slug);

	if (!typeface) {
		error(404, `Typeface "${params.slug}" not found`);
	}

	return { typeface };
};
