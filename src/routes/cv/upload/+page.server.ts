import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	console.log('CV upload page session:', session);

	if (!session?.user) {
		return {
			user: null,
			technologies: [],
			cvCount: 0,
			existingCV: null
		};
	}

	try {
		// Get user's technologies and latest CV
		const userData = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: {
				technologies: {
					orderBy: {
						createdAt: 'desc'
					}
				},
				cvs: {
					select: {
						id: true,
						originalName: true,
						createdAt: true
					},
					orderBy: {
						createdAt: 'desc'
					},
					take: 1 // Only get the latest CV
				}
			}
		});

		return {
			user: session.user,
			technologies: userData?.technologies || [],
			cvCount: userData?.cvs?.length || 0,
			existingCV: userData?.cvs[0] || null
		};

	} catch (error) {
		console.error('Error loading CV upload page data:', error);
		return {
			user: session.user,
			technologies: [],
			cvCount: 0,
			existingCV: null
		};
	}
}; 