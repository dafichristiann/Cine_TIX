import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static pool: Pool;

  constructor() {
    // Buat pool koneksi PostgreSQL secara aman di level runtime aplikasi
    if (!PrismaService.pool) {
      PrismaService.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    }
    
    const adapter = new PrismaPg(PrismaService.pool);
    
    // Kirim objek adapter ke instance utama PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    // Test query ringan untuk memastikan koneksi ke postgres sukses saat aplikasi start
    await this.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}