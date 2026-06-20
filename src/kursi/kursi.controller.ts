import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

import { KursiService } from './kursi.service';
import { CreateKursiDto } from './dto/create-kursi.dto';
import { UpdateKursiDto } from './dto/update-kursi.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Kursi')
@Controller('kursi')
export class KursiController {
  constructor(private readonly kursiService: KursiService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tambah kursi satu per satu' })
  create(@Body() dto: CreateKursiDto) {
    return this.kursiService.create(dto);
  }

  @Post('bulk/:id_studio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tambah banyak kursi sekaligus dalam satu studio' })
  createBulk(
    @Param('id_studio') id_studio: string,
    @Body() dtos: CreateKursiDto[],
  ) {
    return this.kursiService.createBulk(+id_studio, dtos);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua kursi (opsional filter by studio)' })
  @ApiQuery({ name: 'id_studio', required: false, type: Number })
  findAll(@Query('id_studio') id_studio?: string) {
    if (id_studio) {
      return this.kursiService.findByStudio(+id_studio);
    }
    return this.kursiService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail kursi' })
  findOne(@Param('id') id: string) {
    return this.kursiService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update kursi' })
  update(@Param('id') id: string, @Body() dto: UpdateKursiDto) {
    return this.kursiService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Hapus kursi' })
  remove(@Param('id') id: string) {
    return this.kursiService.remove(+id);
  }
}
