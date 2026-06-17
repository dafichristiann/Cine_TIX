import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { PenggunaModule } from './pengguna/pengguna.module';
import { FilmModule } from './film/film.module';
import { PemesananModule } from './pemesanan/pemesanan.module';
import { BioskopModule } from './bioskop/bioskop.module';
import { StudioModule } from './studio/studio.module';
import { KursiModule } from './kursi/kursi.module';
import { JadwalModule } from './jadwal/jadwal.module';
import { SlotKursiModule } from './slot-kursi/slot-kursi.module';
import { PembayaranModule } from './pembayaran/pembayaran.module';
import { NotifikasiModule } from './notifikasi/notifikasi.module';  

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    PenggunaModule,
    FilmModule,
    BioskopModule,
    StudioModule,
    KursiModule,
    JadwalModule,
    SlotKursiModule,
    PemesananModule,
    PembayaranModule,
    NotifikasiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}