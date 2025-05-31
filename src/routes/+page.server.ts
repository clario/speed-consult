import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	console.log('Server session:', session);
	
	if (!session?.user) {
		return {
			user: null,
			technologies: []
		};
	}

	// Get user's technologies
	const technologies = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: {
			technologies: {
				orderBy: {
					createdAt: 'desc'
				}
			}
		}
	}).then(user => user?.technologies || []);

	return {
		user: session.user,
		technologies
	};
};

export const actions = {
	addTechnology: async ({ request, locals }) => {
		const session = await locals.getSession();
		console.log('Add technology session:', session);
		
		if (!session?.user) {
			return fail(401, { error: 'You must be logged in to add technologies' });
		}

		const data = await request.formData();
		const technology = data.get('technology')?.toString().trim();
		const type = data.get('type')?.toString().trim() || 'Other';
		console.log('Technology to add:', technology, 'Type:', type);

		if (!technology) {
			return fail(400, { error: 'Technology name is required' });
		}

		try {
			await prisma.user.update({
				where: { id: session.user.id },
				data: {
					technologies: {
						create: {
							name: technology,
							type: type
						} as { name: string; type: string }
					}
				}
			});
			console.log('Created technology:', technology, 'of type:', type);

			return { success: true };
		} catch (error) {
			console.error('Error adding technology:', error);
			return fail(500, { error: 'Failed to add technology' });
		}
	}
} satisfies Actions;
