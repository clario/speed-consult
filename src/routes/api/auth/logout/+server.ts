import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	const session = await locals.getSession();
	if (session) {
		await locals.auth.signOut();
	}
	return json({ success: true });
};
