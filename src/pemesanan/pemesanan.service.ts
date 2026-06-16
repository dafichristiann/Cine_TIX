import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { SlotKursiService } from '../slot-kursi/slot-kursi.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { CreatePemesananDto } from './dto/create-pemesanan.dto';
import { BookingStatus } from '../common/enums/booking-status.enum';
import { NotifType } from '../common/enums/notif-type.enum';
import { JadwalService } from '../jadwal/jadwal.service';

@Injectable()
export class PemesananService {
    constructor(
        private prisma: PrismaService,
        private slotService: SlotKursiService,
        private notifService: NotifikasiService,
        private jadwalService: JadwalService,
      ) {}

      generateKodeBooking(): string {
        return `BK-${Date.now().toString(36).toUpperCase()}-${uuidv4()
          .slice(0, 4)
          .toUpperCase()}`;
      }
      
      generateKodeTiket(): string {
        return `TK-${uuidv4()
          .slice(0, 8)
          .toUpperCase()}`;
      }

  async create(
    dto: CreatePemesananDto,
    id_pengguna: number,
  ) {
  
    const jadwal =
      await this.jadwalService.findOne(
        dto.id_jadwal,
      );
  
      await this.slotService.lockSlots({
        id_slots: dto.id_slots,
      });
  
    const total_harga =
      Number(jadwal.harga) *
      dto.id_slots.length;
  
    const expired_at =
      new Date(
        Date.now() + 15 * 60 * 1000,
      );
  
    try {
  
      const result = await this.prisma.$transaction(
        async (tx) => {
          const pemesanan = await tx.pemesanan.create({
            data: {
              id_pengguna,
              id_jadwal: dto.id_jadwal,
              total_harga,
              kode_booking: this.generateKodeBooking(),
              expired_at,
              jumlah_tiket: dto.id_slots.length,
              status: 'PENDING',
            },
          });
      
          await tx.detailPemesanan.createMany({
            data: dto.id_slots.map((slotId) => ({
              id_pemesanan: pemesanan.id_pemesanan,
              id_slot: slotId,
              harga_satuan: Number(jadwal.harga),
              kode_tiket: this.generateKodeTiket(),
            })),
          });
      
          return pemesanan;
        },
      );
  
      await this.notifService.kirim({
        id_pengguna,
        id_pemesanan:
          result.id_pemesanan,
        pesan:
          `Pemesanan ${result.kode_booking} berhasil dibuat.`,
        tipe: NotifType.PUSH,
      });
  
      return result;
  
    } catch (error) {
  
      await this.slotService.releaseSlots({
        id_slots: dto.id_slots,
      });
  
      throw error;
    }
  }

  async batalkan(
    id: number,
    id_pengguna: number,
  ) {
  
    const pemesanan =
      await this.findOne(id);
  
    if (
      pemesanan.id_pengguna !==
      id_pengguna
    ) {
      throw new BadRequestException(
        'Bukan pemesanan Anda',
      );
    }
  
    const ids_slot =
      pemesanan.detail.map(
        (d) => d.id_slot,
      );
  
      await this.slotService.releaseSlots({
        id_slots: ids_slot,
      });
  
    await this.prisma.pemesanan.update({
      where: {
        id_pemesanan: id,
      },
      data: {
        status: 'BATAL',
      },
    });
  
    return {
      message:
        'Pemesanan berhasil dibatalkan',
    };
  }

  async findOne(id: number) {
    const data =
      await this.prisma.pemesanan.findUnique({
        where: {
          id_pemesanan: id,
        },
        include: {
          pengguna: true,
  
          jadwal: {
            include: {
              film: true,
              studio: {
                include: {
                  bioskop: true,
                },
              },
            },
          },
  
          detail: {
            include: {
              slot: {
                include: {
                  kursi: true,
                },
              },
            },
          },
  
          pembayaran: true,
        },
      });
  
    if (!data) {
      throw new NotFoundException(
        'Pemesanan tidak ditemukan',
      );
    }
  
    return data;
  }

  async findByUser(
    id_pengguna: number,
  ) {
  
    return this.prisma.pemesanan.findMany({
      where: {
        id_pengguna,
      },
      include: {
        jadwal: {
          include: {
            film: true,
          },
        },
        detail: true,
      },
      orderBy: {
        tgl_pesan: 'desc',
      },
    });
  }
}