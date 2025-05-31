// src/routes/api/bergen/+server.ts

import { xai } from '@ai-sdk/xai';
import { streamText } from 'ai';

export const GET = async () => {
	// 1) Start the stream but do NOT directly call toDataStreamResponse() in the return.
	const result = streamText({
		model: xai('grok-2-1212'),
		prompt: 'Fortell litt om Bergen.'
	});

	// 2) Ask for the Fetch-Response that would have been streamed to the client
	const streamingResponse = await result.toDataStreamResponse();

	// 3) Grab the ReadableStream<Uint8Array> and set up a reader
	const reader = streamingResponse.body!.getReader();
	const decoder = new TextDecoder('utf-8');

	let buffer = ''; // holds partial lines between “\n” boundaries
	let fullText = ''; // the final concatenated output

	while (true) {
		// 4) Read next Uint8Array chunk:
		const { done, value } = await reader.read();
		if (done) break;

		// 5) Decode it to text (UTF-8) and append to our buffer
		buffer += decoder.decode(value, { stream: true });

		// 6) Split on newline: each “line” is one SSE event prefix + payload
		const lines = buffer.split('\n');
		// The last element might be a partial line, so put it back in buffer
		buffer = lines.pop()!;

		// 7) Process each complete line:
		for (const line of lines) {
			// - Lines beginning with `f:` are just metadata (e.g. {"messageId":...})
			//   We ignore them entirely.
			// - Lines beginning with `0:` carry the actual token text, wrapped in quotes.
			//   e.g.: `0:"Bergen"`, `0:" er"`, etc.
			if (line.startsWith('0:')) {
				// strip off `0:` prefix
				let payload = line.slice(2);

				// if it’s wrapped in quotes (which it normally is), remove them:
				if (payload.startsWith('"') && payload.endsWith('"')) {
					payload = payload.slice(1, -1);
				}

				fullText += payload;
			}
			// any other prefixes (e.g. `1:` or blank lines) can be safely ignored here
		}
	}

	// 8) After the loop, we may still have one last “partial” line in buffer:
	if (buffer.startsWith('0:')) {
		let payload = buffer.slice(2);
		if (payload.startsWith('"') && payload.endsWith('"')) {
			payload = payload.slice(1, -1);
		}
		fullText += payload;
	}

	// 4) Return JSON instead of raw text
	const jsonResponse = { text: fullText };
	return new Response(JSON.stringify(jsonResponse), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' }
	});
};
