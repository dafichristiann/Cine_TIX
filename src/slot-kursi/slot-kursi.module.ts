import { Module } from '@nestjs/common';
import { SlotKursiController } from './slot-kursi.controller';
import { SlotKursiService } from './slot-kursi.service';

@Module({
  controllers: [SlotKursiController],
  providers: [SlotKursiService]
})
export class SlotKursiModule {}
