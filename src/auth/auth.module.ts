import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {PenggunaModule} from '../pengguna/pengguna.module';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {JwtStrategy} from './strategies/jwt.strategy';

@Module({
  imports: [
    PenggunaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const expires = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expires as any,
          },
        };
      },
    }),
  ],   
  controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [PassportModule, AuthService],
})
export class AuthModule {}