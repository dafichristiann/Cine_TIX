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

    return this.prisma.$transaction(async (tx) => {
      const seatCount = await tx.kursi.count({ where: { id_studio: dto.id_studio } });
      if (seatCount >= studio.kapasitas) {
        throw new BadRequestException('Jumlah kursi sudah mencapai kapasitas studio');
      }

      const seat = await tx.kursi.create({ data: dto });
      const schedules = await tx.jadwal.findMany({ where: { id_studio: dto.id_studio } });
      await tx.slotKursi.createMany({
        data: schedules.map((schedule) => ({
          id_jadwal: schedule.id_jadwal,
          id_kursi: seat.id_kursi,
          status: 'TERSEDIA',
        })),
        skipDuplicates: true,
      });

      return tx.kursi.findUniqueOrThrow({
        where: { id_kursi: seat.id_kursi },
        include: { studio: true },
      });
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

    const duplicateNumbers = dtos.filter(
      (dto, index) => dtos.findIndex((item) => item.nomor_kursi === dto.nomor_kursi) !== index,
    );
    if (duplicateNumbers.length) {
      throw new BadRequestException('Nomor kursi dalam permintaan tidak boleh duplikat');
    }

    const currentCount = await this.prisma.kursi.count({ where: { id_studio } });
    if (currentCount + dtos.length > studio.kapasitas) {
      throw new BadRequestException('Jumlah kursi melebihi kapasitas studio');
    }

    const data = dtos.map((dto) => ({ ...dto, id_studio }));
    return this.prisma.$transaction(async (tx) => {
      await tx.kursi.createMany({ data, skipDuplicates: true });
      const seats = await tx.kursi.findMany({
        where: { id_studio, nomor_kursi: { in: data.map((seat) => seat.nomor_kursi) } },
      });
      const schedules = await tx.jadwal.findMany({ where: { id_studio } });
      await tx.slotKursi.createMany({
        data: schedules.flatMap((schedule) => seats.map((seat) => ({
          id_jadwal: schedule.id_jadwal,
          id_kursi: seat.id_kursi,
          status: 'TERSEDIA' as const,
        }))),
        skipDuplicates: true,
      });
      return { count: seats.length };
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
    const current = await this.findOne(id);

    // Jika ganti studio, validasi studio baru
    if (dto.id_studio) {
      const studio = await this.prisma.studio.findUnique({
        where: { id_studio: dto.id_studio },
      });
      if (!studio) {
        throw new NotFoundException('Studio tidak ditemukan');
      }
      if (dto.id_studio !== current.id_studio) {
        const used = await this.prisma.detailPemesanan.count({ where: { slot: { id_kursi: id } } });
        if (used) throw new BadRequestException('Kursi yang memiliki riwayat tidak dapat dipindahkan');
        const seatCount = await this.prisma.kursi.count({ where: { id_studio: dto.id_studio } });
        if (seatCount >= studio.kapasitas) throw new BadRequestException('Studio tujuan sudah penuh');
      }
    }

    const targetStudio = dto.id_studio ?? current.id_studio;
    const targetNumber = dto.nomor_kursi ?? current.nomor_kursi;
    const duplicate = await this.prisma.kursi.findFirst({
      where: { id_kursi: { not: id }, id_studio: targetStudio, nomor_kursi: targetNumber },
    });
    if (duplicate) throw new BadRequestException(`Kursi ${targetNumber} sudah ada di studio ini`);

    return this.prisma.$transaction(async (tx) => {
      const seat = await tx.kursi.update({ where: { id_kursi: id }, data: dto });
      if (dto.id_studio && dto.id_studio !== current.id_studio) {
        await tx.slotKursi.deleteMany({ where: { id_kursi: id } });
        const schedules = await tx.jadwal.findMany({ where: { id_studio: dto.id_studio } });
        await tx.slotKursi.createMany({
          data: schedules.map((schedule) => ({
            id_jadwal: schedule.id_jadwal, id_kursi: id, status: 'TERSEDIA',
          })),
        });
      }
      return tx.kursi.findUniqueOrThrow({ where: { id_kursi: seat.id_kursi }, include: { studio: true } });
    });
  }

  async remove(id: number) {
    const seat = await this.findOne(id);
    const used = await this.prisma.detailPemesanan.count({
      where: { slot: { id_kursi: id } },
    });
    if (used) {
      throw new BadRequestException('Kursi yang memiliki riwayat pemesanan tidak dapat dihapus');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.slotKursi.deleteMany({ where: { id_kursi: id } });
      await tx.kursi.delete({ where: { id_kursi: id } });
      await tx.studio.update({
        where: { id_studio: seat.id_studio },
        data: { kapasitas: { decrement: 1 } },
      });
      return { message: 'Kursi berhasil dihapus' };
    });
  }
}
