import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSlotKursiDto } from './dto/update-slot-kursi.dto';
import { LockSlotKursiDto } from './dto/lock-slot-kursi.dto';

@Injectable()
export class SlotKursiService {
  constructor(private readonly prisma: PrismaService) {}

  // Ambil semua slot berdasarkan jadwal (untuk tampilan kursi di UI)
  async findByJadwal(id_jadwal: number) {
    const jadwal = await this.prisma.jadwal.findUnique({
      where: { id_jadwal },
    });
    if (!jadwal) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    return this.prisma.slotKursi.findMany({
      where: { id_jadwal },
      include: {
        kursi: true,
      },
      orderBy: [
        { kursi: { baris: 'asc' } },
        { kursi: { nomor_kursi: 'asc' } },
      ],
    });
  }

  // Ambil detail satu slot
  async findOne(id: number) {
    const slot = await this.prisma.slotKursi.findUnique({
      where: { id_slot: id },
      include: {
        kursi: true,
        jadwal: {
          include: {
            film: true,
            studio: { include: { bioskop: true } },
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Slot kursi tidak ditemukan');
    }

    return slot;
  }

  async konfirmasiSlots(id_slots: number[]) {

    await this.prisma.slotKursi.updateMany({
      where: {
        id_slot: {
          in: id_slots,
        },
      },
      data: {
        status: 'TERJUAL',
        locked_until: null,
      },
    });
  
    return {
      message:
        `${id_slots.length} kursi berhasil dikonfirmasi`,
    };
  }

  async getKursiTersedia(
    id_jadwal: number,
  ) {
  
    return this.prisma.slotKursi.findMany({
      where: {
        id_jadwal,
        status: 'TERSEDIA',
      },
      include: {
        kursi: true,
      },
    });
  }
  // Lock kursi sementara (saat user mulai memilih kursi)
  async lockSlots(dto: LockSlotKursiDto) {
    const slots = await this.prisma.slotKursi.findMany({
      where: { id_slot: { in: dto.id_slots } },
    });

    // Validasi semua slot exist
    if (slots.length !== dto.id_slots.length) {
      throw new NotFoundException('Satu atau lebih slot kursi tidak ditemukan');
    }

    // Validasi semua slot masih TERSEDIA
    const tidakTersedia = slots.filter((s) => s.status !== 'TERSEDIA');
    if (tidakTersedia.length > 0) {
      throw new BadRequestException(
        `Kursi tidak tersedia: ${tidakTersedia.map((s) => s.id_slot).join(', ')}`,
      );
    }

    // Lock selama 10 menit
    const locked_until = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.slotKursi.updateMany({
      where: { id_slot: { in: dto.id_slots } },
      data: {
        status: 'TERKUNCI',
        locked_until,
      },
    });

    return {
      message: `${dto.id_slots.length} kursi berhasil dikunci`,
      locked_until,
      id_slots: dto.id_slots,
    };
  }

  // Release lock (saat user batal atau timeout)
  async releaseSlots(dto: LockSlotKursiDto) {
    const slots = await this.prisma.slotKursi.findMany({
      where: { id_slot: { in: dto.id_slots } },
    });

    if (slots.length !== dto.id_slots.length) {
      throw new NotFoundException('Satu atau lebih slot kursi tidak ditemukan');
    }

    await this.prisma.slotKursi.updateMany({
      where: { id_slot: { in: dto.id_slots } },
      data: {
        status: 'TERSEDIA',
        locked_until: null,
      },
    });

    return {
      message: `${dto.id_slots.length} kursi berhasil dilepas`,
      id_slots: dto.id_slots,
    };
  }

  // Release semua lock yang sudah expired (dipanggil oleh cron job)
  async releaseExpiredLocks() {
    const result = await this.prisma.slotKursi.updateMany({
      where: {
        status: 'TERKUNCI',
        locked_until: { lt: new Date() },
      },
      data: {
        status: 'TERSEDIA',
        locked_until: null,
      },
    });

    return {
      message: `${result.count} slot kadaluarsa berhasil direset`,
    };
  }

  // Update status slot manual (admin)
  async update(id: number, dto: UpdateSlotKursiDto) {
    await this.findOne(id);

    return this.prisma.slotKursi.update({
      where: { id_slot: id },
      data: {
        status: dto.status,
        locked_until: dto.locked_until
          ? new Date(dto.locked_until)
          : null,
      },
      include: { kursi: true },
    });
  }
}