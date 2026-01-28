/**
 * Funcionalidad de búsqueda en DuckDuckGo con caché y limitación de tasa
 * Scraper personalizado usando fetch nativo y cheerio
 */

import { load } from 'cheerio';
import { Cache } from '@/tools/cache';
import { rateLimiter } from '@/tools/shared';

export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

// Caché para operaciones de búsqueda
const searchCache = new Cache<SearchResult[]>();

/**
 * Buscar en DuckDuckGo y devolver resultados de la primera página
 * Usa la versión solo HTML de DuckDuckGo (html.duckduckgo.com) que es más fácil de extraer
 * @param query - Consulta de búsqueda
 * @param maxResults - Número máximo de resultados a devolver
 * @returns Array de resultados de búsqueda
 */
export async function searchDuckDuckGo(
  query: string,
  maxResults: number
): Promise<SearchResult[]> {
  const cacheKey = `search:${query}:${maxResults}`;

  // Verificar caché primero
  const cached = searchCache.get(cacheKey);

  if (cached) {
    console.error(`[DuckDuckGo] Using cached results for: "${query}"`);
    return cached;
  }

  console.error(`[DuckDuckGo] Searching for: "${query}"`);

  try {
    // Usar la versión HTML de DuckDuckGo (versión sin JavaScript)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    // Aplicar limitación de tasa por dominio
    await rateLimiter.wait(searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);
    const results: SearchResult[] = [];

    // La versión HTML de DuckDuckGo usa la clase .result para los resultados de búsqueda
    $('.result').each((index, element) => {
      if (results.length >= maxResults) return false;

      const $row = $(element);
      
      // Extraer título y enlace
      const $titleLink = $row.find('.result__a');
      const title = $titleLink.text().trim();
      const href = $titleLink.attr('href');
      
      // Extraer fragmento/descripción
      const description = $row.find('.result__snippet').text().trim();

      if (!href) return;

      // DuckDuckGo usa URLs de redirección, extraer la URL real
      let url = href;

      if (href.startsWith('//duckduckgo.com/l/?')) {
        try {
          const fullUrl = 'https:' + href;
          const urlObj = new URL(fullUrl);
          const uddg = urlObj.searchParams.get('uddg');
          
          if (uddg) {
            url = decodeURIComponent(uddg);
          }
        } catch {
          // Si falla el parseo, omitir este resultado
          return;
        }
      }

      // Solo procesar URLs http/https
      if (url.startsWith('http://') || url.startsWith('https://')) {
        results.push({
          title: title || 'No title',
          url,
          description: description || 'No description',
        });
      }
    });

    console.error(`[DuckDuckGo] Found ${results.length} results for: "${query}"`);

    if (results.length === 0) {
      console.error('[DuckDuckGo] Warning: No results found. DuckDuckGo might have changed their HTML structure');
    }

    // Guardar en caché los resultados
    searchCache.set(cacheKey, results);

    return results;
  } catch (error) {
    console.error(`[DuckDuckGo] Search failed for "${query}":`, error);
    throw new Error(`Failed to search DuckDuckGo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Obtener estadísticas del caché de búsqueda
 */
export function getSearchCacheStats() {
  return {
    size: searchCache.size,
    maxEntries: 100,
  };
}

/**
 * Limpiar caché de búsqueda
 */
export function clearSearchCache() {
  searchCache.clear();
}
