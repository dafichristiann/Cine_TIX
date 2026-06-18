import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  
  import { PrismaService } from '../prisma/prisma.service';
  
  import { SlotKursiService } from '../slot-kursi/slot-kursi.service';
  import { NotifikasiService } from '../notifikasi/notifikasi.service';
  
  import { CreatePembayaranDto } from './dto/create-pembayaran.dto';
  
  @Injectable()
  export class PembayaranService {
    constructor(
      private prisma: PrismaService,
      private slotService: SlotKursiService,
      private notifService: NotifikasiService,
    ) {}
  
    async buatPembayaran(
      dto: CreatePembayaranDto,
      id_pengguna: number,
    ) {
      const pemesanan =
        await this.prisma.pemesanan.findUnique({
          where: {
            id_pemesanan: dto.id_pemesanan,
          },
          include: {
            detail: true,
          },
        });
  
      if (!pemesanan) {
        throw new NotFoundException(
          'Pemesanan tidak ditemukan',
        );
      }

      if (pemesanan.id_pengguna !== id_pengguna) {
        throw new NotFoundException(
          'Pemesanan tidak ditemukan',
        );
      }
  
      if (pemesanan.status !== 'PENDING') {
        throw new BadRequestException(
          'Pemesanan sudah tidak pending',
        );
      }
  
      if (new Date() > pemesanan.expired_at) {
        throw new BadRequestException(
          'Pemesanan sudah expired',
        );
      }
  
      const pembayaran =
        await this.prisma.pembayaran.create({
          data: {
            id_pemesanan:
              dto.id_pemesanan,
  
            id_pengguna,
  
            metode:
              dto.metode,
  
            jumlah:
              pemesanan.total_harga,
  
            status: 'PENDING',
          },
        });
  
      return pembayaran;
    }
  
    async handleWebhook(
      ref_gateway: string,
      statusGateway:
        | 'success'
        | 'failed',
    ) {
      const bayar =
        await this.prisma.pembayaran.findUnique({
          where: {
            ref_gateway,
          },
          include: {
            pemesanan: {
              include: {
                detail: true,
              },
            },
          },
        });
  
      if (!bayar) {
        throw new NotFoundException(
          'Data pembayaran tidak ditemukan',
        );
      }
  
      if (statusGateway === 'success') {
  
        await this.prisma.pembayaran.update({
          where: {
            id_pembayaran:
              bayar.id_pembayaran,
          },
          data: {
            status: 'BERHASIL',
          },
        });
  
        await this.prisma.pemesanan.update({
          where: {
            id_pemesanan:
              bayar.id_pemesanan,
          },
          data: {
            status: 'LUNAS',
          },
        });
  
        const ids_slot =
          bayar.pemesanan.detail.map(
            (d) => d.id_slot,
          );
  
        await this.slotService.konfirmasiSlots(
          ids_slot,
        );
  
        await this.notifService.kirim({
          id_pengguna:
            bayar.id_pengguna,
  
          id_pemesanan:
            bayar.id_pemesanan,
  
          pesan:
            'Pembayaran berhasil! Tiket Anda sudah dapat digunakan.',
  
          tipe: 'EMAIL',
        });
  
      } else {
  
        await this.prisma.pembayaran.update({
          where: {
            id_pembayaran:
              bayar.id_pembayaran,
          },
          data: {
            status: 'GAGAL',
          },
        });
  
        const ids_slot =
          bayar.pemesanan.detail.map(
            (d) => d.id_slot,
          );
  
        await this.slotService.releaseSlots({
          id_slots: ids_slot,
        });
      }
  
      return {
        message:
          'Webhook diproses',
      };
    }
  
    async refund(
      id_pembayaran: number,
    ) {
  
      const bayar =
        await this.prisma.pembayaran.findUnique({
          where: {
            id_pembayaran,
          },
          include: {
            pemesanan: {
              include: {
                detail: true,
              },
            },
          },
        });
  
      if (!bayar) {
        throw new NotFoundException(
          'Pembayaran tidak ditemukan',
        );
      }
  
      if (bayar.status !== 'BERHASIL') {
        throw new BadRequestException(
          'Hanya pembayaran berhasil yang bisa direfund',
        );
      }
  
      await this.prisma.pembayaran.update({
        where: {
          id_pembayaran,
        },
        data: {
          status: 'GAGAL',
        },
      });
  
      await this.prisma.pemesanan.update({
        where: {
          id_pemesanan:
            bayar.id_pemesanan,
        },
        data: {
          status: 'BATAL',
        },
      });
  
      const ids_slot =
        bayar.pemesanan.detail.map(
          (d) => d.id_slot,
        );
  
      await this.slotService.releaseSlots({
        id_slots: ids_slot,
      });
  
      return {
        message:
          'Refund berhasil diproses',
      };
    }
  
    async laporanPendapatan() {
  
      const data =
        await this.prisma.pembayaran.groupBy({
          by: ['tgl_bayar'],
  
          where: {
            status: 'BERHASIL',
          },
  
          _count: {
            id_pembayaran: true,
          },
  
          _sum: {
            jumlah: true,
          },
  
          orderBy: {
            tgl_bayar: 'asc',
          },
        });
  
      return data;
    }
  }
