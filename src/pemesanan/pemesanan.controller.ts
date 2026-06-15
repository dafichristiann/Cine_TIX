import {
    Controller,
    Post,
    Get,
    Body,
    Param,
  } from '@nestjs/common';
  
  import { PemesananService } from './pemesanan.service';
  import { CreatePemesananDto } from './dto/create-pemesanan.dto';
  
  @Controller('pemesanan')
  export class PemesananController {
    constructor(
      private readonly service: PemesananService,
    ) {}
  
    @Post()
    create(
      @Body()
      dto: CreatePemesananDto,
    ) {
      return this.service.create(
        dto,
        1,
      );
    }
  
    @Get(':id')
    findOne(
      @Param('id')
      id: string,
    ) {
      return this.service.findOne(
        Number(id),
      );
    }
  }