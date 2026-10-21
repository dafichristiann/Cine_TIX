import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CinemaFeaturesService, ConcessionItem } from './cinema-features.service';

export class ValidatePromoDto {
  @ApiProperty({ example: 'CINETIX10', description: 'Kode voucher atau kupon diskon' })
  @IsString()
  @IsNotEmpty({ message: 'Kode promo wajib diisi' })
  code!: string;

  @ApiProperty({ example: 50000, description: 'Subtotal pesanan tiket' })
  @IsNumber()
  subtotal!: number;
}

@ApiTags('Cinema Features')
@Controller('cinema-features')
export class CinemaFeaturesController {
  constructor(private readonly cinemaFeaturesService: CinemaFeaturesService) {}

  @Get('concessions')
  @ApiOperation({ summary: 'Daftar menu makanan dan minuman bioskop (F&B)' })
  getConcessions(): ConcessionItem[] {
    return this.cinemaFeaturesService.getConcessions();
  }

  @Post('promo/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validasi kode voucher atau promo diskon' })
  validatePromo(@Body() body: ValidatePromoDto) {
    return this.cinemaFeaturesService.validatePromo(body.code, body.subtotal);
  }
}
