import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { BioskopService } from './bioskop.service';
import { CreateBioskopDto } from './dto/create-bioskop.dto';
import { UpdateBioskopDto } from './dto/update-bioskop.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('bioskop')
export class BioskopController {
  constructor(
    private readonly bioskopService: BioskopService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body() dto: CreateBioskopDto,
  ) {
    return this.bioskopService.create(dto);
  }

  @Get()
  findAll() {
    return this.bioskopService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.bioskopService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBioskopDto,
  ) {
    return this.bioskopService.update(
      +id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(
    @Param('id') id: string,
  ) {
    return this.bioskopService.remove(+id);
  }
}
