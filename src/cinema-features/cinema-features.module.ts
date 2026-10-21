import { Module } from '@nestjs/common';
import { CinemaFeaturesService } from './cinema-features.service';
import { CinemaFeaturesController } from './cinema-features.controller';

@Module({
  controllers: [CinemaFeaturesController],
  providers: [CinemaFeaturesService],
  exports: [CinemaFeaturesService],
})
export class CinemaFeaturesModule {}
