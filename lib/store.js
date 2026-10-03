import { getRedis } from './redis.js';

export const HOROSCOPE_DEFAULT = {
  title: 'Horóscopo bizarro',
  content: 'Sigue el horóscopo de la cabra...',
  image: '',
};

/**
 * Lista de eventos guardada como JSON en la key `events`.
 */
export async function getEvents() {
  const client = await getRedis();
  const raw = await client.get('events');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setEvents(list) {
  const client = await getRedis();
  await client.set('events', JSON.stringify(list));
}

/**
 * Solo los eventos `published`: lo que ve la página pública sin token.
 */
export async function getPublishedEvents() {
  const events = await getEvents();
  return events.filter((event) => event.published === true);
}

/**
 * Horóscopo guardado como JSON en la key `horoscope`.
 */
export async function getHoroscope() {
  const client = await getRedis();
  const raw = await client.get('horoscope');
  if (!raw) return { ...HOROSCOPE_DEFAULT };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...HOROSCOPE_DEFAULT };
    return {
      title: parsed.title ?? HOROSCOPE_DEFAULT.title,
      content: parsed.content ?? HOROSCOPE_DEFAULT.content,
      image: parsed.image ?? HOROSCOPE_DEFAULT.image,
    };
  } catch {
    return { ...HOROSCOPE_DEFAULT };
  }
}

export async function setHoroscope(obj) {
  const client = await getRedis();
  await client.set('horoscope', JSON.stringify(obj));
}