import { Module } from '@nestjs/common';

import { PemesananService } from './pemesanan.service';
import { PemesananController } from './pemesanan.controller';

import { PrismaModule } from '../prisma/prisma.module';

import { SlotKursiModule } from '../slot-kursi/slot-kursi.module';
import { JadwalModule } from '../jadwal/jadwal.module';

@Module({
  imports: [
    PrismaModule,
    SlotKursiModule,
    JadwalModule,
  ],
  controllers: [
    PemesananController,
  ],
  providers: [
    PemesananService,
  ],
})
export class PemesananModule {}