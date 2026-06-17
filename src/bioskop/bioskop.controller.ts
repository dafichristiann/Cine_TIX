import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { BioskopService } from './bioskop.service';
import { CreateBioskopDto } from './dto/create-bioskop.dto';
import { UpdateBioskopDto } from './dto/update-bioskop.dto';

@Controller('bioskop')
export class BioskopController {
  constructor(
    private readonly bioskopService: BioskopService,
  ) {}

  @Post()
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
  remove(
    @Param('id') id: string,
  ) {
    return this.bioskopService.remove(+id);
  }
}