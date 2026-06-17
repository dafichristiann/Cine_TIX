import { Module } from '@nestjs/common';
import { StudioService } from './studio.service';
import { StudioController } from './studio.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudioController],
  providers: [StudioService],
  exports: [StudioService], // ← export agar bisa dipakai Module Kursi & Jadwal nanti
})
export class StudioModule {}