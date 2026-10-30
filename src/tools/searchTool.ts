import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchDuckDuckGo } from '@/searchDuckDuckGo';
import { extractWebContent } from '@/extractWebContent';

export const registerSearchTool = (server: McpServer): void => {
	server.registerTool(
		'search',
		{
			description: 'Searches the web with DuckDuckGo and Playwright, then extracts page text to improve answers with up-to-date content. Use for current information and documentation (APIs, libraries, frameworks, guides). If results don\'t contain what you need, search again with different terms.',
			inputSchema: {
				query: z.string().describe('Search terms'),
				numResults: z
					.number()
					.default(3)
					.describe('Number of results to extract (default: 3, max recommended: 5)'),
			},
		},
		async ({ query, numResults }) => {
			const searchResults = await searchDuckDuckGo(query, numResults);

			// Extrae cada resultado en paralelo; un fallo no cancela los demás
			const blocks = await Promise.all(
				searchResults.map(async (result, index) => {
					const header = `[${index + 1}] ${result.title}\nURL: ${result.url}`;

					try {
						const { textContent } = await extractWebContent(result.url);
						
						return `${header}\n${textContent}`;
					} catch (error) {
						const message = error instanceof Error ? error.message : 'Unknown error';

						return `${header}\nError: ${message}\nDesc: ${result.description}`;
					}
				}),
			);

			return {
				content: [{ type: 'text', text: `Search: ${query}\n\n${blocks.join('\n---\n')}` }],
			};
		},
	);
};
