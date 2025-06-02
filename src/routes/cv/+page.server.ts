import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	console.log('CV page session:', session);

	if (!session?.user) {
		return {
			user: null,
			technologies: [],
			cvCount: 0,
			cvs: []
		};
	}

	try {
		// Get user's technologies and CVs
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
						size: true,
						createdAt: true,
						updatedAt: true,
						parsedData: true
					},
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		});

		// Transform the CVs data for the frontend
		const transformedCVs = userData?.cvs.map(cv => {
			const parsedData = cv.parsedData as any;
			return {
				id: cv.id,
				originalName: cv.originalName,
				size: cv.size,
				createdAt: cv.createdAt,
				updatedAt: cv.updatedAt,
				summary: parsedData?.summary || parsedData?.personalInfo?.summary || 'No summary available',
				personalInfo: parsedData?.personalInfo || {},
				keywords: extractKeywordsFromParsedData(parsedData)?.slice(0, 5) || [],
				experienceCount: parsedData?.experience?.length || 0,
				educationCount: parsedData?.education?.length || 0,
				skillsCount: parsedData?.skills?.technical?.length || 0
			};
		}) || [];

		return {
			user: session.user,
			technologies: userData?.technologies || [],
			cvCount: userData?.cvs?.length || 0,
			cvs: transformedCVs
		};

	} catch (error) {
		console.error('Error loading CV page data:', error);
		return {
			user: session.user,
			technologies: [],
			cvCount: 0,
			cvs: []
		};
	}
};

// Helper function to extract keywords from parsed CV data
function extractKeywordsFromParsedData(parsedData: any): string[] {
	if (!parsedData) return [];
	
	const keywords: string[] = [];
	
	// Extract technical skills
	if (parsedData.skills?.technical) {
		keywords.push(...parsedData.skills.technical.map((skill: any) => skill.name || skill));
	}
	
	// Extract technologies from experience
	if (parsedData.experience) {
		parsedData.experience.forEach((exp: any) => {
			if (exp.technologies) {
				keywords.push(...exp.technologies.map((tech: any) => tech.name || tech));
			}
		});
	}
	
	// Extract technologies from projects
	if (parsedData.projects) {
		parsedData.projects.forEach((project: any) => {
			if (project.technologies) {
				keywords.push(...project.technologies.map((tech: any) => tech.name || tech));
			}
		});
	}
	
	// Remove duplicates and return first 10
	return [...new Set(keywords)].slice(0, 10);
} 