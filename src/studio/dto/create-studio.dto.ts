import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudioDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_bioskop!: number;

  @ApiProperty({ example: 'Studio 1' })
  @IsString()
  nama_studio!: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  kapasitas!: number;

  @ApiProperty({ example: 'REGULER', enum: ['REGULER', 'IMAX', '4DX'] })
  @IsString()
  tipe!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  lantai!: number;
}