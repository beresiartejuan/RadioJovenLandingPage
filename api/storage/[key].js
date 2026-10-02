import { getRedis } from '../../lib/redis.js';
import { getImage, setImage } from '../../lib/store.js';

// GET /api/storage/:key — sirve los bytes guardados en la Redis key `storage:<key>`
// (JSON { data: <base64>, mime }). 200 con Content-Type del mime guardado | 404.
export async function GET(request, { params }) {
  let img = await getImage(params.key);
  if (!img && params.key === 'horoscope') {
    // Fallback: restaurar desde `horoscope:image` (fuente de verdad de la edición).
    const client = await getRedis();
    const raw = await client.get('horoscope:image');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.data === 'string') {
          img = { data: parsed.data, mime: parsed.mime || 'application/octet-stream' };
          await setImage(params.key, img);
        }
      } catch {
        // JSON corrupto → 404
      }
    }
  }
  if (!img) {
    return Response.json({ error: 'recurso no encontrado' }, { status: 404 });
  }

  return new Response(Buffer.from(img.data, 'base64'), {
    headers: { 'Content-Type': img.mime },
  });
}

// Otros métodos → 405
export async function PUT() {
  return Response.json({ error: 'usa GET' }, { status: 405 });
}

export async function POST() {
  return Response.json({ error: 'usa GET' }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: 'usa GET' }, { status: 405 });
}