/**
 * Ejemplo de uso del servidor MCP de búsqueda
 * Busca "W3Schools TypeScript Tutorial" y muestra el contenido en markdown
 */

import { searchDuckDuckGo } from '@/tools/searchDuckDuckGo';
import { extractWebContent } from '@/tools/extractWebContent';

async function main() {
  try {
    console.log('🔍 Searching: W3Schools TypeScript Tutorial\n');
    
    // Buscar
    const results = await searchDuckDuckGo('W3Schools TypeScript Tutorial', 1);
    
    if (results.length === 0) {
      console.log('❌ No results found');
      return;
    }
    
    const firstResult = results[0];
    
    console.log(`📄 Title: ${firstResult.title}`);
    console.log(`🔗 URL: ${firstResult.url}`);
    console.log(`📝 Description: ${firstResult.description}\n`);

    console.log('⏳ Extracting content...\n');
    
    // Extraer contenido
    const content = await extractWebContent(firstResult.url);
    
    console.log('━'.repeat(80));
    console.log('📋 MARKDOWN CONTENT');
    console.log('━'.repeat(80));
    console.log();
    console.log(content.markdown);
    console.log();
    console.log('━'.repeat(80));
    console.log(`📊 Statistics:`);
    console.log(`   - Length: ${content.length} characters`);
    console.log(`   - Excerpt: ${content.excerpt}`);

    if (content.siteName) {
      console.log(`   - Site: ${content.siteName}`);
    }

    console.log('━'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
