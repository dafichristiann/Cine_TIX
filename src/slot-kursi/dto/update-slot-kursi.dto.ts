import {
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { SlotStatus } from '@prisma/client';

export class UpdateSlotKursiDto {

  @ApiProperty({
    enum: SlotStatus,
    example: SlotStatus.TERSEDIA,
  })
  @IsEnum(SlotStatus)
  status!: SlotStatus;

  @ApiProperty({
    required: false,
    example: '2024-12-25T13:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  locked_until?: string;
}