import { Module } from '@nestjs/common';

import { PemesananController } from './pemesanan.controller';
import { PemesananService } from './pemesanan.service';

import { PrismaModule } from '../prisma/prisma.module';
import { SlotKursiModule } from '../slot-kursi/slot-kursi.module';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';
import { JadwalModule } from '../jadwal/jadwal.module';

@Module({
  imports: [
    PrismaModule,
    SlotKursiModule,
    NotifikasiModule,
    JadwalModule,
  ],

  controllers: [
    PemesananController,
  ],

  providers: [
    PemesananService,
  ],

  exports: [
    PemesananService,
  ],
})
export class PemesananModule {}