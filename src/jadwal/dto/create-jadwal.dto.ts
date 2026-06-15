import { IsString, IsInt, IsDateString, IsDecimal } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJadwalDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_film!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  id_studio!: number;

  @ApiProperty({ example: '2024-12-25' })
  @IsDateString()
  tanggal!: string;

  @ApiProperty({ example: '13:00' })
  @IsString()
  jam_mulai!: string;

  @ApiProperty({ example: '15:00' })
  @IsString()
  jam_selesai!: string;

  @ApiProperty({ example: '50000' })
  @IsDecimal()
  harga!: string;
}