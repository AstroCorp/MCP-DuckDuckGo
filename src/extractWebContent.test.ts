import { describe, it, expect, beforeAll } from 'vitest';
import { extractWebContent, warmupBrowser } from '@/extractWebContent';
import { searchDuckDuckGo } from '@/searchDuckDuckGo';

describe('extractWebContent', () => {
	beforeAll(() => warmupBrowser());

	it('should extract content from a webpage', { timeout: 20000 }, async () => {
		const searchResults = await searchDuckDuckGo('typescript documentation', 1);
		if (searchResults.length === 0) return;

		const url = searchResults[0].url;
		const content = await extractWebContent(url);

		expect(content.url).toBe(url);
		expect(content.title).toBeTruthy();
		expect(content.textContent.length).toBeGreaterThan(10);
	});

	it('should handle errors gracefully', { timeout: 15000 }, async () => {
		await expect(
			extractWebContent('https://this-domain-definitely-does-not-exist-12345.com'),
		).rejects.toThrow();
	});
});

