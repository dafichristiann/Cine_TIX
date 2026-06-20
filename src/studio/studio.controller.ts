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

import { StudioService } from './studio.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Studio')
@Controller('studio')
export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tambah studio baru' })
  create(@Body() dto: CreateStudioDto) {
    return this.studioService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua studio (opsional filter by bioskop)' })
  @ApiQuery({ name: 'id_bioskop', required: false, type: Number })
  findAll(@Query('id_bioskop') id_bioskop?: string) {
    if (id_bioskop) {
      return this.studioService.findByBioskop(+id_bioskop);
    }
    return this.studioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail studio beserta kursi' })
  findOne(@Param('id') id: string) {
    return this.studioService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update studio' })
  update(@Param('id') id: string, @Body() dto: UpdateStudioDto) {
    return this.studioService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Hapus studio' })
  remove(@Param('id') id: string) {
    return this.studioService.remove(+id);
  }
}
