import { jsonWithCache } from '../lib/http.js';
import { getHoroscope } from '../lib/store.js';

// GET /api/horoscope y POST /api/horoscope — públicas, mismo comportamiento.
// 200 { title, content, image } con defaults si la key `horoscope` está vacía.
// `image` es una URL externa (string, puede ser '').
async function handle() {
  const horoscope = await getHoroscope();
  return jsonWithCache(horoscope);
}

export async function GET() {
  return handle();
}

export async function POST() {
  return handle();
}

// Otros métodos → 405
export async function PUT() {
  return Response.json({ error: 'usa GET, POST' }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: 'usa GET, POST' }, { status: 405 });
}