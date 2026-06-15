import { Test, TestingModule } from '@nestjs/testing';
import { KursiController } from './kursi.controller';
import { KursiService } from './kursi.service';

describe('KursiController', () => {
  let controller: KursiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KursiController],
      providers: [
        { provide: KursiService, useValue: {} },
      ],
    }).compile();

    controller = module.get<KursiController>(KursiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});