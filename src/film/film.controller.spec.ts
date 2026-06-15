import { Test, TestingModule } from '@nestjs/testing';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';

describe('FilmController', () => {
  let controller: FilmController;

  const mockFilmService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmController],
      providers: [
        {
          provide: FilmService,
          useValue: mockFilmService,
        },
      ],
    }).compile();

    controller = module.get<FilmController>(FilmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});