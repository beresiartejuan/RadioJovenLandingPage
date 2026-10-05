import { safeEqualStrings, signToken } from '../../lib/auth.js';
import { checkRateLimit, resetRateLimit } from '../../lib/ratelimit.js';
import { withHandler } from '../../lib/http.js';

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días
const RATE_LIMIT_MAX = 5; // 5 intentos...
const RATE_LIMIT_WINDOW = 15 * 60; // ...por 15 minutos

// IP del cliente: en Vercel Functions el header `x-forwarded-for` trae la cadena
// de proxies edge. Preferimos el ÚLTIMO hop confiable (añadido por Vercel) en
// lugar del primero, que el cliente puede spoofear. Fallback 'unknown'.
function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) return 'unknown';
  const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : 'unknown';
}

function missingEnv() {
  const missing = [];
  if (!process.env.AUTH_SECRET) missing.push('AUTH_SECRET');
  if (!process.env.ADMIN_EMAIL) missing.push('ADMIN_EMAIL');
  if (!process.env.ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
  return missing;
}

// POST /api/auth/login — { email, password }
// 200 { access_token, token_type } | 401 credenciales inválidas
// | 429 bloqueado por reintentos (header Retry-After) | 400 body inválido
export const POST = withHandler(async (request) => {
  const missing = missingEnv();
  if (missing.length > 0) {
    console.error('Login: variables de entorno faltantes:', missing.join(', '));
    return Response.json({ error: 'error interno' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'cuerpo JSON inválido' }, { status: 400 });
  }

  const ip = clientIp(request);
  const rate = await checkRateLimit(ip, { max: RATE_LIMIT_MAX, windowSeconds: RATE_LIMIT_WINDOW });
  if (!rate.allowed) {
    return Response.json(
      { error: 'demasiados intentos, probá en unos minutos' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  const { email, password } = body || {};
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.length === 0 ||
    password.length === 0
  ) {
    return Response.json({ error: 'email y password son requeridos' }, { status: 400 });
  }

  const emailOk = safeEqualStrings(email.toLowerCase(), (process.env.ADMIN_EMAIL || '').toLowerCase());
  const passwordOk = safeEqualStrings(password, process.env.ADMIN_PASSWORD || '');
  if (!emailOk || !passwordOk) {
    return Response.json({ error: 'credenciales inválidas' }, { status: 401 });
  }

  // Login correcto: el contador no debe castigar al admin legítimo.
  await resetRateLimit(ip);

  return Response.json({
    access_token: signToken(email),
    token_type: 'Bearer',
    expires_in: TOKEN_TTL_SECONDS,
  });
});

export const OPTIONS = withHandler(() => {
  return Response.json({ error: 'usa POST' }, { status: 405 });
});
