import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'dafi.christian@example.com', 
    description: 'Email pengguna yang sudah terdaftar' 
  })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email!: string;

  @ApiProperty({ 
    example: 'rahasia123', 
    description: 'Password akun' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  password!: string;
}