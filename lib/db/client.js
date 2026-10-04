import { drizzle } from 'drizzle-orm/tursodatabase-serverless';
import * as schema from './schema.js';

let cached = null;

export function getDb() {
  if (!cached) {
    const url = process.env.TURSO_URL;
    const authToken = process.env.TURSO_TOKEN;
    if (!url || !authToken) {
      throw new Error('TURSO_URL y TURSO_TOKEN son requeridos');
    }
    cached = drizzle({ connection: { url, authToken }, schema });
  }
  return cached;
}
