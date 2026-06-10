import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    description: 'Additional notes related to the appointment',
    example: 'Patient reports improvement after medication',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Updated reason for the consultation',
    example: 'Persistent headache for two weeks',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Updated diagnostic hypothesis for a consultation',
    example: 'Possible migraine',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  diagnosticHypothesis?: string;

  @ApiPropertyOptional({
    description: 'Updated exam type',
    example: 'Blood Test',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  examType?: string;

  @ApiPropertyOptional({
    description: 'Updated exam result',
    example: 'Normal blood count values',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  result?: string;

  @ApiPropertyOptional({
    description: 'Updated clinical evolution for a follow-up appointment',
    example: 'Patient reports significant improvement after treatment',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clinicalEvolution?: string;
}
