// src/pengguna/dto/update-pengguna.dto.ts
import { PartialType } from '@nestjs/swagger'; // atau '@nestjs/mapped-types'
import { CreatePenggunaDto } from './create-pengguna.dto';

export class UpdatePenggunaDto extends PartialType(CreatePenggunaDto) {}