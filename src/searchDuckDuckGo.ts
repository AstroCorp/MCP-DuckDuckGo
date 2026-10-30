import { load } from 'cheerio';
import { SearchResult } from '@/types';

/** Convierte enlaces de redirección de DuckDuckGo a la URL destino. */
const resolveUrl = (href: string): string | undefined => {
	if (href.startsWith('//duckduckgo.com/l/?')) {
		try {
			const uddg = new URL(`https:${href}`).searchParams.get('uddg');
			return uddg ? decodeURIComponent(uddg) : undefined;
		} catch {
			return undefined;
		}
	}

	return href.startsWith('http') ? href : undefined;
};

export const searchDuckDuckGo = async (query: string, maxResults: number): Promise<SearchResult[]> => {
	// Versión HTML: más fácil de parsear que la SPA
	const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

	const response = await fetch(searchUrl, {
		headers: { 'User-Agent': 'Mozilla/5.0' },
	});

	if (!response.ok) {
		throw new Error(`Failed to search DuckDuckGo: HTTP ${response.status}`);
	}

	const $ = load(await response.text());
	const results: SearchResult[] = [];

	$('.result').each((_, element) => {
		if (results.length >= maxResults) return false;

		const row = $(element);
		const href = row.find('.result__a').attr('href');
		const url = href ? resolveUrl(href) : undefined;

		if (!url) return;

		results.push({
			title: row.find('.result__a').text().trim() || 'No title',
			url,
			description: row.find('.result__snippet').text().trim() || 'No description',
		});
	});

	return results;
};

