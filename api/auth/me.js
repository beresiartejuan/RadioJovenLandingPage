import { requireAuth } from '../../lib/auth.js';

// POST /api/auth/me — Authorization: Bearer <token>
// 200 { email, name } | 401 token inválido o ausente
export async function POST(request) {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  return Response.json({
    email: auth.payload.sub,
    name: 'Administrador',
  });
}