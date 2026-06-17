import { Module } from '@nestjs/common';
import { SlotKursiService } from './slot-kursi.service';
import { SlotKursiController } from './slot-kursi.controller'; // ← tambah
import { PrismaModule } from '../prisma/prisma.module';        // ← tambah

@Module({
  imports: [PrismaModule],           // ← tambah
  controllers: [SlotKursiController], // ← tambah
  providers: [SlotKursiService],
  exports: [SlotKursiService],
})
export class SlotKursiModule {}