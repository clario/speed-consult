import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const prisma = new PrismaClient();

// Use Grok for learning path analysis
const client = new OpenAI({
	baseURL: 'https://api.x.ai/v1',
	apiKey: OPENAI_API_KEY // This should be your xAI API key
});

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check authentication
		const session = await locals.auth();
		if (!session?.user?.id) {
			return json({ message: 'Authentication required' }, { status: 401 });
		}

		const { learningTechnologies, skillAssessment } = await request.json();

		if (!learningTechnologies || !Array.isArray(learningTechnologies)) {
			return json({ message: 'Learning technologies are required' }, { status: 400 });
		}

		// Get user's CV data to understand their current knowledge
		const userWithCV = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: {
				cvs: {
					orderBy: { createdAt: 'desc' },
					take: 1 // Get the most recent CV
				}
			}
		});

		if (!userWithCV?.cvs || userWithCV.cvs.length === 0) {
			return json({ message: 'No CV found. Please upload your CV first.' }, { status: 400 });
		}

		const cv = userWithCV.cvs[0];
		const cvData = cv.parsedData as any;

		// Extract current technologies from CV with their usage years
		const currentTechnologies: Array<{name: string, lastUsedYear?: number}> = [];
		
		// Add technical skills with their last used years
		if (cvData.skills?.technical) {
			cvData.skills.technical.forEach((skill: any) => {
				currentTechnologies.push({
					name: skill.name.toLowerCase(),
					lastUsedYear: skill.lastUsedYear
				});
			});
		}

		// Add technologies from projects with their years
		if (cvData.projects) {
			cvData.projects.forEach((project: any) => {
				if (project.technologies) {
					project.technologies.forEach((tech: any) => {
						currentTechnologies.push({
							name: tech.name.toLowerCase(),
							lastUsedYear: tech.year
						});
					});
				}
			});
		}

		// Add technologies from experience with their years
		if (cvData.experience) {
			cvData.experience.forEach((exp: any) => {
				if (exp.technologies) {
					exp.technologies.forEach((tech: any) => {
						currentTechnologies.push({
							name: tech.name.toLowerCase(),
							lastUsedYear: tech.year
						});
					});
				}
				
				// Also extract tech keywords from descriptions (fallback)
				const description = exp.description || '';
				const achievements = exp.achievements || [];
				const text = [description, ...achievements].join(' ');
				
				// Extract tech keywords and estimate their year based on work period
				const techKeywords = extractTechFromText(text);
				const workEndYear = exp.endDate ? new Date(exp.endDate).getFullYear() : (exp.current ? new Date().getFullYear() : undefined);
				
				techKeywords.forEach(tech => {
					currentTechnologies.push({
						name: tech.toLowerCase(),
						lastUsedYear: workEndYear
					});
				});
			});
		}

		// Create a map of technologies with their most recent usage year
		const techUsageMap = new Map<string, number>();
		currentTechnologies.forEach(tech => {
			const current = techUsageMap.get(tech.name);
			if (!current || (tech.lastUsedYear && tech.lastUsedYear > current)) {
				techUsageMap.set(tech.name, tech.lastUsedYear || new Date().getFullYear());
			}
		});

		// Create technology usage summary for the prompt
		const technologyUsageSummary = Array.from(techUsageMap.entries())
			.map(([tech, year]) => {
				const yearsAgo = new Date().getFullYear() - year;
				return `${tech}: last used ${year}${yearsAgo > 0 ? ` (${yearsAgo} years ago)` : ' (current)'}`;
			})
			.join('\n');

		// Create prompt for Grok AI analysis
		const prompt = `You are an expert technology learning advisor. Analyze the gap between a person's current knowledge and their desired learning technologies, then provide personalized learning recommendations that account for technology evolution over time.

CURRENT KNOWLEDGE WITH USAGE TIMELINE (from CV):
${technologyUsageSummary}

DESIRED TECHNOLOGIES TO LEARN:
${learningTechnologies.join(', ')}

SELF-ASSESSED SKILL LEVELS:
${skillAssessment ? Object.entries(skillAssessment).map(([tech, level]) => `${tech}: ${getSkillLevelText(level as number)}`).join('\n') : 'No self-assessment provided'}

PERSONAL BACKGROUND:
- Name: ${cvData.personalInfo?.fullName || 'User'}
- Experience Level: ${cvData.experience?.length || 0} work experiences
- Education: ${cvData.education?.map((e: any) => e.degree).join(', ') || 'Not specified'}

Please provide a comprehensive learning analysis in the following JSON format:

{
  "currentStrengths": "A summary of their existing technical strengths and relevant experience",
  "knowledgeGaps": "Key gaps between current knowledge and desired technologies, considering their self-assessed skill levels AND how much technologies have evolved since they last used them",
  "technologyEvolution": [
    {
      "technology": "Technology name",
      "lastUsedYear": 2021,
      "yearsSince": 3,
      "majorDevelopments": [
        "Key development 1",
        "Key development 2",
        "Key development 3"
      ],
      "newFeatures": [
        "Important new feature 1",
        "Important new feature 2"
      ],
      "breakingChanges": [
        "Breaking change 1 (if any)"
      ],
      "learningPriority": "High|Medium|Low"
    }
  ],
  "learningPath": [
    {
      "title": "Step title",
      "description": "What to learn and why, tailored to their current skill level and considering technology evolution",
      "resources": ["Recommended learning resources appropriate for their level and focusing on what's new since their last usage"]
    }
  ],
  "timeEstimate": "Realistic timeline estimate considering their current skill levels and the evolution gap"
}

Make the recommendations:
- Personalized based on their current experience level AND self-assessed skills
- Account for technology evolution since their last usage (e.g., if they used React 3 years ago, focus on what's new in React since then)
- For the technologyEvolution section, identify specific technologies they know but haven't used recently and provide detailed analysis of what's changed
- Include major version updates, new features, paradigm shifts, breaking changes, and ecosystem developments
- Prioritize technologies based on how much they've evolved and how relevant the changes are
- Adjust difficulty and pace based on their skill assessment and how outdated their knowledge might be
- Practical and actionable
- Ordered by logical learning progression
- Include specific resources like courses, books, or projects appropriate for their level and focusing on recent developments
- Consider their existing strengths as building blocks
- For technologies they already have some knowledge in, focus on advancing to the next level and catching up with recent changes
- Highlight major changes or new paradigms in technologies they haven't used recently`;

		const completion = await client.chat.completions.create({
			model: 'grok-2-latest',
			messages: [
				{
					role: 'system',
					content: 'You are Grok, an expert learning advisor specializing in technology career development. Provide personalized, actionable learning recommendations. Respond ONLY with valid JSON - no markdown formatting, no code blocks, no additional text.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.3,
			max_tokens: 4000
		});

		let analysisResponse = completion.choices[0]?.message?.content;
		if (!analysisResponse) {
			throw new Error('No response from Grok');
		}

		// Clean JSON response (remove code blocks if present)
		let cleanJsonString = analysisResponse.trim();
		if (cleanJsonString.startsWith('```json')) {
			cleanJsonString = cleanJsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
		} else if (cleanJsonString.startsWith('```')) {
			cleanJsonString = cleanJsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
		}

		const analysis = JSON.parse(cleanJsonString);

		return json({
			success: true,
			analysis
		});

	} catch (error) {
		console.error('Learning path analysis error:', error);
		return json(
			{ 
				message: error instanceof Error ? error.message : 'Analysis failed',
				success: false 
			}, 
			{ status: 500 }
		);
	}
};

