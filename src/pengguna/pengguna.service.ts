import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePenggunaDto } from './dto/create-pengguna.dto';
import { UpdatePenggunaDto } from './dto/update-pengguna.dto';
import { Pengguna } from './entities/pengguna.entity';

@Injectable()
export class PenggunaService {
  constructor(
    @InjectRepository(Pengguna)
    private repo: Repository<Pengguna>,
  ) {}

  create(createPenggunaDto: CreatePenggunaDto): Promise<Pengguna> {
    const entity = this.repo.create(createPenggunaDto as any);
    return this.repo.save(entity) as unknown as Promise<Pengguna>;
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id_pengguna: id });
  }

  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  update(id: number, updatePenggunaDto: UpdatePenggunaDto) {
    return this.repo.update({ id_pengguna: id }, updatePenggunaDto as any);
  }

  remove(id: number) {
    return this.repo.delete({ id_pengguna: id });
  }
}
