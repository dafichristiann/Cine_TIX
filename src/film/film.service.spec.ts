import { Test, TestingModule } from '@nestjs/testing';
import { FilmService } from './film.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FilmService', () => {
  let service: FilmService;

  const mockPrismaService = {
    film: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FilmService>(FilmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});