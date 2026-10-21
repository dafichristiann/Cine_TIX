import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: 'user@cinetix.id', description: 'Alamat email pengguna' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email!: string;

  @ApiProperty({ example: 'login', required: false, enum: ['login', 'register'] })
  @IsOptional()
  @IsString()
  purpose?: 'login' | 'register';

  @ApiProperty({ example: 'Dafi Christian', required: false })
  @IsOptional()
  @IsString()
  nama?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@cinetix.id', description: 'Alamat email pengguna' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email!: string;

  @ApiProperty({ example: '123456', description: '6-digit kode OTP yang dikirim ke email' })
  @IsString()
  @IsNotEmpty({ message: 'Kode OTP tidak boleh kosong' })
  otp!: string;
}

export class GoogleAuthRequestDto {
  @ApiProperty({ example: 'budi.santoso@gmail.com', description: 'Alamat akun Gmail pengguna' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Alamat Gmail tidak boleh kosong' })
  email!: string;
}

export class GoogleVerifyOtpDto {
  @ApiProperty({ example: 'budi.santoso@gmail.com', description: 'Alamat akun Gmail pengguna' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Alamat Gmail tidak boleh kosong' })
  email!: string;

  @ApiProperty({ example: '123456', description: '6-digit kode OTP' })
  @IsString()
  @IsNotEmpty({ message: 'Kode OTP tidak boleh kosong' })
  otp!: string;
}

export class GoogleVerifyMagicLinkDto {
  @ApiProperty({ example: 'budi.santoso@gmail.com', description: 'Alamat akun Gmail pengguna' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Alamat Gmail tidak boleh kosong' })
  email!: string;

  @ApiProperty({ description: 'Token verifikasi dari tautan Ya, Ini Saya' })
  @IsString()
  @IsNotEmpty({ message: 'Token verifikasi tidak boleh kosong' })
  token!: string;
}

export class GoogleOAuthDto {
  @ApiProperty({ description: 'Google ID Token / Credential dari Google Identity Services' })
  @IsString()
  @IsNotEmpty({ message: 'Kredensial token Google tidak boleh kosong' })
  credential!: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi pengguna baru' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login pengguna standar dengan kata sandi' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim kode OTP verifikasi ke email via SMTP' })
  async sendOtp(@Body() body: SendOtpDto) {
    return this.authService.sendOtp(body.email, body.purpose, body.nama);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifikasi kode OTP email dan buat sesi JWT' })
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('google/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kirim kode OTP & tautan Ya Ini Saya ke Gmail pengguna' })
  async requestGoogleAuth(@Body() body: GoogleAuthRequestDto) {
    return this.authService.requestGoogleAuth(body.email);
  }

  @Post('google/verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifikasi 6-digit OTP Gmail dan terbitkan JWT' })
  async verifyGoogleOtp(@Body() body: GoogleVerifyOtpDto) {
    return this.authService.verifyGoogleOtp(body.email, body.otp);
  }

  @Post('google/verify-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifikasi tautan konfirmasi "Ya, Ini Saya" dari Gmail dan terbitkan JWT' })
  async verifyGoogleMagicLink(@Body() body: GoogleVerifyMagicLinkDto) {
    return this.authService.verifyGoogleMagicLink(body.email, body.token);
  }

  @Post('google/oauth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifikasi Google OAuth 2.0 Credential dan terbitkan JWT' })
  async verifyGoogleOAuth(@Body() body: GoogleOAuthDto) {
    return this.authService.verifyGoogleOAuth(body.credential);
  }
}
