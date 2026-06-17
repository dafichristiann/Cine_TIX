import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKursiDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_studio!: number;

  @ApiProperty({ example: 'A1' })
  @IsString()
  nomor_kursi!: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  baris!: string;

  @ApiProperty({ example: 'REGULER', enum: ['REGULER', 'VIP', 'COUPLE'] })
  @IsString()
  tipe_kursi!: string;
}