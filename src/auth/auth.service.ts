import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PenggunaService } from '../pengguna/pengguna.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Pengguna } from '@prisma/client';
import { MailService } from '../mail/mail.service';

interface OtpEntry {
  otp: string;
  expiresAt: number;
  purpose: 'login' | 'register';
  nama?: string;
}

interface GoogleAuthChallenge {
  otp: string;
  magicToken: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private readonly otpStore = new Map<string, OtpEntry>();
  private readonly googleAuthStore = new Map<string, GoogleAuthChallenge>();

  constructor(
    private readonly penggunaService: PenggunaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

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

  async sendOtp(email: string, purpose: 'login' | 'register' = 'login', nama?: string) {
    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    this.otpStore.set(cleanEmail, {
      otp,
      expiresAt,
      purpose,
      nama,
    });

    await this.mailService.sendOtp(cleanEmail, otp, purpose);

    return {
      success: true,
      email: cleanEmail,
      message: `Kode OTP verifikasi telah dikirim ke email ${cleanEmail}`,
    };
  }

  async verifyOtp(email: string, otp: string) {
    const cleanEmail = email.trim().toLowerCase();
    const entry = this.otpStore.get(cleanEmail);

    if (!entry) {
      throw new UnauthorizedException('Kode OTP tidak ditemukan atau belum diminta. Silakan minta kode baru.');
    }

    if (Date.now() > entry.expiresAt) {
      this.otpStore.delete(cleanEmail);
      throw new UnauthorizedException('Kode OTP sudah kedaluwarsa. Silakan minta kode baru.');
    }

    if (entry.otp !== otp.trim()) {
      throw new UnauthorizedException('Kode OTP salah. Periksa kembali email Anda.');
    }

    // OTP valid -> hapus dari store
    this.otpStore.delete(cleanEmail);

    // Cari pengguna atau daftarkan jika belum ada
    let user = await this.penggunaService.findByEmail(cleanEmail);
    if (!user) {
      const generatedPassword = await bcrypt.hash(`cinetix_${Date.now()}`, 10);
      user = await this.penggunaService.create({
        email: cleanEmail,
        password: generatedPassword,
        nama: entry.nama || cleanEmail.split('@')[0],
        role: 'user',
        status: 'active',
      });
    }

    return this.generateToken(user);
  }

  async requestGoogleAuth(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@googlemail.com')) {
      throw new BadRequestException('Hanya alamat email @gmail.com yang diizinkan untuk login ini');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const magicToken = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 10 * 60 * 1000;

    this.googleAuthStore.set(cleanEmail, {
      otp,
      magicToken,
      expiresAt,
    });

    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const magicLink = `${clientUrl}/auth/magic-link?email=${encodeURIComponent(cleanEmail)}&token=${magicToken}`;

    await this.mailService.sendGoogleAuthEmail(cleanEmail, otp, magicLink);

    return {
      success: true,
      email: cleanEmail,
      message: 'Kode verifikasi dan tautan konfirmasi masuk telah dikirim ke akun Gmail Anda.',
    };
  }

  async verifyGoogleOtp(email: string, otp: string) {
    const cleanEmail = email.trim().toLowerCase();
    const challenge = this.googleAuthStore.get(cleanEmail);

    if (!challenge) {
      throw new UnauthorizedException('Permintaan verifikasi Google tidak ditemukan atau belum diminta.');
    }

    if (Date.now() > challenge.expiresAt) {
      this.googleAuthStore.delete(cleanEmail);
      throw new UnauthorizedException('Kode OTP sudah kedaluwarsa. Silakan lakukan permintaan ulang.');
    }

    if (challenge.otp !== otp.trim()) {
      throw new UnauthorizedException('Kode OTP salah. Periksa kembali email masuk di Gmail Anda.');
    }

    this.googleAuthStore.delete(cleanEmail);
    const user = await this.provisionGoogleUser(cleanEmail);
    return this.generateToken(user);
  }

  async verifyGoogleMagicLink(email: string, token: string) {
    const cleanEmail = email.trim().toLowerCase();
    const challenge = this.googleAuthStore.get(cleanEmail);

    if (!challenge) {
      throw new UnauthorizedException('Tautan verifikasi tidak valid atau telah digunakan sebelumnya.');
    }

    if (Date.now() > challenge.expiresAt) {
      this.googleAuthStore.delete(cleanEmail);
      throw new UnauthorizedException('Tautan verifikasi sudah kedaluwarsa. Silakan lakukan permintaan ulang.');
    }

    if (challenge.magicToken !== token.trim()) {
      throw new UnauthorizedException('Token verifikasi tidak cocok.');
    }

    this.googleAuthStore.delete(cleanEmail);
    const user = await this.provisionGoogleUser(cleanEmail);
    return this.generateToken(user);
  }

  async verifyGoogleOAuth(credential: string) {
    if (!credential) {
      throw new BadRequestException('Kredensial token Google wajib disertakan');
    }

    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!response.ok) {
        throw new UnauthorizedException('Token Google tidak valid atau telah kedaluwarsa');
      }

      const payload = await response.json() as {
        aud?: string;
        email?: string;
        email_verified?: string | boolean;
        name?: string;
        picture?: string;
      };

      const configuredClientId = process.env.GOOGLE_CLIENT_ID;
      if (configuredClientId && payload.aud !== configuredClientId) {
        throw new UnauthorizedException('Klien ID Google tidak cocok dengan sistem');
      }

      const isVerified = payload.email_verified === 'true' || payload.email_verified === true;
      if (!payload.email || !isVerified) {
        throw new UnauthorizedException('Alamat email Google belum terverifikasi oleh Google');
      }

      const cleanEmail = payload.email.trim().toLowerCase();
      let user = await this.penggunaService.findByEmail(cleanEmail);
      if (!user) {
        const randomPass = randomBytes(16).toString('base64url');
        user = await this.penggunaService.create({
          email: cleanEmail,
          password: randomPass,
          nama: payload.name || cleanEmail.split('@')[0],
          role: 'user',
          status: 'active',
        });
      }

      return this.generateToken(user);
    } catch (err: any) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      throw new UnauthorizedException(`Gagal memverifikasi token Google: ${err.message}`);
    }
  }

  // Helper untuk Auto-Provisioning Pengguna Google / Gmail
  private async provisionGoogleUser(cleanEmail: string) {
    let user = await this.penggunaService.findByEmail(cleanEmail);
    if (!user) {
      const rawPrefix = cleanEmail.split('@')[0];
      const displayName = rawPrefix
        .split(/[._-]/)
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

      const randomPass = randomBytes(16).toString('base64url');
      user = await this.penggunaService.create({
        email: cleanEmail,
        password: randomPass,
        nama: displayName || 'Google User',
        role: 'user',
        status: 'active',
      });
    }
    return user;
  }

  // 8. Helper untuk Create Token JWT
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
