import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';

@Injectable()
export class StudioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudioDto) {
    // Validasi bioskop exist
    const bioskop = await this.prisma.bioskop.findUnique({
      where: { id_bioskop: dto.id_bioskop },
    });
    if (!bioskop) {
      throw new NotFoundException('Bioskop tidak ditemukan');
    }

    return this.prisma.studio.create({
      data: dto,
      include: { bioskop: true },
    });
  }

  findAll() {
    return this.prisma.studio.findMany({
      include: { bioskop: true },
    });
  }

  findByBioskop(id_bioskop: number) {
    return this.prisma.studio.findMany({
      where: { id_bioskop },
      include: { bioskop: true },
    });
  }

  async findOne(id: number) {
    const studio = await this.prisma.studio.findUnique({
      where: { id_studio: id },
      include: {
        bioskop: true,
        kursi: true,
      },
    });

    if (!studio) {
      throw new NotFoundException('Studio tidak ditemukan');
    }

    return studio;
  }

  async update(id: number, dto: UpdateStudioDto) {
    await this.findOne(id);

    // Jika ganti bioskop, validasi bioskop baru
    if (dto.id_bioskop) {
      const bioskop = await this.prisma.bioskop.findUnique({
        where: { id_bioskop: dto.id_bioskop },
      });
      if (!bioskop) {
        throw new NotFoundException('Bioskop tidak ditemukan');
      }
    }

    return this.prisma.studio.update({
      where: { id_studio: id },
      data: dto,
      include: { bioskop: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.studio.delete({
      where: { id_studio: id },
    });
  }
}