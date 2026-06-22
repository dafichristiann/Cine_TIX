import { Test, TestingModule } from '@nestjs/testing';
import { PemesananController } from './pemesanan.controller';
import { PemesananService } from './pemesanan.service';

jest.mock('uuid', () => ({
  v4: () => '12345678-1234-1234-1234-1234567890ab',
}));

describe('PemesananController', () => {
  let controller: PemesananController;
  let service: PemesananService;

  const mockPemesananService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findAllAdmin: jest.fn(),
    batalkan: jest.fn(),
    findOneForUser: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PemesananController],
      providers: [
        {
          provide: PemesananService,
          useValue: mockPemesananService,
        },
      ],
    }).compile();

    controller = module.get<PemesananController>(PemesananController);
    service = module.get<PemesananService>(PemesananService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('remove', () => {
    it('should call service.remove with the parsed number id', async () => {
      const mockResult = { message: 'Pemesanan berhasil dihapus' };
      jest.spyOn(service, 'remove').mockResolvedValue(mockResult);

      const result = await controller.remove('123');

      expect(service.remove).toHaveBeenCalledWith(123);
      expect(result).toBe(mockResult);
    });
  });
});
