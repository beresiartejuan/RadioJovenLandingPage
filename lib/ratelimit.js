import { eq, lt } from 'drizzle-orm';
import { getDb } from './db/client.js';
import { rateLimits } from './db/schema.js';

/**
 * Rate limit por IP usando la tabla `rateLimits` de Turso.
 *
 * - allowed → { allowed: true, remaining }
 * - bloqueado → { allowed: false, retryAfter }
 * - DB caída/error → { allowed: true } (fail-open, no tumba el login)
 */
export async function checkRateLimit(ip, { max, windowSeconds }) {
  try {
    const db = getDb();

    // Limpiar entradas expiradas.
    await db.delete(rateLimits).where(lt(rateLimits.expiresAt, Date.now()));

    const rows = await db.select().from(rateLimits).where(eq(rateLimits.ip, ip));

    if (rows.length === 0) {
      const now = Date.now();
      await db
        .insert(rateLimits)
        .values({ ip, count: 1, expiresAt: now + windowSeconds * 1000 });
      return { allowed: true, remaining: max - 1 };
    }

    const row = rows[0];

    if (row.count >= max) {
      const retryAfter = Math.max(0, Math.ceil((row.expiresAt.getTime() - Date.now()) / 1000));
      return { allowed: false, retryAfter };
    }

    await db
      .update(rateLimits)
      .set({ count: row.count + 1 })
      .where(eq(rateLimits.ip, ip));

    return { allowed: true, remaining: max - row.count - 1 };
  } catch (err) {
    console.error('Rate limit: DB no disponible, fail-open', err);
    return { allowed: true };
  }
}

/**
 * Resetea el contador tras un login correcto. Errores de DB → log.
 */
export async function resetRateLimit(ip) {
  try {
    const db = getDb();
    await db.delete(rateLimits).where(eq(rateLimits.ip, ip));
  } catch (err) {
    console.error('Rate limit reset: DB no disponible', err);
  }
}
