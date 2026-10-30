#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { warmupBrowser } from '@/extractWebContent';
import { registerSearchTool } from '@/tools/searchTool';

const server = new McpServer(
	{
		name: 'MCP-DuckDuckGo',
		version: '2.0.0',
		description: 'MCP server that uses DuckDuckGo and Playwright to search the web and improve model answers with up-to-date page content.',
	},
	{
		instructions: 'Use this server to look up information that needs to be current, including documentation (APIs, libraries, frameworks, guides), news, prices, events, and other time-sensitive topics.',
	},
);

const main = async () => {
	// Precarga el navegador para evitar el arranque lento de Chromium en la primera búsqueda
	await warmupBrowser();

	registerSearchTool(server);

	const transport = new StdioServerTransport();

	await server.connect(transport);
};

main().catch((error) => {
	console.error('[Server] Fatal error:', error);
	process.exit(1);
});

