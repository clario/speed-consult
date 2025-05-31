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

		// Extract current technologies from CV
		const currentTechnologies = [];
		
		// Add technical skills
		if (cvData.skills?.technical) {
			currentTechnologies.push(...cvData.skills.technical);
		}

		// Add technologies from projects
		if (cvData.projects) {
			cvData.projects.forEach((project: any) => {
				if (project.technologies) {
					currentTechnologies.push(...project.technologies);
				}
			});
		}

		// Add technologies mentioned in experience
		if (cvData.experience) {
			cvData.experience.forEach((exp: any) => {
				// Simple extraction of common tech terms from descriptions
				const description = exp.description || '';
				const achievements = exp.achievements || [];
				const text = [description, ...achievements].join(' ');
				
				// Extract tech keywords (simplified)
				const techKeywords = extractTechFromText(text);
				currentTechnologies.push(...techKeywords);
			});
		}

		// Remove duplicates and normalize
		const uniqueCurrentTech = [...new Set(currentTechnologies.map(t => t.toLowerCase()))];

		// Create prompt for Grok AI analysis
		const prompt = `You are an expert technology learning advisor. Analyze the gap between a person's current knowledge and their desired learning technologies, then provide personalized learning recommendations.

CURRENT KNOWLEDGE (from CV):
${uniqueCurrentTech.join(', ')}

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
  "knowledgeGaps": "Key gaps between current knowledge and desired technologies, considering their self-assessed skill levels",
  "learningPath": [
    {
      "title": "Step title",
      "description": "What to learn and why, tailored to their current skill level",
      "resources": ["Recommended learning resources appropriate for their level"]
    }
  ],
  "timeEstimate": "Realistic timeline estimate considering their current skill levels"
}

Make the recommendations:
- Personalized based on their current experience level AND self-assessed skills
- Adjust difficulty and pace based on their skill assessment
- Practical and actionable
- Ordered by logical learning progression
- Include specific resources like courses, books, or projects appropriate for their level
- Consider their existing strengths as building blocks
- For technologies they already have some knowledge in, focus on advancing to the next level`;

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