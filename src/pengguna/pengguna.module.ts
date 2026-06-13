import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pengguna } from './entities/pengguna.entity';
import { PenggunaService } from './pengguna.service';
import { PenggunaController } from './pengguna.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pengguna])],
  controllers: [PenggunaController],
  providers: [PenggunaService],
  exports: [PenggunaService],
})
export class PenggunaModule {}
