import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PenggunaService } from '../pengguna/pengguna.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Pengguna } from '../pengguna/entities/pengguna.entity';

@Injectable()
export class AuthService {
  constructor(
    private penggunaService: PenggunaService,
    private jwtService: JwtService,
  ) {}

  // 1. Logika Registrasi Pengguna Baru
  async register(dto: RegisterDto) {
    // Cek apakah email sudah terdaftar di database
    const existingUser = await this.penggunaService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email ini sudah terdaftar, silakan gunakan email lain');
    }

    // Mengacak/mengamankan password dengan bcrypt (12 rounds salt)
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Simpan pengguna baru ke database melalui PenggunaService
    const user = await this.penggunaService.create({
      ...dto,
      password: hashedPassword,
    });

    // Setelah sukses daftar, langsung buatkan token agar bisa otomatis masuk (login)
    return this.generateToken(user);
  }

  // 2. Logika Login Pengguna
  async login(dto: LoginDto) {
    // Cari pengguna berdasarkan email
    const user = await this.penggunaService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email atau password yang Anda masukkan salah');
    }

    // Bandingkan password yang diinput dengan password terenkripsi di database
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password yang Anda masukkan salah');
    }

    // Jika semua valid, buat dan kembalikan token JWT
    return this.generateToken(user);
  }

  // 3. Helper untuk Membuat Token JWT (Reusable Function)
  private generateToken(user: Pengguna) {
    // Payload adalah data ringkas yang disimpan di dalam token JWT
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