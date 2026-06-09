import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('harus mengembalikan "Hello World!"', () => {
    expect(service.getHello()).toBe('Hello World!');
  });

  it('harus menjumlahkan dua angka dengan benar', () => {
    expect(service.add(2, 3)).toBe(5);
    expect(service.add(-1, 1)).toBe(0);
  });
});
