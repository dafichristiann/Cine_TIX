import { Module } from '@nestjs/common';
import { SlotKursiService } from './slot-kursi.service';

@Module({
  providers: [SlotKursiService],

  exports: [
    SlotKursiService,
  ],
})
export class SlotKursiModule {}