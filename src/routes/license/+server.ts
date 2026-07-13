// Stable short licence URL — embedded in the font name table (nameID 13/14)
// and printable on licence certificates. Redirects to the canonical EULA so
// the shipped fonts never carry a route that can rot.
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	throw redirect(301, '/legal/eula');
};
