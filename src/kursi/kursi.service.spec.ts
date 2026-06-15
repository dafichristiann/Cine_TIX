import { Test, TestingModule } from '@nestjs/testing';
import { KursiService } from './kursi.service';

describe('KursiService', () => {
  let service: KursiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KursiService],
    }).compile();

    service = module.get<KursiService>(KursiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
