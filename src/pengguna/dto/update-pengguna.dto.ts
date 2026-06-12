import { PartialType } from '@nestjs/mapped-types'; // atau '@nestjs/swagger' jika pakai swagger
import { CreatePenggunaDto } from './create-pengguna.dto';

export class UpdatePenggunaDto extends PartialType(CreatePenggunaDto) {}