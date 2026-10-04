import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días

function base64urlEncode(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64urlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function hmacDigest(payload) {
  return createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest();
}

/**
 * Genera un token con formato `base64url(payload).hmac256(payload, AUTH_SECRET)`.
 * Payload: `{ sub: <email>, exp: <epoch en segundos, 7 días> }`.
 */
export function signToken(sub) {
  const payload = {
    sub,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encoded = base64urlEncode(JSON.stringify(payload));
  const signature = hmacDigest(encoded).toString('base64url');
  return `${encoded}.${signature}`;
}

/**
 * Verifica firma (timing-safe) y expiración. Devuelve el payload o null.
 */
export function verifyToken(token) {
  if (typeof token !== 'string') return null;

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = hmacDigest(encoded);
  const received = Buffer.from(signature, 'base64url');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(base64urlDecode(encoded));
  } catch {
    return null;
  }
  if (!payload || typeof payload !== 'object') return null;
  if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

/**
 * Extrae el payload si el header `Authorization: Bearer <token>` es válido.
 * Devuelve `{ payload }` o null.
 */
export function requireAuth(request) {
  const header = request.headers.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (!token || scheme.toLowerCase() !== 'bearer') return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return { payload };
}

/**
 * Comparación timing-safe de credenciales: se hashea cada string con sha256 y
 * se comparan los digests (misma longitud garantizada, sin filtrar timing).
 */
export function safeEqualStrings(a, b) {
  const digestA = createHash('sha256').update(String(a)).digest();
  const digestB = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(digestA, digestB);
}