function extractTechFromText(text: string): string[] {
	if (!text) return [];
	
	const commonTechTerms = [
		'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
		'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js', 'gatsby',
		'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'laravel', 'rails',
		'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket',
		'aws', 'azure', 'gcp', 'google cloud', 'digital ocean', 'heroku', 'vercel', 'netlify',
		'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
		'git', 'ci/cd', 'devops', 'terraform', 'ansible', 'puppet', 'chef',
		'linux', 'ubuntu', 'centos', 'debian', 'windows', 'macos',
		'html', 'css', 'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'material-ui',
		'webpack', 'vite', 'parcel', 'rollup', 'babel', 'eslint', 'prettier',
		'jest', 'cypress', 'selenium', 'mocha', 'chai', 'karma', 'jasmine',
		'graphql', 'rest', 'api', 'microservices', 'websockets', 'grpc'
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

function getSkillLevelText(level: number): string {
	switch (level) {
		case 0: return 'Beginner (No experience or knowledge)';
		case 1: return 'Novice (Basic understanding, minimal hands-on experience)';
		case 2: return 'Intermediate (Comfortable with fundamentals, some practical experience)';
		case 3: return 'Advanced (Proficient, can work independently on complex tasks)';
		case 4: return 'Expert (Expert level, can teach others and solve complex problems)';
		default: return 'Beginner (No experience or knowledge)';
	}
} 