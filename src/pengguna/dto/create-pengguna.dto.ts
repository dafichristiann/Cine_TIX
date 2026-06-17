// src/pengguna/dto/create-pengguna.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePenggunaDto {
  @ApiProperty({ example: 'dafi@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'rahasia123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password minimal harus 6 karakter' })
  password!: string;

  @ApiProperty({ example: 'Dafi Christian', required: false })
  @IsString()
  @IsOptional()
  nama?: string;

  @ApiProperty({ example: '081234567890', required: false })
  @IsString()
  @IsOptional()
  no_telepon?: string;

  @ApiProperty({ example: 'user', required: false })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({ example: 'active', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}