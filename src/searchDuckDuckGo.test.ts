import { describe, it, expect } from 'vitest';
import { searchDuckDuckGo } from '@/searchDuckDuckGo';

describe('searchDuckDuckGo', () => {
	it('should search and return results with valid structure', { timeout: 10000 }, async () => {
		const results = await searchDuckDuckGo('typescript', 5);

		expect(results).toBeDefined();
		expect(Array.isArray(results)).toBe(true);
		expect(results.length).toBeLessThanOrEqual(5);

		if (results.length > 0) {
			expect(results[0]).toHaveProperty('title');
			expect(results[0]).toHaveProperty('url');
			expect(results[0]).toHaveProperty('description');
			expect(results[0].url).toMatch(/^https?:\/\//);

			results.forEach((result) => {
				expect(result.url).toMatch(/^https?:\/\/.+/);
			});
		}
	});
});

