import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Menjadikan modul ini global agar tidak perlu di-import berulang kali
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}