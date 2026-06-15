import { Test, TestingModule } from '@nestjs/testing';
import { BioskopController } from './bioskop.controller';

describe('BioskopController', () => {
  let controller: BioskopController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BioskopController],
    }).compile();

    controller = module.get<BioskopController>(BioskopController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
