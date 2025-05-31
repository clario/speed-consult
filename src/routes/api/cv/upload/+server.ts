import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import mammoth from 'mammoth';
import { parseCV, extractKeywords, generateCVSummary } from '$lib/utils/cv-parser';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check if user is authenticated
		const session = await locals.auth();
		if (!session?.user?.id) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get('cv') as File;

		if (!file) {
			return json({ message: 'No file uploaded' }, { status: 400 });
		}

		// Validate file type
		if (!file.name.toLowerCase().endsWith('.docx')) {
			return json({ 
				message: 'Only DOCX files are supported' 
			}, { status: 400 });
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return json({ 
				message: 'File size must be less than 10MB' 
			}, { status: 400 });
		}

		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Extract text from DOCX using mammoth
		const { value: rawText } = await mammoth.extractRawText({ buffer });

		if (!rawText.trim()) {
			return json({ 
				message: 'Could not extract text from the document' 
			}, { status: 400 });
		}

		// Parse CV using AI
		console.log('Parsing CV with Grok AI...');
		const parsedData = await parseCV(rawText);

		// Extract keywords for search/matching
		const keywords = extractKeywords(parsedData);

		// Generate summary
		const summary = generateCVSummary(parsedData);

		// Save to database
		const cv = await prisma.cV.create({
			data: {
				userId: session.user.id,
				filename: `cv_${Date.now()}.docx`,
				originalName: file.name,
				mimeType: file.type,
				size: file.size,
				rawText,
				parsedData: {
					...parsedData,
					keywords,
					summary,
					processedAt: new Date().toISOString()
				}
			}
		});

		return json({
			message: 'CV uploaded and processed successfully',
			cv: {
				id: cv.id,
				originalName: cv.originalName,
				summary,
				personalInfo: parsedData.personalInfo,
				keywords: keywords.slice(0, 10), // Return top 10 keywords
				createdAt: cv.createdAt
			}
		}, { status: 201 });

	} catch (error) {
		console.error('CV upload error:', error);
		
		// Handle specific errors
		if (error instanceof Error) {
			if (error.message.includes('Grok')) {
				return json({ 
					message: 'AI processing failed. Please try again later.' 
				}, { status: 503 });
			}
		}

		return json({ 
			message: 'Failed to process CV. Please try again.' 
		}, { status: 500 });
	}
}; 