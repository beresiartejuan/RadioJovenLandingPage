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

const PROD_CORS_ORIGIN = 'https://radio-joven-landing-page.vercel.app';

function corsOrigin() {
  const configured = process.env.CORS_ORIGIN;
  if (configured) return configured;
  return process.env.VERCEL_ENV === 'production' ? PROD_CORS_ORIGIN : '*';
}

function corsHeaders() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', corsOrigin());
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  return headers;
}

/**
 * Envuelve una respuesta con cabeceras CORS. Si la request es OPTIONS,
 * devuelve 204 sin body.
 */
export function withCors(response, request) {
  const headers = new Headers(response.headers);
  for (const [key, value] of corsHeaders()) {
    if (!headers.has(key)) headers.set(key, value);
  }
  if (request?.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/**
 * Envuelve un handler serverless con manejo de errores y CORS.
 * Captura excepciones y devuelve un 500 genérico sin filtrar detalles internos.
 */
export function withHandler(handler) {
  return async (request, context) => {
    try {
      const response = await handler(request, context);
      return withCors(response, request);
    } catch (err) {
      console.error('Handler error:', err);
      return withCors(
        Response.json({ error: 'error interno' }, { status: 500 }),
        request,
      );
    }
  };
}