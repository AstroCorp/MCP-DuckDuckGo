import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchDuckDuckGo, clearSearchCache } from '@/tools/searchDuckDuckGo';

describe('searchDuckDuckGo', () => {
  beforeEach(() => {
    clearSearchCache();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should search and return results with valid structure', { timeout: 10000 }, async () => {
    const results = await searchDuckDuckGo('typescript', 5);
    
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(5);
    
    // Check structure of first result if any results returned
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('url');
      expect(results[0]).toHaveProperty('description');
      expect(results[0].url).toMatch(/^https?:\/\//);
      
      // Validate all URLs
      results.forEach(result => {
        expect(result.url).toMatch(/^https?:\/\/.+/);
      });
    }
  });

  it('should use cache on repeated searches', { timeout: 15000 }, async () => {
    const query = 'javascript testing';
    
    // First search
    const start1 = Date.now();
    const results1 = await searchDuckDuckGo(query, 3);
    const elapsed1 = Date.now() - start1;
    
    // Second search (should be cached)
    const start2 = Date.now();
    const results2 = await searchDuckDuckGo(query, 3);
    const elapsed2 = Date.now() - start2;
    
    expect(results1).toEqual(results2);
    expect(elapsed2).toBeLessThan(elapsed1); // Cache should be faster
    expect(elapsed2).toBeLessThan(100); // Cache should be almost instant
  });
});
