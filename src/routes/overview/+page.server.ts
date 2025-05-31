import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	let tech = [];
	if (!session?.user) {
		return {
			technologies: tech
		};
	}

	async function countsByName() {
		const rows = await prisma.technology.groupBy({
			by: ['name'],
			_count: {
				id: true
			},
			orderBy: {
				_count: {
					id: 'desc'
				}
			}
		});

		// rows has shape: Array<{ name: string; _count: { id: number } }>
		// If you only want the raw counts (without the name), you can map them.
		// But usually you’ll want both name + count:
		return rows.map((r) => ({
			name: r.name,
			count: r._count.id
		}));
	}

	countsByName()
		.then((list) => {
			console.log('test', list);
			tech = list;
		})
		.catch((e) => {
			console.error(e);
		})
		.finally(() => {
			prisma.$disconnect();
		});

	return {
		user: session.user,
		technologies: await countsByName()
	};
};
