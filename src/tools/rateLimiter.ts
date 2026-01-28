/**
 * Limitador de tasa para prevenir sobrecarga de servicios externos
 * Implementa un retraso de 1-2 segundos entre peticiones consecutivas al mismo dominio
 */

class RateLimiter {
  private lastRequestTime = 0;
  private readonly minDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(minDelaySec = 1, maxDelaySec = 2) {
    this.minDelayMs = minDelaySec * 1000;
    this.maxDelayMs = maxDelaySec * 1000;
  }

  /**
   * Esperar si es necesario para mantener el límite de tasa
   * Usa un retraso aleatorio entre mín y máx para un comportamiento más natural
   */
  async wait(domain?: string): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Retraso aleatorio entre mín y máx
    const delay = this.minDelayMs + Math.random() * (this.maxDelayMs - this.minDelayMs);
    
    if (timeSinceLastRequest < delay) {
      const waitTime = delay - timeSinceLastRequest;
      const domainInfo = domain ? ` for ${domain}` : '';

      console.error(`[RateLimiter] Waiting ${Math.round(waitTime)}ms${domainInfo}`);
      
      await this.sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Dormir durante los milisegundos especificados
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Gestor de rate limiters por dominio
 * Cada dominio tiene su propio rate limiter independiente
 */
export class PerDomainRateLimiter {
  private limiters = new Map<string, RateLimiter>();
  private readonly minDelaySec: number;
  private readonly maxDelaySec: number;

  constructor(minDelaySec = 1, maxDelaySec = 2) {
    this.minDelaySec = minDelaySec;
    this.maxDelaySec = maxDelaySec;
  }

  /**
   * Extraer dominio de una URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Esperar respetando el rate limit del dominio específico
   */
  async wait(url: string): Promise<void> {
    const domain = this.extractDomain(url);
    
    let limiter = this.limiters.get(domain);
    
    if (!limiter) {
      limiter = new RateLimiter(this.minDelaySec, this.maxDelaySec);
      this.limiters.set(domain, limiter);
    }

    await limiter.wait(domain);
  }
}
