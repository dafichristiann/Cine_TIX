import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'dafi.christian@example.com', 
    description: 'Email unik untuk pendaftaran akun baru' 
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email!: string;

  @ApiProperty({ 
    example: 'rahasia123', 
    description: 'Password minimal 6 karakter' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password minimal harus 6 karakter' })
  password!: string;

  @ApiProperty({ 
    example: 'Dafi Christian', 
    required: false,
    description: 'Nama lengkap pengguna'
  })
  @IsString()
  @IsOptional()
  nama?: string;

  @ApiProperty({ 
    example: '081234567890', 
    required: false,
    description: 'Nomor telepon aktif'
  })
  @IsString()
  @IsOptional()
  no_telepon?: string;

  @ApiProperty({ 
    example: 'user', 
    required: false, 
    default: 'user',
    description: 'Role akses pengguna'
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({ 
    example: 'active', 
    required: false, 
    default: 'active',
    description: 'Status akun saat ini'
  })
  @IsString()
  @IsOptional()
  status?: string;
}