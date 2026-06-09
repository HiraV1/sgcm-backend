import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  prescription!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
