import { PartialType } from '@nestjs/swagger';
import { CreatePenggunaDto } from './create-pengguna.dto';

export class UpdatePenggunaDto extends PartialType(CreatePenggunaDto) {}
