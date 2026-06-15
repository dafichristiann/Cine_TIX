import { Test, TestingModule } from '@nestjs/testing';
import { KursiController } from './kursi.controller';

describe('KursiController', () => {
  let controller: KursiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KursiController],
    }).compile();

    controller = module.get<KursiController>(KursiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
