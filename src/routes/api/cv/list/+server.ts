import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Check if user is authenticated
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		// Get user's CVs
		const cvs = await prisma.cV.findMany({
			where: {
				userId: session.user.id
			},
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
		});

		// Transform the data for the frontend
		const transformedCVs = cvs.map(cv => {
			const parsedData = cv.parsedData as any;
			return {
				id: cv.id,
				originalName: cv.originalName,
				size: cv.size,
				createdAt: cv.createdAt,
				updatedAt: cv.updatedAt,
				summary: parsedData?.summary || 'No summary available',
				personalInfo: parsedData?.personalInfo || {},
				keywords: parsedData?.keywords?.slice(0, 5) || [],
				experienceCount: parsedData?.experience?.length || 0,
				educationCount: parsedData?.education?.length || 0,
				skillsCount: parsedData?.skills?.technical?.length || 0
			};
		});

		return json({
			cvs: transformedCVs,
			count: transformedCVs.length
		});

	} catch (error) {
		console.error('CV list error:', error);
		return json({ 
			message: 'Failed to retrieve CVs' 
		}, { status: 500 });
	}
}; 