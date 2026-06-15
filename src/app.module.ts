import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { PenggunaModule } from './pengguna/pengguna.module';
import { FilmModule } from './film/film.module';
import { BioskopModule } from './bioskop/bioskop.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    PenggunaModule,
    FilmModule,
    BioskopModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}