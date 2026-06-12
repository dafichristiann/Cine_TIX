import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'dafi@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({ example: 'rahasia123' })
  @IsString()
  password!: string;
}