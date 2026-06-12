import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PenggunaModule } from './pengguna/pengguna.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [PenggunaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
