import { Test, TestingModule } from '@nestjs/testing';
import { PenggunaService } from './pengguna.service';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path jika berbeda

describe('PenggunaService', () => {
  let service: PenggunaService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PenggunaService,
        {
          // Sediakan PrismaService tiruan agar tidak menembak database asli saat test
          provide: PrismaService,
          useValue: {
            pengguna: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PenggunaService>(PenggunaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});