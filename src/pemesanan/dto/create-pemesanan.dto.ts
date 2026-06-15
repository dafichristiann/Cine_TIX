import {
    IsArray,
    ArrayMinSize,
    IsInt,
  } from 'class-validator';
  
  export class CreatePemesananDto {
    @IsInt()
    id_jadwal: number;
  
    @IsArray()
    @ArrayMinSize(1)
    id_slots: number[];
  }