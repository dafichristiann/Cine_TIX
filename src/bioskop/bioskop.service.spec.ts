import { Test, TestingModule } from '@nestjs/testing';
import { BioskopService } from './bioskop.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BioskopService', () => {
  let service: BioskopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BioskopService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<BioskopService>(BioskopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});