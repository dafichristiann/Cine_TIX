import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { ApiBearerAuth } from '@nestjs/swagger';
  
  import { PemesananService } from './pemesanan.service';
  import { CreatePemesananDto } from './dto/create-pemesanan.dto';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  
  @Controller('pemesanan')
  export class PemesananController {
    constructor(
      private readonly service: PemesananService,
    ) {}
  
    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    create(
      @Body()
      dto: CreatePemesananDto,
      @Req() req: any,
    ) {
      return this.service.create(
        dto,
        req.user.id_pengguna,
      );
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    findMine(@Req() req: any) {
      return this.service.findByUser(
        req.user.id_pengguna,
      );
    }

    @Post(':id/batal')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    cancel(
      @Param('id')
      id: string,
      @Req() req: any,
    ) {
      return this.service.batalkan(
        Number(id),
        req.user.id_pengguna,
      );
    }
  
    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    findOne(
      @Param('id')
      id: string,
      @Req() req: any,
    ) {
      return this.service.findOneForUser(
        Number(id),
        req.user.id_pengguna,
      );
    }
  }
