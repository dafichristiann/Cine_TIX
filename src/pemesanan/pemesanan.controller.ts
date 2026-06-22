import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Req,
    UseGuards,
    Query,
    Delete,
  } from '@nestjs/common';
  import { ApiBearerAuth } from '@nestjs/swagger';

  import { PemesananService } from './pemesanan.service';
  import { CreatePemesananDto } from './dto/create-pemesanan.dto';
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { UserRole } from '../common/enums/user-role.enum';

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

    @Get('admin/all')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll(
      @Query('status') status?: string,
      @Query('search') search?: string,
    ) {
      return this.service.findAllAdmin(status, search);
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

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(
      @Param('id')
      id: string,
    ) {
      return this.service.remove(Number(id));
    }
  }
