import { IsString } from 'class-validator';

export class CreateBioskopDto {
  @IsString()
  nama_bioskop!: string;

  @IsString()
  kota!: string;

  @IsString()
  alamat!: string;

  @IsString()
  telepon!: string;
}