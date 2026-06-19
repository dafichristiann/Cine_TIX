import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Req,
    Query,
    ParseIntPipe,
  } from '@nestjs/common';
  
  import {
    ApiBearerAuth,
    ApiTags,
  } from '@nestjs/swagger';
  
  import { PembayaranService } from './pembayaran.service';
  
  import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
  
  import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
  
  import { RolesGuard } from '../common/guards/roles.guard';
  
  import { Roles } from '../common/decorators/roles.decorator';
  
  import { UserRole } from '../common/enums/user-role.enum';
  
  @ApiTags('Pembayaran')
  @Controller('pembayaran')
  export class PembayaranController {
  
    constructor(
      private readonly service: PembayaranService,
    ) {}
  
    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async buat(
      @Body()
      dto: CreatePembayaranDto,
  
      @Req()
      req: any,
    ) {
      return this.service.buatPembayaran(
        dto,
        req.user.id_pengguna,
      );
    }

    @Post(':id_pemesanan/simulasi-berhasil')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async simulasiBerhasil(
      @Param('id_pemesanan', ParseIntPipe)
      id_pemesanan: number,

      @Req()
      req: any,
    ) {
      return this.service.simulasiBerhasil(
        id_pemesanan,
        req.user.id_pengguna,
      );
    }
  
    @Post('webhook')
    async webhook(
      @Body()
      body: {
        ref_gateway: string;
        statusGateway:
          | 'success'
          | 'failed';
      },
    ) {
      return this.service.handleWebhook(
        body.ref_gateway,
        body.statusGateway,
      );
    }
  
    @Post(':id/refund')
    @ApiBearerAuth()
    @UseGuards(
      JwtAuthGuard,
      RolesGuard,
    )
    @Roles(UserRole.ADMIN)
    async refund(
      @Param(
        'id',
        ParseIntPipe,
      )
      id: number,
    ) {
      return this.service.refund(id);
    }
  
    @Get('laporan')
    @ApiBearerAuth()
    @UseGuards(
      JwtAuthGuard,
      RolesGuard,
    )
    @Roles(UserRole.ADMIN)
    async laporan() {
      return this.service.laporanPendapatan();
    }
  }
