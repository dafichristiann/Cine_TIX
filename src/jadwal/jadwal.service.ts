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
    // 1. Validasi film exist
    const film = await this.prisma.film.findUnique({
      where: { id_film: dto.id_film },
    });
    if (!film) {
      throw new NotFoundException('Film tidak ditemukan');
    }

    // 2. Validasi studio exist
    const studio = await this.prisma.studio.findUnique({
      where: { id_studio: dto.id_studio },
    });
    if (!studio) {
      throw new NotFoundException('Studio tidak ditemukan');
    }

    // 3. Validasi tidak ada jadwal bentrok di studio yang sama
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

    // 4. Jalankan Transaksi agar Jadwal dan SlotKursi terbuat utuh bersamaan
    return this.prisma.$transaction(async (tx) => {
      // A. Buat Jadwal
      const jadwal = await tx.jadwal.create({
        data: {
          id_film: dto.id_film,
          id_studio: dto.id_studio,
          tanggal: new Date(dto.tanggal),
          jam_mulai: dto.jam_mulai,
          jam_selesai: dto.jam_selesai,
          harga: dto.harga, // Prisma otomatis mapping string decimal ke Decimal postgres
        },
        include: {
          film: true,
          studio: { include: { bioskop: true } },
        },
      });

      // B. Ambil semua kursi di studio tersebut
      const kursiList = await tx.kursi.findMany({
        where: { id_studio: dto.id_studio },
      });

      // C. Auto-generate SlotKursi
      if (kursiList.length > 0) {
        await tx.slotKursi.createMany({
          data: kursiList.map((kursi) => ({
            id_jadwal: jadwal.id_jadwal,
            id_kursi: kursi.id_kursi,
            status: 'TERSEDIA',
          })),
        });
      }

      return jadwal;
    });
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
        id_film: dto.id_film,
        id_studio: dto.id_studio,
        tanggal: dto.tanggal ? new Date(dto.tanggal) : undefined,
        jam_mulai: dto.jam_mulai,
        jam_selesai: dto.jam_selesai,
        harga: dto.harga,
      },
      include: {
        film: true,
        studio: { include: { bioskop: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // Dibungkus transaksi agar proses penghapusan berantai aman
    return this.prisma.$transaction(async (tx) => {
      // Hapus semua SlotKursi terkait terlebih dahulu
      await tx.slotKursi.deleteMany({
        where: { id_jadwal: id },
      });

      // Baru hapus jadwalnya
      return tx.jadwal.delete({
        where: { id_jadwal: id },
      });
    });
  }
}