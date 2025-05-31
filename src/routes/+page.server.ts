import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	if (!session?.user) {
		return {
			user: null,
			technologies: []
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
				}
			}
		})
		.then((user) => user?.technologies || []);

	return {
		user: session.user,
		technologies
	};
};
