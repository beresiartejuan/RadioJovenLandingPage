import { getHoroscope } from '../lib/store.js';

// GET /api/horoscope y POST /api/horoscope — públicas, mismo comportamiento.
// 200 { title, content, image } con defaults si la key `horoscope` está vacía.
export async function GET() {
  const horoscope = await getHoroscope();
  return Response.json(horoscope);
}

export async function POST() {
  const horoscope = await getHoroscope();
  return Response.json(horoscope);
}

// Otros métodos → 405
export async function PUT() {
  return Response.json({ error: 'usa GET, POST' }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ error: 'usa GET, POST' }, { status: 405 });
}