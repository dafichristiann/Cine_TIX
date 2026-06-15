import { Test, TestingModule } from '@nestjs/testing';
import { SlotKursiService } from './slot-kursi.service';

describe('SlotKursiService', () => {
  let service: SlotKursiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlotKursiService],
    }).compile();

    service = module.get<SlotKursiService>(SlotKursiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
