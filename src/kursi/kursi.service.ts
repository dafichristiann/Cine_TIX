import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKursiDto } from './dto/create-kursi.dto';
import { UpdateKursiDto } from './dto/update-kursi.dto';

@Injectable()
export class KursiService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateKursiDto) {
    // Validasi studio exist
    const studio = await this.prisma.studio.findUnique({
      where: { id_studio: dto.id_studio },
    });
    if (!studio) {
      throw new NotFoundException('Studio tidak ditemukan');
    }

    // Validasi nomor kursi tidak duplikat dalam studio yang sama
    const existing = await this.prisma.kursi.findFirst({
      where: {
        id_studio: dto.id_studio,
        nomor_kursi: dto.nomor_kursi,
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Kursi ${dto.nomor_kursi} sudah ada di studio ini`,
      );
    }

    return this.prisma.kursi.create({
      data: dto,
      include: { studio: true },
    });
  }

  async createBulk(id_studio: number, dtos: CreateKursiDto[]) {
    // Validasi studio exist
    const studio = await this.prisma.studio.findUnique({
      where: { id_studio },
    });
    if (!studio) {
      throw new NotFoundException('Studio tidak ditemukan');
    }

    // Paksa semua dto pakai id_studio dari param
    const data = dtos.map((dto) => ({ ...dto, id_studio }));

    return this.prisma.kursi.createMany({
      data,
      skipDuplicates: true,
    });
  }

  findAll() {
    return this.prisma.kursi.findMany({
      include: { studio: true },
    });
  }

  findByStudio(id_studio: number) {
    return this.prisma.kursi.findMany({
      where: { id_studio },
      orderBy: [{ baris: 'asc' }, { nomor_kursi: 'asc' }],
    });
  }

  async findOne(id: number) {
    const kursi = await this.prisma.kursi.findUnique({
      where: { id_kursi: id },
      include: { studio: true },
    });

    if (!kursi) {
      throw new NotFoundException('Kursi tidak ditemukan');
    }

    return kursi;
  }

  async update(id: number, dto: UpdateKursiDto) {
    await this.findOne(id);

    // Jika ganti studio, validasi studio baru
    if (dto.id_studio) {
      const studio = await this.prisma.studio.findUnique({
        where: { id_studio: dto.id_studio },
      });
      if (!studio) {
        throw new NotFoundException('Studio tidak ditemukan');
      }
    }

    return this.prisma.kursi.update({
      where: { id_kursi: id },
      data: dto,
      include: { studio: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.kursi.delete({
      where: { id_kursi: id },
    });
  }
}