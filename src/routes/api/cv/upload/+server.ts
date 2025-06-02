import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import mammoth from 'mammoth';
import { parseCV, extractKeywords, generateCVSummary } from '$lib/utils/cv-parser';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const prisma = new PrismaClient();

// Use Grok for translation
const client = new OpenAI({
	baseURL: 'https://api.x.ai/v1',
	apiKey: OPENAI_API_KEY // This should be your xAI API key
});

interface CVData {
	personalInfo: {
		fullName: string;
		email?: string;
		phone?: string;
		location?: string;
		linkedIn?: string;
		website?: string;
		summary?: string;
	};
	experience: Array<{
		jobTitle: string;
		company: string;
		location?: string;
		startDate: string;
		endDate?: string;
		current?: boolean;
		description: string;
		achievements?: string[];
		technologies?: Array<{
			name: string;
			year: number;
		}>;
	}>;
	education: Array<{
		degree: string;
		institution: string;
		location?: string;
		startDate?: string;
		endDate?: string;
		gpa?: string;
		achievements?: string[];
	}>;
	skills: {
		technical?: Array<{
			name: string;
			lastUsedYear?: number;
			experienceLevel?: string;
		}>;
		soft?: string[];
		languages?: Array<{
			language: string;
			level: string;
		}>;
	};
	certifications?: Array<{
		name: string;
		issuer: string;
		date?: string;
		expiryDate?: string;
	}>;
	projects?: Array<{
		name: string;
		description: string;
		technologies?: Array<{
			name: string;
			year: number;
		}>;
		url?: string;
		startDate?: string;
		endDate?: string;
	}>;
	awards?: Array<{
		name: string;
		issuer: string;
		date?: string;
		description?: string;
	}>;
}

