import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateFilmDto {
  @IsString()
  judul: string;

  @IsString()
  genre: string;

  @IsInt()
  durasi: number;

  @IsString()
  rating: string;

  @IsString()
  sinopsis: string;

  @IsOptional()
  @IsString()
  poster_url?: string;

  @IsDateString()
  tanggal_rilis: string;

  @IsString()
  bahasa: string;
}