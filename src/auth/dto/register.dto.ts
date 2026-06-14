import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password minimal harus 6 karakter' })
  password!: string;

  @IsString()
  @IsOptional()
  nama?: string;

  @IsString()
  @IsOptional()
  no_telepon?: string; // Menghilangkan error no_telepon

  @IsString()
  @IsOptional()
  role?: string; // Menghilangkan error role

  @IsString()
  @IsOptional()
  status?: string; // Menghilangkan error status
}