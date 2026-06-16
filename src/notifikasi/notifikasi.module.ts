import { Module } from '@nestjs/common';
import { NotifikasiService } from './notifikasi.service';

@Module({
  providers: [NotifikasiService],
  exports: [NotifikasiService],
})
export class NotifikasiModule {}