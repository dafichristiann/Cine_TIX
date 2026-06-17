import { Test, TestingModule } from '@nestjs/testing';
import { JadwalService } from './jadwal.service';
import { PrismaService } from '../prisma/prisma.service';

describe('JadwalService', () => {
  let service: JadwalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JadwalService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<JadwalService>(JadwalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});