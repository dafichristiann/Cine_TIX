import { Test, TestingModule } from '@nestjs/testing';
import { PenggunaController } from './pengguna.controller';
import { PenggunaService } from './pengguna.service';

describe('PenggunaController', () => {
  let controller: PenggunaController;
  let service: PenggunaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenggunaController],
      providers: [
        {
          provide: PenggunaService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PenggunaController>(PenggunaController);
    service = module.get<PenggunaService>(PenggunaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});