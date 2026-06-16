import {
    IsInt,
    IsString,
    IsNotEmpty,
  } from 'class-validator';
  
  import { Type } from 'class-transformer';
  
  import { ApiProperty } from '@nestjs/swagger';
  
  export class CreatePembayaranDto {
  
    @ApiProperty({
      example: 1,
    })
    @Type(() => Number)
    @IsInt()
    id_pemesanan: number;
  
    @ApiProperty({
      example: 'QRIS',
    })
    @IsString()
    @IsNotEmpty()
    metode: string;
  }