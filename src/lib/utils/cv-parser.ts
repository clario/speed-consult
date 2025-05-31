import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

// Use Grok instead of OpenAI for CV parsing
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
		technical?: string[];
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
		technologies?: string[];
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

export async function parseCV(rawText: string): Promise<CVData> {
	let jsonResponse: string | null = null;
	
	try {
		const prompt = `You are a professional CV parser powered by Grok. Parse the following CV text and extract information into a structured JSON format. 

Please extract and organize the information according to this schema:
- personalInfo: full name, contact details, summary/objective
- experience: work history with job titles, companies, dates, descriptions
- education: degrees, institutions, dates, achievements
- skills: technical skills, soft skills, languages with proficiency levels
- certifications: professional certifications with issuers and dates
- projects: personal/professional projects with descriptions and technologies
- awards: awards, honors, recognition

For dates, use formats like "2020-01", "2020-01-15", "Present", or "Current" for ongoing positions.
If information is missing or unclear, use null or omit the field.
Be thorough but accurate - don't make up information that isn't clearly stated.

CV Text:
${rawText}

Please respond with only valid JSON following the schema above.`;

		const completion = await client.chat.completions.create({
			model: 'grok-2-latest',
			messages: [
				{
					role: 'system',
					content: 'You are Grok, a professional CV parsing assistant. Extract and structure CV information into JSON format. Respond ONLY with valid JSON - no markdown formatting, no code blocks, no additional text. Just pure JSON.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.1,
			max_tokens: 4000
		});

		jsonResponse = completion.choices[0]?.message?.content;
		if (!jsonResponse) {
			throw new Error('No response from Grok');
		}

		// Extract JSON from markdown code blocks if present
		let cleanJsonString = jsonResponse.trim();
		
		// Check if response is wrapped in markdown code blocks
		if (cleanJsonString.startsWith('```json')) {
			// Remove ```json from start and ``` from end
			cleanJsonString = cleanJsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
		} else if (cleanJsonString.startsWith('```')) {
			// Remove ``` from start and end (generic code blocks)
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
		console.error('CV parsing error with Grok:', error);
		
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

export function extractKeywords(cvData: CVData): string[] {
	const keywords: string[] = [];
	
	// Extract from skills
	if (cvData.skills.technical) {
		keywords.push(...cvData.skills.technical);
	}
	
	// Extract from experience (job titles and key technologies)
	cvData.experience.forEach(exp => {
		if (exp.jobTitle) keywords.push(exp.jobTitle);
		if (exp.company) keywords.push(exp.company);
		// Extract common tech keywords from descriptions
		if (exp.description) {
			const techKeywords = extractTechKeywordsFromText(exp.description);
			keywords.push(...techKeywords);
		}
	});
	
	// Extract from education
	cvData.education.forEach(edu => {
		if (edu.degree) keywords.push(edu.degree);
		if (edu.institution) keywords.push(edu.institution);
	});
	
	// Extract from certifications
	cvData.certifications?.forEach(cert => {
		if (cert.name) keywords.push(cert.name);
		if (cert.issuer) keywords.push(cert.issuer);
	});
	
	// Extract from projects
	cvData.projects?.forEach(project => {
		if (project.technologies) {
			keywords.push(...project.technologies);
		}
	});
	
	// Clean and deduplicate
	return [...new Set(keywords)]
		.filter(keyword => keyword && keyword.length > 2)
		.map(keyword => keyword.toLowerCase().trim());
}

function extractTechKeywordsFromText(text: string): string[] {
	if (!text || typeof text !== 'string') {
		return [];
	}
	
	const commonTechTerms = [
		'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
		'node.js', 'express', 'django', 'flask', 'spring', 'docker', 'kubernetes',
		'aws', 'azure', 'gcp', 'mysql', 'postgresql', 'mongodb', 'redis',
		'git', 'jenkins', 'ci/cd', 'agile', 'scrum', 'rest api', 'graphql',
		'microservices', 'devops', 'machine learning', 'ai', 'data science'
	];
	
	const foundTerms: string[] = [];
	const lowerText = text.toLowerCase();
	
	commonTechTerms.forEach(term => {
		if (lowerText.includes(term)) {
			foundTerms.push(term);
		}
	});
	
	return foundTerms;
}

export function generateCVSummary(cvData: CVData): string {
	const experience = cvData.experience?.length || 0;
	const skills = cvData.skills?.technical?.length || 0;
	const education = cvData.education?.length || 0;
	
	const currentRole = cvData.experience?.find(exp => exp.current)?.jobTitle || 
		cvData.experience?.[0]?.jobTitle || 'Professional';
	
	const topSkills = cvData.skills?.technical?.slice(0, 5).join(', ') || 'Various technologies';
	
	return `${currentRole} with ${experience} work experience${experience > 1 ? 's' : ''}, ${education} education record${education > 1 ? 's' : ''}, and expertise in ${topSkills}.`;
} 