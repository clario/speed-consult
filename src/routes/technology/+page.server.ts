import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/prisma';
import { categorizeTechnology } from '$lib/utils/techCategories';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	console.log('Server session:', session);

	if (!session?.user) {
		return {
			user: null,
			technologies: [],
			cvCount: 0
		};
	}

	// Get user's technologies
	const technologies = await prisma.user
		.findUnique({
			where: { id: session.user.id },
			include: {
				technologies: {
					orderBy: {
						createdAt: 'desc'
					}
				},
				cvs: {
					select: { id: true } // Only get the count, not full CV data
				}
			}
		})
		.then((user) => ({
			technologies: user?.technologies || [],
			cvCount: user?.cvs?.length || 0
		}));

	return {
		user: session.user,
		technologies: technologies.technologies,
		cvCount: technologies.cvCount
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
		
		if (!technology) {
			return fail(400, { error: 'Technology name is required' });
		}

		// Convert to lowercase for consistency and to prevent duplicates
		const normalizedTechnology = technology.toLowerCase();

		// Automatically categorize the technology
		const autoType = categorizeTechnology(normalizedTechnology);
		console.log('Technology to add:', normalizedTechnology, 'Auto-categorized as:', autoType);

		try {
			await prisma.user.update({
				where: { id: session.user.id },
				data: {
					technologies: {
						create: {
							name: normalizedTechnology,
							type: autoType
						} as { name: string; type: string }
					}
				}
			});
			console.log('Created technology:', normalizedTechnology, 'of type:', autoType);

			return { success: true };
		} catch (error) {
			console.error('Error adding technology:', error);
			return fail(500, { error: 'Failed to add technology' });
		}
	}
} satisfies Actions;
