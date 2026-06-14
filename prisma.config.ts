import 'dotenv/config'; // Memastikan variabel lingkungan ter-load dengan aman
import { defineConfig, env } from 'prisma/config'; // Ambil helper 'env' bawaan Prisma
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

export default defineConfig({
  // Tentukan path schema secara eksplisit agar CLI tidak bingung
  schema: 'prisma/schema.prisma',
  
  datasource: {
    // 1. WAJIB MENGGUNAKAN env() bawaan prisma/config untuk membaca string .env di CLI
    url: env('DATABASE_URL'), 
  },
});