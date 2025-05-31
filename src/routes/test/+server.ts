import { streamText } from 'ai';
import { xai } from '@ai-sdk/xai';

export const GET = async () => {
	const result = streamText({
		model: xai('grok-2-1212'),
		prompt: 'Fortell litt om Bergen.'
	});

	return result.toDataStreamResponse();
};
