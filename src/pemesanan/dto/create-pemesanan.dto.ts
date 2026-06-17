import {
  IsInt,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePemesananDto {
  @ApiProperty({
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  id_jadwal: number;

  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayMinSize(1)
  id_slots: number[];
}