import { createClient } from 'redis';

/**
 * Devuelve un cliente de Redis (Redis Cloud) como singleton por proceso.
 * Vercel reutiliza el proceso entre invocaciones warm, así que guardamos la
 * promesa del cliente conectado en globalThis para no reconectar en cada call.
 */
export function getRedis() {
  if (!globalThis.__redisClientPromise) {
    const client = createClient({
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      socket: { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) },
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    globalThis.__redisClientPromise = client.connect().then(() => client);
  }
  return globalThis.__redisClientPromise;
}