import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';

@Injectable()
export class JadwalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJadwalDto) {
    // Validasi film exist
    const film = await this.prisma.film.findUnique({
      where: { id_film: dto.id_film },
    });
    if (!film) {
      throw new NotFoundException('Film tidak ditemukan');
    }

    // Validasi studio exist
    const studio = await this.prisma.studio.findUnique({
      where: { id_studio: dto.id_studio },
    });
    if (!studio) {
      throw new NotFoundException('Studio tidak ditemukan');
    }

    // Validasi tidak ada jadwal bentrok di studio yang sama
    const bentrok = await this.prisma.jadwal.findFirst({
      where: {
        id_studio: dto.id_studio,
        tanggal: new Date(dto.tanggal),
        OR: [
          {
            jam_mulai: { lte: dto.jam_mulai },
            jam_selesai: { gt: dto.jam_mulai },
          },
          {
            jam_mulai: { lt: dto.jam_selesai },
            jam_selesai: { gte: dto.jam_selesai },
          },
        ],
      },
    });
    if (bentrok) {
      throw new BadRequestException(
        `Studio sudah ada jadwal pada jam ${bentrok.jam_mulai} - ${bentrok.jam_selesai}`,
      );
    }

    const jadwal = await this.prisma.jadwal.create({
      data: {
        ...dto,
        tanggal: new Date(dto.tanggal),
        harga: dto.harga,
      },
      include: {
        film: true,
        studio: { include: { bioskop: true } },
      },
    });

    // Auto-generate SlotKursi untuk semua kursi di studio
    const kursiList = await this.prisma.kursi.findMany({
      where: { id_studio: dto.id_studio },
    });

    if (kursiList.length > 0) {
      await this.prisma.slotKursi.createMany({
        data: kursiList.map((kursi) => ({
          id_jadwal: jadwal.id_jadwal,
          id_kursi: kursi.id_kursi,
          status: 'TERSEDIA',
        })),
      });
    }

    return jadwal;
  }

  findAll() {
    return this.prisma.jadwal.findMany({
      include: {
        film: true,
        studio: { include: { bioskop: true } },
      },
      orderBy: [{ tanggal: 'asc' }, { jam_mulai: 'asc' }],
    });
  }

  findByFilm(id_film: number) {
    return this.prisma.jadwal.findMany({
      where: { id_film },
      include: {
        film: true,
        studio: { include: { bioskop: true } },
      },
      orderBy: [{ tanggal: 'asc' }, { jam_mulai: 'asc' }],
    });
  }

  findByStudio(id_studio: number) {
    return this.prisma.jadwal.findMany({
      where: { id_studio },
      include: {
        film: true,
        studio: { include: { bioskop: true } },
      },
      orderBy: [{ tanggal: 'asc' }, { jam_mulai: 'asc' }],
    });
  }

  async findOne(id: number) {
    const jadwal = await this.prisma.jadwal.findUnique({
      where: { id_jadwal: id },
      include: {
        film: true,
        studio: { include: { bioskop: true } },
        slots: {
          include: { kursi: true },
          orderBy: [
            { kursi: { baris: 'asc' } },
            { kursi: { nomor_kursi: 'asc' } },
          ],
        },
      },
    });

    if (!jadwal) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    return jadwal;
  }

  async update(id: number, dto: UpdateJadwalDto) {
    await this.findOne(id);

    if (dto.id_film) {
      const film = await this.prisma.film.findUnique({
        where: { id_film: dto.id_film },
      });
      if (!film) throw new NotFoundException('Film tidak ditemukan');
    }

    if (dto.id_studio) {
      const studio = await this.prisma.studio.findUnique({
        where: { id_studio: dto.id_studio },
      });
      if (!studio) throw new NotFoundException('Studio tidak ditemukan');
    }

    return this.prisma.jadwal.update({
      where: { id_jadwal: id },
      data: {
        ...dto,
        tanggal: dto.tanggal ? new Date(dto.tanggal) : undefined,
      },
      include: {
        film: true,
        studio: { include: { bioskop: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Hapus semua SlotKursi terkait terlebih dahulu
    await this.prisma.slotKursi.deleteMany({
      where: { id_jadwal: id },
    });

    return this.prisma.jadwal.delete({
      where: { id_jadwal: id },
    });
  }
}