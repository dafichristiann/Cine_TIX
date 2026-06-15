import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { JadwalService } from './jadwal.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';

@ApiTags('Jadwal')
@Controller('jadwal')
export class JadwalController {
  constructor(private readonly jadwalService: JadwalService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah jadwal tayang baru' })
  create(@Body() dto: CreateJadwalDto) {
    return this.jadwalService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua jadwal (opsional filter by film/studio)' })
  @ApiQuery({ name: 'id_film', required: false, type: Number })
  @ApiQuery({ name: 'id_studio', required: false, type: Number })
  findAll(
    @Query('id_film') id_film?: string,
    @Query('id_studio') id_studio?: string,
  ) {
    if (id_film) return this.jadwalService.findByFilm(+id_film);
    if (id_studio) return this.jadwalService.findByStudio(+id_studio);
    return this.jadwalService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail jadwal beserta slot kursi' })
  findOne(@Param('id') id: string) {
    return this.jadwalService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update jadwal' })
  update(@Param('id') id: string, @Body() dto: UpdateJadwalDto) {
    return this.jadwalService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus jadwal beserta slot kursinya' })
  remove(@Param('id') id: string) {
    return this.jadwalService.remove(+id);
  }
}