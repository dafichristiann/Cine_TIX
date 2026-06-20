import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { BookingStatus } from '../common/enums/booking-status.enum';

import { NotifType } from '../common/enums/notif-type.enum';

import { PrismaService } from '../prisma/prisma.service';

import { SlotKursiService } from '../slot-kursi/slot-kursi.service';

import { NotifikasiService } from '../notifikasi/notifikasi.service';

import { JadwalService } from '../jadwal/jadwal.service';

import { CreatePemesananDto } from './dto/create-pemesanan.dto';

@Injectable()
export class PemesananService implements OnModuleInit, OnModuleDestroy {
    private expiryTimer?: NodeJS.Timeout;
    private expiryInProgress = false;
    private readonly logger = new Logger(PemesananService.name);

    constructor(
        private prisma: PrismaService,
        private slotService: SlotKursiService,
        private notifService: NotifikasiService,
        private jadwalService: JadwalService,
      ) {}

  onModuleInit() {
    void this.runExpirySafely();
    this.expiryTimer = setInterval(() => {
      void this.runExpirySafely();
    }, 60_000);
    this.expiryTimer.unref();
  }

  onModuleDestroy() {
    if (this.expiryTimer) clearInterval(this.expiryTimer);
  }

  private async runExpirySafely() {
    try {
      await this.expirePendingBookings();
    } catch (error) {
      this.logger.error('Gagal memproses pesanan kedaluwarsa', error);
    }
  }

  async expirePendingBookings(now = new Date()) {
    if (this.expiryInProgress) return { count: 0 };
    this.expiryInProgress = true;

    try {
      const expired = await this.prisma.pemesanan.findMany({
      where: { status: 'PENDING', expired_at: { lte: now } },
      select: {
        id_pemesanan: true,
        detail: { select: { id_slot: true } },
        pembayaran: { select: { status: true } },
      },
    });

      for (const booking of expired) {
        await this.prisma.$transaction(async (tx) => {
        const updated = await tx.pemesanan.updateMany({
          where: {
            id_pemesanan: booking.id_pemesanan,
            status: 'PENDING',
            expired_at: { lte: now },
          },
          data: { status: 'BATAL' },
        });

        if (!updated.count) return;

        await tx.slotKursi.updateMany({
          where: {
            id_slot: { in: booking.detail.map((detail) => detail.id_slot) },
            status: 'TERKUNCI',
          },
          data: { status: 'TERSEDIA', locked_until: null },
        });

        if (booking.pembayaran?.status === 'PENDING') {
          await tx.pembayaran.update({
            where: { id_pemesanan: booking.id_pemesanan },
            data: { status: 'GAGAL' },
          });
        }
        });
      }

      return { count: expired.length };
    } finally {
      this.expiryInProgress = false;
    }
  }

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

      const slotJadwalIds = new Set(
        jadwal.slots.map((slot) => slot.id_slot),
      );

      const adaSlotBedaJadwal = dto.id_slots.some(
        (slotId) => !slotJadwalIds.has(slotId),
      );

      if (adaSlotBedaJadwal) {
        throw new BadRequestException(
          'Satu atau lebih kursi tidak sesuai dengan jadwal yang dipilih',
        );
      }
  
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
  
      return this.findOneForUser(result.id_pemesanan, id_pengguna);
  
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

    if (pemesanan.status !== 'PENDING') {
      throw new BadRequestException(
        'Hanya pemesanan pending yang dapat dibatalkan',
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

    if (pemesanan.pembayaran?.status === 'PENDING') {
      await this.prisma.pembayaran.update({
        where: {
          id_pemesanan: id,
        },
        data: {
          status: 'GAGAL',
        },
      });
    }
  
    return this.findOneForUser(id, id_pengguna);
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
      orderBy: {
        tgl_pesan: 'desc',
      },
    });
  }

  async findOneForUser(id: number, id_pengguna: number) {
    const pemesanan = await this.findOne(id);

    if (pemesanan.id_pengguna !== id_pengguna) {
      throw new NotFoundException('Pemesanan tidak ditemukan');
    }

    return pemesanan;
  }
}
