import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerDomainRateLimiter } from '@/tools/rateLimiter';

describe('PerDomainRateLimiter', () => {
  let rateLimiter: PerDomainRateLimiter;

  beforeEach(() => {
    rateLimiter = new PerDomainRateLimiter(1, 2);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should not wait on first request to a domain', async () => {
    const start = Date.now();

    await rateLimiter.wait('https://example.com/page1');

    const elapsed = Date.now() - start;
    
    // First request should be immediate (< 100ms)
    expect(elapsed).toBeLessThan(100);
  });

  it('should wait between consecutive requests to same domain', async () => {
    await rateLimiter.wait('https://example.com/page1');
    
    const start = Date.now();

    await rateLimiter.wait('https://example.com/page2');

    const elapsed = Date.now() - start;
    
    // Should wait between 1-2 seconds for same domain
    expect(elapsed).toBeGreaterThanOrEqual(1000);
    expect(elapsed).toBeLessThan(2500); // 2s + some buffer
  });

  it('should NOT wait for different domains (parallel)', async () => {
    await rateLimiter.wait('https://example.com/page1');
    
    const start = Date.now();

    await rateLimiter.wait('https://different.com/page1');

    const elapsed = Date.now() - start;
    
    // Different domain should not wait
    expect(elapsed).toBeLessThan(100);
  });

  it('should handle multiple domains independently', async () => {
    // First request to each domain should be immediate
    const start1 = Date.now();

    await Promise.all([
      rateLimiter.wait('https://domain1.com/page'),
      rateLimiter.wait('https://domain2.com/page'),
      rateLimiter.wait('https://domain3.com/page'),
    ]);

    const elapsed1 = Date.now() - start1;
    
    expect(elapsed1).toBeLessThan(200); // All parallel, should be fast
    
    // Second request to same domain should wait
    const start2 = Date.now();

    await rateLimiter.wait('https://domain1.com/page2');

    const elapsed2 = Date.now() - start2;
    
    expect(elapsed2).toBeGreaterThanOrEqual(1000);
  });

  it('should use random delay between min and max', async () => {
    const delays: number[] = [];
    const domain = 'https://example.com';
    
    for (let i = 0; i < 5; i++) {
      await rateLimiter.wait(`${domain}/page${i * 2}`);
      
      const start = Date.now();

      await rateLimiter.wait(`${domain}/page${i * 2 + 1}`);

      const elapsed = Date.now() - start;
      
      delays.push(elapsed);
    }
    
    // Check that delays are within range
    delays.forEach(delay => {
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThan(2500);
    });
    
    // Check that not all delays are identical (randomness)
    const uniqueDelays = new Set(delays.map(d => Math.floor(d / 100)));
    expect(uniqueDelays.size).toBeGreaterThan(1);
  });

  it('should respect custom delay range', async () => {
    const customLimiter = new PerDomainRateLimiter(0.5, 1);
    
    await customLimiter.wait('https://example.com/page1');
    
    const start = Date.now();

    await customLimiter.wait('https://example.com/page2');

    const elapsed = Date.now() - start;
    
    // Should wait between 0.5-1 seconds
    expect(elapsed).toBeGreaterThanOrEqual(500);
    expect(elapsed).toBeLessThan(1500);
  });

  it('should extract domain correctly from various URL formats', async () => {
    await rateLimiter.wait('https://example.com/path/to/page');
    
    const start = Date.now();

    await rateLimiter.wait('https://example.com/different/path');
    
    const elapsed = Date.now() - start;
    
    // Should recognize as same domain and wait
    expect(elapsed).toBeGreaterThanOrEqual(1000);
  });
});
