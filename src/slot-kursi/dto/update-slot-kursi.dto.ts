import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSlotKursiDto {
  @ApiProperty({
    example: 'DIPESAN',
    enum: ['TERSEDIA', 'DIPESAN', 'TERKUNCI'],
  })
  @IsString()
  status!: string;

  @ApiProperty({ example: '2024-12-25T13:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  locked_until?: string;
}