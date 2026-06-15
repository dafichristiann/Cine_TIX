import { Test, TestingModule } from '@nestjs/testing';
import { StudioController } from './studio.controller';

describe('StudioController', () => {
  let controller: StudioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudioController],
    }).compile();

    controller = module.get<StudioController>(StudioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
