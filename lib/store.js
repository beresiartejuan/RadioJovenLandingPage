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

/**
 * Site config (publicidad, stream, WhatsApp, redes, tagline, título de
 * programación) guardada como JSON en la key `site:config`.
 */
const SITE_CONFIG_DEFAULT = {
  ad: { imageUrl: '/publi.jpeg', linkUrl: '', alt: 'Publicidad' },
  streamUrl: 'https://sc.host-live.com/8222/stream',
  whatsapp: { href: 'https://wa.me/2625523555', defaultText: '¡Hola Radio Joven!' },
  socials: {
    x: 'https://x.com/radiojovenalv',
    facebook: 'https://www.facebook.com/radiojovenmendoza',
    instagram: 'https://www.instagram.com/radiojovenmendoza/',
  },
  tagline: 'La radio de General Alvear que te acompaña con música, buena onda y la mejor programación.',
  scheduleTitle: 'Programación 2026',
};

function defaultConfig() {
  const def = SITE_CONFIG_DEFAULT;
  return {
    ad: { ...def.ad },
    streamUrl: def.streamUrl,
    whatsapp: { ...def.whatsapp },
    socials: { ...def.socials },
    tagline: def.tagline,
    scheduleTitle: def.scheduleTitle,
  };
}

// Merge defensivo: cualquier campo ausente, corrupto o de tipo incorrecto
// vuelve al default correspondiente (el JSON devuelto siempre es completo).
function configWithDefaults(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return defaultConfig();
  }

  const def = SITE_CONFIG_DEFAULT;
  const str = (value, fallback) => (typeof value === 'string' ? value : fallback);
  return {
    ad: {
      imageUrl: str(parsed.ad?.imageUrl, def.ad.imageUrl),
      linkUrl: str(parsed.ad?.linkUrl, def.ad.linkUrl),
      alt: str(parsed.ad?.alt, def.ad.alt),
    },
    streamUrl: str(parsed.streamUrl, def.streamUrl),
    whatsapp: {
      href: str(parsed.whatsapp?.href, def.whatsapp.href),
      defaultText: str(parsed.whatsapp?.defaultText, def.whatsapp.defaultText),
    },
    socials: {
      x: str(parsed.socials?.x, def.socials.x),
      facebook: str(parsed.socials?.facebook, def.socials.facebook),
      instagram: str(parsed.socials?.instagram, def.socials.instagram),
    },
    tagline: str(parsed.tagline, def.tagline),
    scheduleTitle: str(parsed.scheduleTitle, def.scheduleTitle),
  };
}

export async function getConfig() {
  const client = await getRedis();
  const raw = await client.get('site:config');
  if (!raw) return defaultConfig();
  try {
    return configWithDefaults(JSON.parse(raw));
  } catch {
    return defaultConfig();
  }
}

export async function setConfig(config) {
  const client = await getRedis();
  await client.set('site:config', JSON.stringify(config));
}

/**
 * Programación guardada como JSON array en la key `schedule`.
 * Key vacía/corrupta → [].
 */
export async function getSchedule() {
  const client = await getRedis();
  const raw = await client.get('schedule');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setSchedule(list) {
  const client = await getRedis();
  await client.set('schedule', JSON.stringify(list));
}