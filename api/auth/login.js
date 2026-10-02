import { safeEqualStrings, signToken } from '../../lib/auth.js';

const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 días

// POST /api/auth/login — { email, password }
// 200 { access_token, token_type } | 401 credenciales inválidas | 400 body inválido
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'cuerpo JSON inválido' }, { status: 400 });
  }

  const { email, password } = body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return Response.json({ error: 'email y password son requeridos' }, { status: 400 });
  }

  const emailOk = safeEqualStrings(email, process.env.ADMIN_EMAIL || '');
  const passwordOk = safeEqualStrings(password, process.env.ADMIN_PASSWORD || '');
  if (!emailOk || !passwordOk) {
    return Response.json({ error: 'credenciales inválidas' }, { status: 401 });
  }

  return Response.json({
    access_token: signToken(email),
    token_type: 'Bearer',
    expires_in: TOKEN_TTL_SECONDS,
  });
}