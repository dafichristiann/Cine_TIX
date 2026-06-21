import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PenggunaService } from '../../pengguna/pengguna.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private penggunaService: PenggunaService,
    private configService: ConfigService,
  ) {
    super({
      // Mengambil token JWT dari HTTP Header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // Payload adalah objek berisi id_pengguna, email, dll yang dulu kita bungkus saat login
  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.penggunaService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan atau token tidak valid');
    }

    // Apa yang di-return di sini akan otomatis disuntikkan oleh NestJS ke req.user
    return user;
  }
}