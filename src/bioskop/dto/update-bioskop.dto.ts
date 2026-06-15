import { PartialType } from '@nestjs/swagger';
import { CreateBioskopDto } from './create-bioskop.dto';

export class UpdateBioskopDto extends PartialType(
  CreateBioskopDto,
) {}