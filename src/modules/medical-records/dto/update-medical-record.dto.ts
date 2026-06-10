import { IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecordDto {
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  prescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
