import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
    return `TK-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  async create(dto: CreatePemesananDto, id_pengguna: number) {
    // 1. Ambil data jadwal terlebih dahulu
    const jadwal = await this.jadwalService.findOne(dto.id_jadwal);

    const total_harga = Number(jadwal.harga) * dto.id_slots.length;
    const expired_at = new Date(Date.now() + 15 * 60 * 1000); // 15 Menit batas bayar

    // 2. Jalankan seluruh proses di dalam satu Transaksi DB
    return this.prisma.$transaction(async (tx) => {
      
      // Langkah A: Kunci slot kursi di dalam database transaksi menggunakan internal Prisma/Service
      // Pastikan method lockSlots menerima objek transaksi 'tx' jika diimplementasikan secara deep lock
      await this.slotService.lockSlots({
        id_slots: dto.id_slots,
      });

      // Langkah B: Ambil baris data slot kursi yang baru dikunci untuk memastikan statusnya benar TERSEDIA
      const slotData = await tx.slotKursi.findMany({
        where: { id_slot: { in: dto.id_slots } },
      });

      const adaYangTerjual = slotData.some((slot) => slot.status !== 'TERSEDIA');
      if (adaYangTerjual) {
        throw new BadRequestException('Satu atau lebih kursi sudah dipesan atau terkunci');
      }

      // Langkah C: Ubah status slot kursi menjadi TERKUNCI via Tx
      await tx.slotKursi.updateMany({
        where: { id_slot: { in: dto.id_slots } },
        data: { status: 'TERKUNCI', locked_until: expired_at },
      });

      // Langkah D: Buat Induk Pemesanan
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

      // Langkah E: Buat Rincian Tiket Pemesanan
      const detailPayload = dto.id_slots.map((slotId) => ({
        id_pemesanan: pemesanan.id_pemesanan,
        id_slot: slotId,
        harga_satuan: Number(jadwal.harga),
        kode_tiket: this.generateKodeTiket(),
      }));

      await tx.detailPemesanan.createMany({
        data: detailPayload,
      });

      // Langkah F: Kirim Notifikasi (Dilakukan asinkron setelah tx sukses di luar, atau langsung di sini)
      await this.notifService.kirim({
        id_pengguna,
        id_pemesanan: pemesanan.id_pemesanan,
        pesan: `Pemesanan ${pemesanan.kode_booking} berhasil dibuat. Silakan selesaikan pembayaran sebelum waktu habis.`,
        tipe: NotifType.PUSH,
      });

      return pemesanan;
    });
    // Menghapus blok catch pelepasan manual eksternal karena jika transaksi gagal/error,
    // database otomatis melakukan ROLLBACK dan membatalkan semua perubahan status kursi!
  }

  async batalkan(id: number, id_pengguna: number) {
    const pemesanan = await this.findOne(id);

    if (pemesanan.id_pengguna !== id_pengguna) {
      throw new BadRequestException('Bukan pemesanan Anda');
    }

    if (pemesanan.status === 'BATAL') {
      throw new BadRequestException('Pemesanan ini sudah dibatalkan sebelumnya');
    }

    const ids_slot = pemesanan.detail.map((d) => d.id_slot);

    // Gunakan transaksi untuk pembatalan agar kursi lepas dan status berubah seiringan
    return this.prisma.$transaction(async (tx) => {
      // Lepaskan status kursi kembali menjadi TERSEDIA
      await tx.slotKursi.updateMany({
        where: { id_slot: { in: ids_slot } },
        data: { status: 'TERSEDIA', locked_until: null },
      });

      // Ubah status invoice pemesanan
      const pemesananBatal = await tx.pemesanan.update({
        where: { id_pemesanan: id },
        data: { status: 'BATAL' },
      });

      return {
        message: 'Pemesanan berhasil dibatalkan',
        pemesanan: pemesananBatal,
      };
    });
  }

  async findOne(id: number) {
    const data = await this.prisma.pemesanan.findUnique({
      where: { id_pemesanan: id },
      include: {
        pengguna: true,
        jadwal: {
          include: {
            film: true,
            studio: { include: { bioskop: true } },
          },
        },
        detail: {
          include: {
            slot: { include: { kursi: true } },
          },
        },
        pembayaran: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Pemesanan tidak ditemukan');
    }

    return data;
  }

  async findByUser(id_pengguna: number) {
    return this.prisma.pemesanan.findMany({
      where: { id_pengguna },
      include: {
        jadwal: { include: { film: true } },
        detail: true,
      },
      orderBy: { tgl_pesan: 'desc' },
    });
  }
}