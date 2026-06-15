import { Module } from '@nestjs/common';
import { BioskopController } from './bioskop.controller';
import { BioskopService } from './bioskop.service';

@Module({
  controllers: [BioskopController],
  providers: [BioskopService]
})
export class BioskopModule {}
