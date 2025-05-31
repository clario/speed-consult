import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

export const GET = async () => {
	const client = new OpenAI({
		baseURL: 'https://api.x.ai/v1',
		apiKey: OPENAI_API_KEY
	});

	const completion = await client.chat.completions.create({
		model: 'grok-2-latest',
		messages: [
			{
				role: 'system',
				content: "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy."
			},
			{
				role: 'user',
				content: 'What is the meaning of life, the universe, and everything?'
			}
		]
	});

	return new Response(JSON.stringify(completion.choices[0].message), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' }
	});
};
