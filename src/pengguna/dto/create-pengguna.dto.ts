import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePenggunaDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6) // Validasi opsional agar password aman
  password!: string; // Tambahkan ini agar error baris 30 hilang

  @IsString()
  @IsOptional()
  nama?: string;

  @IsString()
  @IsOptional()
  no_telepon?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  status?: string;
}