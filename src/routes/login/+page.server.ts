import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	if (session?.user) {
		// Already logged in, redirect to home
		throw redirect(303, '/');
	}
	return {};
};
