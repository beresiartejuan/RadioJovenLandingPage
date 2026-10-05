import { requireAuth } from '../../lib/auth.js';
import { withHandler } from '../../lib/http.js';

// POST /api/auth/me — Authorization: Bearer <token>
// 200 { email, name } | 401 token inválido o ausente
export const POST = withHandler(async (request) => {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'no autorizado' }, { status: 401 });
  }

  return Response.json({
    email: auth.payload.sub,
    name: 'Administrador',
  });
});

export const OPTIONS = withHandler(() => {
  return Response.json({ error: 'usa POST' }, { status: 405 });
});
