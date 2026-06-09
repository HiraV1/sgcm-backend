import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsultationDto extends CreateAppointmentDto {
  @ApiProperty({
    example: 'Persistent headache for two weeks',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({
    example: 'Possible migraine',
    description: 'Initial diagnostic hypothesis',
  })
  @IsOptional()
  @IsString()
  diagnosticHypothesis?: string;
}
