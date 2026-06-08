import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  diagnosticHypothesis?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  examType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  result?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clinicalEvolution?: string;
}
