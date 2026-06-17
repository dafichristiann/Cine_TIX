import { Test, TestingModule } from '@nestjs/testing';
import { SlotKursiController } from './slot-kursi.controller';
import { SlotKursiService } from './slot-kursi.service';

describe('SlotKursiController', () => {
  let controller: SlotKursiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlotKursiController],
      providers: [
        { provide: SlotKursiService, useValue: {} },
      ],
    }).compile();

    controller = module.get<SlotKursiController>(SlotKursiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});