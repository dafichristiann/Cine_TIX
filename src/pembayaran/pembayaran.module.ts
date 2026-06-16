import { Module } from '@nestjs/common';

import { PembayaranController } from './pembayaran.controller';
import { PembayaranService } from './pembayaran.service';

import { PrismaModule } from '../prisma/prisma.module';
import { SlotKursiModule } from '../slot-kursi/slot-kursi.module';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [
    PrismaModule,
    SlotKursiModule,
    NotifikasiModule,
  ],
  controllers: [
    PembayaranController,
  ],
  providers: [
    PembayaranService,
  ],
  exports: [
    PembayaranService,
  ],
})
export class PembayaranModule {}