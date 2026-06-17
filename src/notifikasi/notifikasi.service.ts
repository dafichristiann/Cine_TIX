import { Injectable } from '@nestjs/common';

@Injectable()
export class NotifikasiService {
  async kirim(data: any) {
    console.log('Notifikasi:', data);

    return true;
  }
}