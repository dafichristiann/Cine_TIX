import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateBioskopDto } from './dto/create-bioskop.dto';
import { UpdateBioskopDto } from './dto/update-bioskop.dto';

@Injectable()
export class BioskopService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  create(createBioskopDto: CreateBioskopDto) {
    return this.prisma.bioskop.create({
      data: createBioskopDto,
    });
  }

  findAll() {
    return this.prisma.bioskop.findMany();
  }

  async findOne(id: number) {
    const bioskop =
      await this.prisma.bioskop.findUnique({
        where: {
          id_bioskop: id,
        },
      });

    if (!bioskop) {
      throw new NotFoundException(
        'Bioskop tidak ditemukan',
      );
    }

    return bioskop;
  }

  async update(
    id: number,
    dto: UpdateBioskopDto,
  ) {
    await this.findOne(id);

    return this.prisma.bioskop.update({
      where: {
        id_bioskop: id,
      },
      data: dto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    const studioCount = await this.prisma.studio.count({ where: { id_bioskop: id } });
    if (studioCount) {
      throw new BadRequestException('Bioskop yang masih memiliki studio tidak dapat dihapus');
    }

    return this.prisma.bioskop.delete({
      where: {
        id_bioskop: id,
      },
    });
  }
}
