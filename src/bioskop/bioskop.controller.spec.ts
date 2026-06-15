import { Test, TestingModule } from '@nestjs/testing';
import { BioskopController } from './bioskop.controller';
import { BioskopService } from './bioskop.service';

describe('BioskopController', () => {
  let controller: BioskopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BioskopController],
      providers: [
        { provide: BioskopService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BioskopController>(BioskopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});