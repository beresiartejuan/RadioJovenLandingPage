import { getRedis } from './redis.js';

/**
 * Rate limit por IP con el singleton de redis.js.
 *
 * Key `ratelimit:<ip>`: INCR + EXPIRE (solo en el primer hit de la ventana).
 * - allowed → { allowed: true, remaining }
 * - bloqueado → { allowed: false, retryAfter } (TTL restante de la key, >= 0)
 * - Redis caído/error → { allowed: true } (fail-open, no tumba el login)
 */
export async function checkRateLimit(ip, { max, windowSeconds }) {
  try {
    const client = await getRedis();
    const hits = await client.incr(`ratelimit:${ip}`);
    if (hits === 1) {
      await client.expire(`ratelimit:${ip}`, windowSeconds);
      return { allowed: true, remaining: max - 1 };
    }
    if (hits > max) {
      const ttl = await client.ttl(`ratelimit:${ip}`);
      return { allowed: false, retryAfter: Math.max(ttl, 0) };
    }
    return { allowed: true, remaining: max - hits };
  } catch (err) {
    console.error('Rate limit: Redis no disponible, fail-open', err);
    return { allowed: true };
  }
}

/**
 * Resetea el contador tras un login correcto (no castigar al admin que se
 * equivocó un par de veces antes de acertar). Errores de Redis → noop.
 */
export async function resetRateLimit(ip) {
  try {
    const client = await getRedis();
    await client.del(`ratelimit:${ip}`);
  } catch (err) {
    console.error('Rate limit reset: Redis no disponible', err);
  }
}