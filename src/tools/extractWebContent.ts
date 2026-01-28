/**
 * Extracción de contenido web con caché y limitación de tasa
 * Usa fetch nativo, cheerio para parseo, y Turndown para conversión a Markdown
 */

import { load } from 'cheerio';
import TurndownService from 'turndown';
import { Cache } from '@/tools/cache';
import { rateLimiter } from '@/tools/shared';

export interface ExtractedContent {
  url: string;
  title: string;
  content: string;
  textContent: string;
  markdown: string;
  excerpt: string;
  length: number;
  siteName?: string;
}

// Caché para operaciones de extracción
const extractCache = new Cache<ExtractedContent>();

/**
 * Limpiar y normalizar markdown
 */
function cleanMarkdown(md: string): string {
  return md
    .replace(/\n{3,}/g, '\n\n')  // Máximo 2 saltos de línea consecutivos
    .replace(/[ \t]+$/gm, '')    // Eliminar espacios al final de cada línea
    .trim();
}

/**
 * Extraer contenido limpio de una página web
 * @param url - URL de la que extraer contenido
 * @returns Objeto de contenido extraído
 */
export async function extractWebContent(url: string): Promise<ExtractedContent> {
  const cacheKey = `extract:${url}`;

  // Verificar caché primero
  const cached = extractCache.get(cacheKey);
  
  if (cached) {
    console.error(`[Extractor] Using cached content for: ${url}`);
    return cached;
  }

  console.error(`[Extractor] Fetching content from: ${url}`);

  try {
    // Aplicar limitación de tasa por dominio
    await rateLimiter.wait(url);
    
    // Obtener la página
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Parsear con Cheerio
    const $ = load(html);
    
    // Obtener título
    const title = $('title').text() || $('h1').first().text() || 'No title';
    
    // Eliminar elementos no deseados
    $('script, style, nav, footer, header, iframe, noscript, aside, .ad, .advertisement, [role="complementary"]').remove();
    
    // Extraer contenido del body
    const bodyHtml = $('body').html() || '';
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Configurar Turndown para convertir HTML a Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    });
    
    const markdown = cleanMarkdown(turndownService.turndown(bodyHtml));
    
    const extractedContent: ExtractedContent = {
      url,
      title,
      content: bodyHtml,
      textContent: bodyText,
      markdown: markdown,
      excerpt: bodyText.substring(0, 200),
      length: bodyText.length,
    };

    console.error(`[Extractor] Extracted ${extractedContent.length} chars from: ${url}`);

    // Guardar resultado en caché
    extractCache.set(cacheKey, extractedContent);

    return extractedContent;
  } catch (error) {
    console.error(`[Extractor] Failed to extract content from ${url}:`, error);
    throw new Error(`Failed to extract content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Obtener estadísticas del caché de extracción
 */
export function getExtractCacheStats() {
  return {
    size: extractCache.size,
    maxEntries: 100,
  };
}

/**
 * Limpiar caché de extracción
 */
export function clearExtractCache() {
  extractCache.clear();
}
