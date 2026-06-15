import { PartialType } from '@nestjs/swagger';
import { CreateKursiDto } from './create-kursi.dto';

export class UpdateKursiDto extends PartialType(CreateKursiDto) {}