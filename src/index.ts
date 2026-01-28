#!/usr/bin/env node

/**
 * Servidor MCP de búsqueda - Búsqueda en DuckDuckGo con extracción de contenido web
 * Utiliza transporte stdio para comunicación local
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { searchDuckDuckGo } from '@/tools/searchDuckDuckGo';
import { extractWebContent } from '@/tools/extractWebContent';

/**
 * Crear y configurar el servidor MCP
 */
const server = new McpServer(
  {
    name: 'MCP-DuckDuckGo',
    version: '1.0.0',

  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Registrar herramientas
 */

// Herramienta unificada de búsqueda y extracción
server.registerTool(
  'search',
  {
    description: 'Searches DuckDuckGo and extracts full content from top results. Use for current information (time, weather, news, prices, events). If results don\'t contain what you need, search again with different terms.',
    inputSchema: {
      query: z.string().describe('Search terms'),
      numResults: z.number().default(3).describe('Number of results to extract (default: 3, max: 5)'),
    },
  },
  async ({ query, numResults }) => {
    console.error(`[Server] Searching and extracting: "${query}" (${numResults} results)`);
    
    const searchResults = await searchDuckDuckGo(query, numResults);
    
    const results = await Promise.all(
      searchResults.map(async (result, index) => {
        try {
          const content = await extractWebContent(result.url);
          return {
            number: index + 1,
            title: result.title,
            url: result.url,
            content: content.markdown,
            success: true,
          };
        } catch (error) {
          return {
            number: index + 1,
            title: result.title,
            url: result.url,
            description: result.description,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          };
        }
      })
    );

    let output = `Search: ${query} `;
    
    for (const result of results) {
      output += `[${result.number}] ${result.title} `;
      output += `URL: ${result.url} `;
      
      if (result.success) {
        output += result.content + ' ';
      } else {
        output += `Error: ${result.error} `;
        
        if (result.description) {
          output += `Desc: ${result.description} `;
        }
      }
      
      output += '--- ';
    }

    return {
      content: [
        {
          type: 'text',
          text: output,
        },
      ],
    };
  }
);

/**
 * Iniciar el servidor
 */
async function main() {
  console.error('[Server] Starting MCP Search Server...');
  
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('[Server] MCP Search Server running on stdio');
  console.error('[Server] Available tool: search');
}

main().catch((error) => {
  console.error('[Server] Fatal error:', error);
  process.exit(1);
});
