// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'; // 👈 Pastikan Body dari @nestjs/common
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi pengguna baru' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) { // 👈 @Body() harus seperti ini
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login pengguna' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) { // 👈 @Body() harus seperti ini
    return this.authService.login(loginDto);
  }
}