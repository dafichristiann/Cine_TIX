import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PenggunaModule } from '../pengguna/pengguna.module'; 
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PenggunaModule, 
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'KODE_RAHASIA_CINETIX_2026', 
      signOptions: { expiresIn: '1d' }, 
    }),
  ],
  controllers: [AuthController], // 👈 Ini gerbang utama agar terbaca oleh Swagger UI
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}