async function translateAndParseCV(rawText: string): Promise<CVData> {
	let jsonResponse: string | null = null;
	
	try {
		const prompt = `You are Grok, a professional CV parser and translator. Parse and translate the following CV text to English, then extract information into a structured JSON format.

IMPORTANT INSTRUCTIONS:
- First translate all content to English (if not already in English)
- Extract and organize information according to the schema below
- Pay special attention to extracting ALL technologies, programming languages, frameworks, tools, and technical skills mentioned anywhere in the CV
- Look for technologies in job descriptions, project descriptions, skills sections, and achievements
- Include both explicitly listed skills AND technologies mentioned in context (e.g., "developed using React" should include "React")
- For technical skills, be comprehensive - include programming languages, frameworks, databases, tools, cloud platforms, methodologies, etc.
- IMPORTANT: Extract the years when technologies were used based on work experience, projects, or education dates

Schema:
- personalInfo: full name, contact details, summary/objective
- experience: work history with job titles, companies, dates, descriptions, achievements, and technologies used with their usage years
- education: degrees, institutions, dates, achievements
- skills: 
  * technical: ALL programming languages, frameworks, tools, databases, cloud platforms, methodologies, etc. with last used years and experience levels
  * soft: communication, leadership, problem-solving skills
  * languages: spoken languages with proficiency levels
- certifications: professional certifications with issuers and dates
- projects: personal/professional projects with descriptions and technologies used with their years
- awards: awards, honors, recognition

IMPORTANT: For technologies mentioned in experience, projects, or skills, please determine the last year they were used:
- For ongoing/current positions: use current year (2024)
- For past positions: use the end year of that position
- For projects: use the project end year or completion year
- For technical skills: estimate the most recent year they were likely used based on work experience or projects

The technical skills should be an array of objects like:
{
  "name": "React",
  "lastUsedYear": 2024,
  "experienceLevel": "Advanced"
}

Experience and project technologies should be arrays of objects like:
{
  "name": "Python",
  "year": 2023
}

For dates, use formats like "2020-01", "2020-01-15", "Present", or "Current" for ongoing positions.
If information is missing or unclear, use null or omit the field.
Be thorough in technology extraction - scan the entire CV for any mention of technical tools, languages, or frameworks.

CV Text:
${rawText}

Please respond with only valid JSON following the schema above.`;

		const completion = await client.chat.completions.create({
			model: 'grok-2-latest',
			messages: [
				{
					role: 'system',
					content: 'You are Grok, a professional CV parsing and translation assistant. Parse CV content, translate to English, and extract comprehensive technical skills. Focus especially on identifying ALL technologies mentioned. Respond ONLY with valid JSON - no markdown formatting, no code blocks, no additional text. Just pure JSON.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.1,
			max_tokens: 6000
		});

		jsonResponse = completion.choices[0]?.message?.content;
		if (!jsonResponse) {
			throw new Error('No response from Grok');
		}

		// Extract JSON from markdown code blocks if present
		let cleanJsonString = jsonResponse.trim();
		
		// Check if response is wrapped in markdown code blocks
		if (cleanJsonString.startsWith('```json')) {
			cleanJsonString = cleanJsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
		} else if (cleanJsonString.startsWith('```')) {
			cleanJsonString = cleanJsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
		}

		// Parse and validate the JSON response
		const parsedData = JSON.parse(cleanJsonString) as CVData;
		
		// Ensure arrays and objects are properly initialized
		parsedData.experience = parsedData.experience || [];
		parsedData.education = parsedData.education || [];
		parsedData.skills = parsedData.skills || {};
		parsedData.certifications = parsedData.certifications || [];
		parsedData.projects = parsedData.projects || [];
		parsedData.awards = parsedData.awards || [];
		
		// Basic validation
		if (!parsedData.personalInfo || !parsedData.personalInfo.fullName) {
			throw new Error('Could not extract basic personal information from CV');
		}

		return parsedData;

	} catch (error) {
		console.error('CV parsing/translation error with Grok:', error);
		
		// Log the raw response for debugging
		if (error instanceof SyntaxError && jsonResponse) {
			console.error('JSON parsing failed. Raw response from Grok:', jsonResponse.substring(0, 500) + '...');
		}
		
		// Fallback: return basic structure with raw text
		return {
			personalInfo: {
				fullName: 'Unable to parse',
				summary: 'CV parsing failed. Raw text preserved.'
			},
			experience: [],
			education: [],
			skills: {},
			certifications: [],
			projects: [],
			awards: []
		};
	}
}

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check authentication
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get('cv') as File;
		const replaceExisting = formData.get('replaceExisting') === 'true';

		if (!file) {
			return json({ message: 'No file provided' }, { status: 400 });
		}

		// Validate file type
		if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
			return json({ message: 'Only DOCX files are supported' }, { status: 400 });
		}

		// Validate file size (10MB limit)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return json({ message: 'File too large. Maximum size is 10MB' }, { status: 400 });
		}

		// Extract text from DOCX
		const buffer = Buffer.from(await file.arrayBuffer());
		const result = await mammoth.extractRawText({ buffer });
		const rawText = result.value;

		if (!rawText.trim()) {
			return json({ message: 'Could not extract text from file' }, { status: 400 });
		}

		// Parse and translate CV using enhanced Grok parsing
		const parsedData = await translateAndParseCV(rawText);

		// Extract keywords and generate summary (for potential future use)
		const keywords = extractKeywords(parsedData);
		const summary = generateCVSummary(parsedData);

		let cv;

		if (replaceExisting) {
			// Find existing CV and replace it
			const existingCV = await prisma.cV.findFirst({
				where: { userId: session.user.id },
				orderBy: { createdAt: 'desc' }
			});

			if (existingCV) {
				// Update existing CV
				cv = await prisma.cV.update({
					where: { id: existingCV.id },
					data: {
						filename: `cv-${Date.now()}.docx`,
						originalName: file.name,
						mimeType: file.type,
						size: file.size,
						rawText,
						parsedData: parsedData as any, // Prisma Json type
						updatedAt: new Date()
					}
				});
			} else {
				// No existing CV found, create new one
				cv = await prisma.cV.create({
					data: {
						userId: session.user.id,
						filename: `cv-${Date.now()}.docx`,
						originalName: file.name,
						mimeType: file.type,
						size: file.size,
						rawText,
						parsedData: parsedData as any, // Prisma Json type
					}
				});
			}
		} else {
			// Create new CV (original behavior)
			cv = await prisma.cV.create({
				data: {
					userId: session.user.id,
					filename: `cv-${Date.now()}.docx`,
					originalName: file.name,
					mimeType: file.type,
					size: file.size,
					rawText,
					parsedData: parsedData as any, // Prisma Json type
				}
			});
		}

		return json({
			success: true,
			message: replaceExisting ? 'CV successfully updated!' : 'CV successfully uploaded!',
			cv: {
				id: cv.id,
				originalName: cv.originalName,
				size: cv.size,
				createdAt: cv.createdAt,
				summary: summary, // Return generated summary but don't save to DB
				keywords: keywords // Return generated keywords but don't save to DB
			}
		});

	} catch (error) {
		console.error('CV upload error:', error);
		return json(
			{ 
				message: error instanceof Error ? error.message : 'Upload failed',
				success: false 
			}, 
			{ status: 500 }
		);
	}
}; 