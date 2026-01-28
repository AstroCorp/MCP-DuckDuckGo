import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Cache } from '@/tools/cache';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache<string>();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');

    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for non-existent keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should check if key exists', () => {
    cache.set('key1', 'value1');

    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    expect(cache.size).toBe(2);
    
    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should evict oldest entry when limit is reached', () => {
    // Fill cache to limit (100 entries)
    for (let i = 0; i < 100; i++) {
      cache.set(`key${i}`, `value${i}`);
    }

    expect(cache.size).toBe(100);

    // Add one more - should evict key0
    cache.set('key100', 'value100');

    expect(cache.size).toBe(100);
    expect(cache.get('key0')).toBeUndefined();
    expect(cache.get('key100')).toBe('value100');
  });

  it('should expire entries after TTL', async () => {
    cache.set('key1', 'value1');

    expect(cache.get('key1')).toBe('value1');

    // Mock time passing (10 minutes + 1 second)
    vi.useFakeTimers();
    vi.advanceTimersByTime(10 * 60 * 1000 + 1000);

    expect(cache.get('key1')).toBeUndefined();

    vi.useRealTimers();
  });

  it('should not evict when updating existing key', () => {
    for (let i = 0; i < 100; i++) {
      cache.set(`key${i}`, `value${i}`);
    }
    
    // Update existing key - should not evict
    cache.set('key50', 'updated_value');
    
    expect(cache.size).toBe(100);
    expect(cache.get('key0')).toBe('value0'); // First entry still exists
  });
});
