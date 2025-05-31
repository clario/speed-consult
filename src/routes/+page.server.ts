import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionCookie = cookies.get('session');
	let user = null;

	if (sessionCookie) {
		try {
			const session = JSON.parse(sessionCookie);
			user = session.user;
		} catch (error) {
			console.error('Error parsing session cookie:', error);
		}
	}

	return {
		user
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete('session', { path: '/' });
		throw redirect(303, '/');
	}
};
