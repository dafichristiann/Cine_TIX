import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFilmDto {
  @ApiProperty({
    example: 'Avengers: Endgame',
    description: 'Judul film yang akan ditayangkan',
  })
  @IsString()
  judul: string;

  @ApiProperty({
    example: 'Aksi, Sci-Fi, Petualangan',
    description: 'Genre atau kategori film (bisa berupa string pisahan koma)',
  })
  @IsString()
  genre: string;

  @ApiProperty({
    example: 181,
    description: 'Durasi film dalam satuan menit',
  })
  @IsInt()
  durasi: number;

  @ApiProperty({
    example: 'R13+',
    description: 'Rating usia penonton (misal: SU, R13+, D17+)',
  })
  @IsString()
  rating: string;

  @ApiProperty({
    example: 'Melanjutkan perjuangan pahlawan super yang tersisa untuk membalikkan aksi Thanos...',
    description: 'Sinopsis singkat plot cerita film',
  })
  @IsString()
  sinopsis: string;

  @ApiProperty({
    example: 'https://image.tmdb.org/t/p/w500/or066ViS0zZgfhbe57w9ZPT1Zp9.jpg',
    required: false,
    description: 'URL tautan gambar poster film',
  })
  @IsOptional()
  @IsString()
  poster_url?: string;

  @ApiProperty({
    example: '2019-04-26T00:00:00.000Z',
    description: 'Tanggal rilis resmi film dalam format ISO Date String',
  })
  @IsDateString()
  tanggal_rilis: string;

  @ApiProperty({
    example: 'Inggris',
    description: 'Bahasa utama yang digunakan dalam dialog film',
  })
  @IsString()
  bahasa: string;
}