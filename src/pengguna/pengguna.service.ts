import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreatePenggunaDto } from './dto/create-pengguna.dto'; // pastikan propertinya sudah update
import { UpdatePenggunaDto } from './dto/update-pengguna.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PenggunaService {
  constructor(private prisma: PrismaService) {}

  async create(createPenggunaDto: CreatePenggunaDto) {
    // 1. Validasi apakah email sudah terdaftar agar error lebih rapi
    const emailExist = await this.findByEmail(createPenggunaDto.email);
    if (emailExist) {
      throw new ConflictException('Email sudah terdaftar');
    }

    // 2. Hash password sebelum masuk ke Prisma
    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(createPenggunaDto.password, saltRound);

    // 3. Simpan dengan password yang sudah aman
    return this.prisma.pengguna.create({
      data: {
        ...createPenggunaDto,
        password: hashedPassword,
      },
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
    // Jika user mengupdate password lewat profile, pastikan di-hash juga
    const dataToUpdate: any = { ...updatePenggunaDto };
    
    if (updatePenggunaDto.password) {
      dataToUpdate.password = await bcrypt.hash(updatePenggunaDto.password, 10);
    }

    return this.prisma.pengguna.update({
      where: { id_pengguna: id },
      data: dataToUpdate,
    });
  }

  async remove(id: number) {
    return this.prisma.pengguna.delete({
      where: { id_pengguna: id },
    });
  }
}