import { describe, it, expect, beforeEach, vi } from 'vitest';
import { extractWebContent, clearExtractCache } from '@/tools/extractWebContent';
import { searchDuckDuckGo } from '@/tools/searchDuckDuckGo';

describe('extractWebContent', () => {
  beforeEach(() => {
    clearExtractCache();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should extract content from a webpage with all properties', { timeout: 20000 }, async () => {
    // Get a real URL from DuckDuckGo search
    const searchResults = await searchDuckDuckGo('typescript documentation', 1);
    
    // Skip if no results (DuckDuckGo might be blocking)
    if (searchResults.length === 0) {
      console.error('Skipping: No search results returned');
      return;
    }
    
    const url = searchResults[0].url;
    const content = await extractWebContent(url);
    
    expect(content).toBeDefined();
    expect(content).toHaveProperty('url', url);
    expect(content).toHaveProperty('title');
    expect(content).toHaveProperty('content');
    expect(content).toHaveProperty('textContent');
    expect(content).toHaveProperty('excerpt');
    expect(content).toHaveProperty('length');
    
    expect(content.title).toBeTruthy();
    expect(content.textContent.length).toBeGreaterThan(10);
    expect(content.length).toBeGreaterThan(0);
  });

  it('should use cache on repeated extractions', { timeout: 25000 }, async () => {
    // Get a real URL from DuckDuckGo search
    const searchResults = await searchDuckDuckGo('nodejs tutorial', 1);
    
    // Skip if no results
    if (searchResults.length === 0) {
      console.error('Skipping: No search results returned');
      return;
    }
    
    const url = searchResults[0].url;
    
    // First extraction
    const start1 = Date.now();
    const content1 = await extractWebContent(url);
    const elapsed1 = Date.now() - start1;
    
    // Second extraction (should be cached)
    const start2 = Date.now();
    const content2 = await extractWebContent(url);
    const elapsed2 = Date.now() - start2;
    
    expect(content1).toEqual(content2);
    expect(elapsed2).toBeLessThan(elapsed1);
    expect(elapsed2).toBeLessThan(100); // Cache should be almost instant
  });

  it('should handle errors gracefully', { timeout: 15000 }, async () => {
    const invalidUrl = 'https://this-domain-definitely-does-not-exist-12345.com';
    
    await expect(extractWebContent(invalidUrl)).rejects.toThrow();
  });

  it('should have proper cache functions', () => {
    // Test that cache functions exist and work
    expect(clearExtractCache).toBeDefined();
    expect(typeof clearExtractCache).toBe('function');
    
    // Clear should not throw
    expect(() => clearExtractCache()).not.toThrow();
  });
});
