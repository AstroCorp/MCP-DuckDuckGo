/**
 * Recursos compartidos entre módulos para evitar duplicación
 */

import { PerDomainRateLimiter } from '@/tools/rateLimiter';

// Rate limiter por dominio compartido para todas las operaciones web
export const rateLimiter = new PerDomainRateLimiter(1, 2);
