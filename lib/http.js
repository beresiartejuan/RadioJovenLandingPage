/**
 * Helpers HTTP compartidos por los handlers de api/.
 */

// Cache-Control para respuestas públicas de lectura: el edge sirve la
// respuesta por 60s y la revalida en background durante 5 minutos más.
export const PUBLIC_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

/**
 * `Response.json` con la cabecera Cache-Control pública, para los endpoints
 * GET de lectura que no requieren token.
 */
export function jsonWithCache(data, init) {
  const headers = new Headers(init?.headers);
  headers.set('cache-control', PUBLIC_CACHE_CONTROL);
  return Response.json(data, { ...init, headers });
}