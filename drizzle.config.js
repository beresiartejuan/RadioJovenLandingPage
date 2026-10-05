import { defineConfig } from 'drizzle-kit';

if (!process.env.TURSO_URL) {
  try {
    process.loadEnvFile('./.env');
  } catch {
    // .env puede no existir; drizzle-kit fallará más adelante con un mensaje claro.
  }
}

export default defineConfig({
  schema: './lib/db/schema.js',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_TOKEN,
  },
});
