import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  // Fungsi sederhana untuk diuji
  add(a: number, b: number): number {
    return a + b;
  }
}
