import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { generateSeatLayout } from '../kursi/seat-layout';

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

    return this.prisma.$transaction(async (tx) => {
      const studio = await tx.studio.create({ data: dto });
      await tx.kursi.createMany({
        data: generateSeatLayout(dto.kapasitas).map((seat) => ({
          ...seat,
          id_studio: studio.id_studio,
        })),
      });

      return tx.studio.findUniqueOrThrow({
        where: { id_studio: studio.id_studio },
        include: { bioskop: true, kursi: true },
      });
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
    const current = await this.findOne(id);

    // Jika ganti bioskop, validasi bioskop baru
    if (dto.id_bioskop) {
      const bioskop = await this.prisma.bioskop.findUnique({
        where: { id_bioskop: dto.id_bioskop },
      });
      if (!bioskop) {
        throw new NotFoundException('Bioskop tidak ditemukan');
      }
    }

    if (dto.kapasitas && dto.kapasitas < current.kursi.length) {
      throw new BadRequestException(
        `Kapasitas tidak boleh lebih kecil dari ${current.kursi.length} kursi yang sudah ada`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const studio = await tx.studio.update({
        where: { id_studio: id },
        data: dto,
      });

      if (dto.kapasitas && dto.kapasitas > current.kursi.length) {
        const existingNumbers = new Set(current.kursi.map((seat) => seat.nomor_kursi));
        const newSeats = generateSeatLayout(dto.kapasitas)
          .filter((seat) => !existingNumbers.has(seat.nomor_kursi))
          .map((seat) => ({ ...seat, id_studio: id }));

        if (newSeats.length) {
          await tx.kursi.createMany({ data: newSeats, skipDuplicates: true });
          const createdSeats = await tx.kursi.findMany({
            where: { id_studio: id, nomor_kursi: { in: newSeats.map((seat) => seat.nomor_kursi) } },
          });
          const schedules = await tx.jadwal.findMany({ where: { id_studio: id } });

          await tx.slotKursi.createMany({
            data: schedules.flatMap((schedule) => createdSeats.map((seat) => ({
              id_jadwal: schedule.id_jadwal,
              id_kursi: seat.id_kursi,
              status: 'TERSEDIA' as const,
            }))),
            skipDuplicates: true,
          });
        }
      }

      return tx.studio.findUniqueOrThrow({
        where: { id_studio: studio.id_studio },
        include: { bioskop: true, kursi: true },
      });
    });
  }

  async remove(id: number) {
    const studio = await this.findOne(id);
    const scheduleCount = await this.prisma.jadwal.count({ where: { id_studio: id } });
    if (scheduleCount) {
      throw new BadRequestException('Studio yang memiliki jadwal tidak dapat dihapus');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.kursi.deleteMany({ where: { id_studio: id } });
      await tx.studio.delete({ where: { id_studio: id } });
      return { message: `${studio.nama_studio} berhasil dihapus` };
    });
  }
}
