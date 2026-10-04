import { asc, eq } from 'drizzle-orm';
import { getDb } from './db/client.js';
import { config, events, horoscope, schedule } from './db/schema.js';

export const HOROSCOPE_DEFAULT = {
  title: 'Horóscopo bizarro',
  content: 'Sigue el horóscopo de la cabra...',
  image: '',
};

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

function rowToConfig(row) {
  return configWithDefaults({
    ad: {
      imageUrl: row.adImageUrl,
      linkUrl: row.adLinkUrl,
      alt: row.adAlt,
    },
    streamUrl: row.streamUrl,
    whatsapp: {
      href: row.whatsappHref,
      defaultText: row.whatsappDefaultText,
    },
    socials: {
      x: row.socialX,
      facebook: row.socialFacebook,
      instagram: row.socialInstagram,
    },
    tagline: row.tagline,
    scheduleTitle: row.scheduleTitle,
  });
}

function configToRow(configValue) {
  return {
    id: 1,
    adImageUrl: configValue.ad?.imageUrl,
    adLinkUrl: configValue.ad?.linkUrl,
    adAlt: configValue.ad?.alt,
    streamUrl: configValue.streamUrl,
    whatsappHref: configValue.whatsapp?.href,
    whatsappDefaultText: configValue.whatsapp?.defaultText,
    socialX: configValue.socials?.x,
    socialFacebook: configValue.socials?.facebook,
    socialInstagram: configValue.socials?.instagram,
    tagline: configValue.tagline,
    scheduleTitle: configValue.scheduleTitle,
  };
}

export async function getEvents() {
  const db = getDb();
  const rows = await db.select().from(events).orderBy(asc(events.createdAt));
  return rows;
}

export async function getPublishedEvents() {
  const db = getDb();
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.published, true))
    .orderBy(asc(events.createdAt));
  return rows;
}

export async function setEvents(list) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.delete(events);
    for (const item of list) {
      await tx.insert(events).values(item);
    }
  });
}

export async function getHoroscope() {
  const db = getDb();
  const rows = await db.select().from(horoscope).where(eq(horoscope.id, 1));
  if (rows.length === 0) return { ...HOROSCOPE_DEFAULT };
  const row = rows[0];
  return {
    title: row.title ?? HOROSCOPE_DEFAULT.title,
    content: row.content ?? HOROSCOPE_DEFAULT.content,
    image: row.image ?? HOROSCOPE_DEFAULT.image,
  };
}

export async function setHoroscope(obj) {
  const db = getDb();
  await db
    .insert(horoscope)
    .values({ id: 1, ...obj })
    .onConflictDoUpdate({
      target: horoscope.id,
      set: {
        title: obj.title,
        content: obj.content,
        image: obj.image,
      },
    });
}

export async function getConfig() {
  const db = getDb();
  const rows = await db.select().from(config).where(eq(config.id, 1));
  if (rows.length === 0) return defaultConfig();
  return rowToConfig(rows[0]);
}

export async function setConfig(configValue) {
  const db = getDb();
  const row = configToRow(configValue);
  await db
    .insert(config)
    .values(row)
    .onConflictDoUpdate({
      target: config.id,
      set: {
        adImageUrl: row.adImageUrl,
        adLinkUrl: row.adLinkUrl,
        adAlt: row.adAlt,
        streamUrl: row.streamUrl,
        whatsappHref: row.whatsappHref,
        whatsappDefaultText: row.whatsappDefaultText,
        socialX: row.socialX,
        socialFacebook: row.socialFacebook,
        socialInstagram: row.socialInstagram,
        tagline: row.tagline,
        scheduleTitle: row.scheduleTitle,
      },
    });
}

export async function getSchedule() {
  const db = getDb();
  const rows = await db.select().from(schedule).orderBy(asc(schedule.order));
  return rows;
}

export async function setSchedule(list) {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.delete(schedule);
    for (const item of list) {
      await tx.insert(schedule).values(item);
    }
  });
}
