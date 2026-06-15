import { Test, TestingModule } from '@nestjs/testing';
import { SlotKursiController } from './slot-kursi.controller';

describe('SlotKursiController', () => {
  let controller: SlotKursiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlotKursiController],
    }).compile();

    controller = module.get<SlotKursiController>(SlotKursiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
