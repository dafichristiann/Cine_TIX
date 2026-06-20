import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';

@Injectable()
export class FilmService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(createFilmDto: CreateFilmDto) {
    return this.prisma.film.create({
      data: {
        ...createFilmDto,
        tanggal_rilis: new Date(createFilmDto.tanggal_rilis),
      },
    });
  }

  async findAll() {
    return this.prisma.film.findMany({
      orderBy: {
        id_film: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const film = await this.prisma.film.findUnique({
      where: {
        id_film: id,
      },
    });

    if (!film) {
      throw new NotFoundException('Film tidak ditemukan');
    }

    return film;
  }

  async update(
    id: number,
    updateFilmDto: UpdateFilmDto,
  ) {
    await this.findOne(id);

    return this.prisma.film.update({
      where: {
        id_film: id,
      },
      data: {
        ...updateFilmDto,
        ...(updateFilmDto.tanggal_rilis && {
          tanggal_rilis: new Date(
            updateFilmDto.tanggal_rilis,
          ),
        }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const scheduleCount = await this.prisma.jadwal.count({ where: { id_film: id } });
    if (scheduleCount) {
      throw new BadRequestException('Film yang masih memiliki jadwal tidak dapat dihapus');
    }

    return this.prisma.film.delete({
      where: {
        id_film: id,
      },
    });
  }
}
