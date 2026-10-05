import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().default(Date.now()),
});

export const horoscope = sqliteTable('horoscope', {
  id: integer('id').primaryKey(),
  title: text('title').notNull().default('Horóscopo bizarro'),
  content: text('content').notNull().default('Sigue el horóscopo de la cabra...'),
  image: text('image').notNull().default(''),
});

export const config = sqliteTable('config', {
  id: integer('id').primaryKey(),
  adImageUrl: text('adImageUrl').notNull().default('/publi.jpeg'),
  adLinkUrl: text('adLinkUrl').notNull().default(''),
  adAlt: text('adAlt').notNull().default('Publicidad'),
  streamUrl: text('streamUrl').notNull().default('https://sc.host-live.com/8222/stream'),
  whatsappHref: text('whatsappHref').notNull().default('https://wa.me/2625523555'),
  whatsappDefaultText: text('whatsappDefaultText').notNull().default('¡Hola Radio Joven!'),
  socialX: text('socialX').notNull().default('https://x.com/radiojovenalv'),
  socialFacebook: text('socialFacebook').notNull().default('https://www.facebook.com/radiojovenmendoza'),
  socialInstagram: text('socialInstagram').notNull().default('https://www.instagram.com/radiojovenmendoza/'),
  tagline: text('tagline').notNull().default('La radio de General Alvear que te acompaña con música, buena onda y la mejor programación.'),
  scheduleTitle: text('scheduleTitle').notNull().default('Programación 2026'),
});

export const schedule = sqliteTable('schedule', {
  id: text('id').primaryKey(),
  days: text('days').notNull(),
  time: text('time').notNull(),
  title: text('title').notNull(),
  host: text('host').notNull(),
  order: integer('order').notNull().default(0),
});

export const rateLimits = sqliteTable('rateLimits', {
  ip: text('ip').primaryKey(),
  count: integer('count').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(),
});
