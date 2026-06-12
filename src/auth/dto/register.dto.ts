import {isEmail, IsNotEmpty, IsString, MinLength, IsOptional, MaxLength, IsEmail} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: ' Dafi Christian'})
    @IsString()
    @MaxLength(100)
    nama!: string;

    @ApiProperty({ example: 'dafi@gmail.com '})
    @IsEmail({},{message: 'Email tidak valid'})
    @MaxLength(150)
    email!: string;

    @ApiProperty({ example: 'password123',minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'Password minimal 8 karakter' })
    password!: string;

    @ApiProperty({ example: '081234567890', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(20)
    noTelp?: string;
}
