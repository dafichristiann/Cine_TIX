import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PenggunaModule } from './pengguna/pengguna.module';

@Module({
  imports: [PenggunaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
