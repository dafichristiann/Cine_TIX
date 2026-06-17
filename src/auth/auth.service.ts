import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PenggunaService } from '../pengguna/pengguna.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Pengguna } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly penggunaService: PenggunaService,
    private readonly jwtService: JwtService,
  ) {}

  // 1. Registrasi Pengguna Baru
  async register(dto: RegisterDto) {
    const user = await this.penggunaService.create({
      email: dto.email,
      password: dto.password, 
      nama: dto.nama,
      no_telepon: dto.no_telepon,
      role: dto.role,
      status: dto.status,
    });

    return this.generateToken(user);
  }

  // 2. Login Pengguna
  async login(dto: LoginDto) {
    const user = await this.penggunaService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    return this.generateToken(user);
  }

  // 3. Helper untuk Create Token JWT
  private generateToken(user: Pengguna) {
    const payload = { 
      sub: user.id_pengguna, 
      email: user.email, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id_pengguna,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    };
  }
}