import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBioskopDto {
  @ApiProperty({
    example: 'CineTix Mall XXI',
    description: 'Nama cabang bioskop',
  })
  @IsString()
  nama_bioskop!: string;

  @ApiProperty({
    example: 'Jakarta Pusat',
    description: 'Kota lokasi bioskop berada',
  })
  @IsString()
  kota!: string;

  @ApiProperty({
    example: 'Jl. Jend. Sudirman No. Kav 21, Gelora, Kecamatan Tanah Abang',
    description: 'Alamat lengkap gedung bioskop',
  })
  @IsString()
  alamat!: string;

  @ApiProperty({
    example: '0215747221',
    description: 'Nomor telepon kontak aktif bioskop',
  })
  @IsString()
  telepon!: string;
}