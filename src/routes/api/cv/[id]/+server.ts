import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		// Check if user is authenticated
		const session = await locals.auth();
		if (!session?.user?.id) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const cvId = params.id;
		if (!cvId) {
			return json({ message: 'CV ID is required' }, { status: 400 });
		}

		// Get CV with ownership check
		const cv = await prisma.cV.findFirst({
			where: {
				id: cvId,
				userId: session.user.id
			}
		});

		if (!cv) {
			return json({ message: 'CV not found' }, { status: 404 });
		}

		return json({
			cv: {
				id: cv.id,
				originalName: cv.originalName,
				size: cv.size,
				createdAt: cv.createdAt,
				updatedAt: cv.updatedAt,
				rawText: cv.rawText,
				parsedData: cv.parsedData
			}
		});

	} catch (error) {
		console.error('CV detail error:', error);
		return json({ 
			message: 'Failed to retrieve CV details' 
		}, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		// Check if user is authenticated
		const session = await locals.auth();
		if (!session?.user?.id) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const cvId = params.id;
		if (!cvId) {
			return json({ message: 'CV ID is required' }, { status: 400 });
		}

		// Delete CV with ownership check
		const deletedCV = await prisma.cV.deleteMany({
			where: {
				id: cvId,
				userId: session.user.id
			}
		});

		if (deletedCV.count === 0) {
			return json({ message: 'CV not found' }, { status: 404 });
		}

		return json({ message: 'CV deleted successfully' });

	} catch (error) {
		console.error('CV delete error:', error);
		return json({ 
			message: 'Failed to delete CV' 
		}, { status: 500 });
	}
}; 