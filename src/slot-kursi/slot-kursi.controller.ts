import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { SlotKursiService } from './slot-kursi.service';
import { UpdateSlotKursiDto } from './dto/update-slot-kursi.dto';
import { LockSlotKursiDto } from './dto/lock-slot-kursi.dto';

@ApiTags('Slot Kursi')
@Controller('slot-kursi')
export class SlotKursiController {
  constructor(private readonly slotKursiService: SlotKursiService) {}

  @Get('jadwal/:id_jadwal')
  @ApiOperation({ summary: 'Ambil semua slot kursi berdasarkan jadwal' })
  findByJadwal(@Param('id_jadwal') id_jadwal: string) {
    return this.slotKursiService.findByJadwal(+id_jadwal);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail satu slot kursi' })
  findOne(@Param('id') id: string) {
    return this.slotKursiService.findOne(+id);
  }

  @Post('lock')
  @ApiOperation({ summary: 'Kunci kursi sementara (10 menit) saat user memilih' })
  lockSlots(@Body() dto: LockSlotKursiDto) {
    return this.slotKursiService.lockSlots(dto);
  }

  @Post('release')
  @ApiOperation({ summary: 'Lepas kunci kursi (batal pilih)' })
  releaseSlots(@Body() dto: LockSlotKursiDto) {
    return this.slotKursiService.releaseSlots(dto);
  }

  @Post('release-expired')
  @ApiOperation({ summary: 'Reset semua lock yang sudah expired (admin/cron)' })
  releaseExpiredLocks() {
    return this.slotKursiService.releaseExpiredLocks();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update status slot kursi (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateSlotKursiDto) {
    return this.slotKursiService.update(+id, dto);
  }
}