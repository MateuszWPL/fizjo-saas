import { defineConfig } from 'prisma/config';

// Prisma 7 nie czyta .env samodzielnie, Node ma do tego wbudowane loadEnvFile
process.loadEnvFile();

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('Brak DATABASE_URL w apps/api/.env');
}

export default defineConfig({
  datasource: { url },
});
