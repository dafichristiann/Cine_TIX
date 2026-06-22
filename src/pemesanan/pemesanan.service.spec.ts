import { Test, TestingModule } from '@nestjs/testing';
import { PemesananService } from './pemesanan.service';
import { PrismaService } from '../prisma/prisma.service';
import { SlotKursiService } from '../slot-kursi/slot-kursi.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { JadwalService } from '../jadwal/jadwal.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('uuid', () => ({
  v4: () => '12345678-1234-1234-1234-1234567890ab',
}));

describe('PemesananService', () => {
  let service: PemesananService;
  let prisma: PrismaService;

  const mockPrismaService = {
    pemesanan: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    detailPemesanan: {
      deleteMany: jest.fn(),
    },
    pembayaran: {
      delete: jest.fn(),
    },
    slotKursi: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockSlotKursiService = {
    releaseSlots: jest.fn(),
  };

  const mockNotifikasiService = {
    kirim: jest.fn(),
  };

  const mockJadwalService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PemesananService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SlotKursiService, useValue: mockSlotKursiService },
        { provide: NotifikasiService, useValue: mockNotifikasiService },
        { provide: JadwalService, useValue: mockJadwalService },
      ],
    }).compile();

    service = module.get<PemesananService>(PemesananService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('remove', () => {
    it('should throw NotFoundException if booking not found', async () => {
      jest.spyOn(prisma.pemesanan, 'findUnique').mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should delete booking, details, payments, and release slots', async () => {
      const mockBooking = {
        id_pemesanan: 1,
        detail: [{ id_slot: 101 }, { id_slot: 102 }],
        pembayaran: { id_pembayaran: 50 },
      };

      jest.spyOn(prisma.pemesanan, 'findUnique').mockResolvedValue(mockBooking as any);

      const result = await service.remove(1);

      expect(prisma.pemesanan.findUnique).toHaveBeenCalledWith({
        where: { id_pemesanan: 1 },
        include: { detail: true, pembayaran: true },
      });
      expect(prisma.detailPemesanan.deleteMany).toHaveBeenCalledWith({
        where: { id_pemesanan: 1 },
      });
      expect(prisma.pembayaran.delete).toHaveBeenCalledWith({
        where: { id_pemesanan: 1 },
      });
      expect(prisma.pemesanan.delete).toHaveBeenCalledWith({
        where: { id_pemesanan: 1 },
      });
      expect(prisma.slotKursi.updateMany).toHaveBeenCalledWith({
        where: { id_slot: { in: [101, 102] } },
        data: { status: 'TERSEDIA', locked_until: null },
      });
      expect(result).toEqual({ message: 'Pemesanan berhasil dihapus' });
    });
  });
});
