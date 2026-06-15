import { Module } from '@nestjs/common';
import { KursiService } from './kursi.service';
import { KursiController } from './kursi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KursiController],
  providers: [KursiService],
  exports: [KursiService], // ← export untuk dipakai Module SlotKursi nanti
})
export class KursiModule {}