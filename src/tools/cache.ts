/**
 * Caché en memoria simple con eliminación LRU y soporte TTL
 * - Máximo 100 entradas
 * - TTL de 10 minutos por entrada
 * - Elimina las entradas más antiguas cuando se alcanza el límite
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

export class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxEntries = 100;
  private readonly ttlMs = 10 * 60 * 1000; // 10 minutes

  /**
   * Obtener un valor del caché si existe y no ha expirado
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Verificar si la entrada ha expirado
    const now = Date.now();
    
    if (now - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);

      console.error(`[Cache] Expired entry removed: ${key}`);

      return undefined;
    }

    console.error(`[Cache] Hit: ${key}`);

    return entry.value;
  }

  /**
   * Establecer un valor en el caché, eliminando la entrada más antigua si se alcanza el límite
   */
  set(key: string, value: T): void {
    // Eliminar la entrada más antigua si estamos en el límite
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;

      if (oldestKey) {
        this.cache.delete(oldestKey);

        console.error(`[Cache] Evicted oldest entry: ${oldestKey}`);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });

    console.error(`[Cache] Set: ${key} (total entries: ${this.cache.size})`);
  }

  /**
   * Verificar si una clave existe y no ha expirado
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Limpiar todas las entradas del caché
   */
  clear(): void {
    this.cache.clear();

    console.error('[Cache] Cleared all entries');
  }

  /**
   * Obtener el tamaño actual del caché
   */
  get size(): number {
    return this.cache.size;
  }
}
