import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Sesuaikan path-nya
import { CreatePenggunaDto } from './dto/create-pengguna.dto';
import { UpdatePenggunaDto } from './dto/update-pengguna.dto';

@Injectable()
export class PenggunaService {
  constructor(private prisma: PrismaService) {}

  async create(createPenggunaDto: CreatePenggunaDto) {
    return this.prisma.pengguna.create({
      data: createPenggunaDto,
    });
  }

  async findAll() {
    return this.prisma.pengguna.findMany();
  }

  async findOne(id: number) {
    return this.prisma.pengguna.findUnique({
      where: { id_pengguna: id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.pengguna.findUnique({
      where: { email },
    });
  }

  async update(id: number, updatePenggunaDto: UpdatePenggunaDto) {
    return this.prisma.pengguna.update({
      where: { id_pengguna: id },
      data: updatePenggunaDto,
    });
  }

  async remove(id: number) {
    return this.prisma.pengguna.delete({
      where: { id_pengguna: id },
    });
  }
}