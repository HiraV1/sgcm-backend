import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamDto extends CreateAppointmentDto {
  @ApiProperty({
    example: 'Blood Test',
    description: 'Type of exam requested for the patient',
  })
  @IsString()
  @IsNotEmpty()
  examType!: string;

  @ApiPropertyOptional({
    example: 'Normal blood count values',
    description: 'Exam result generated after execution',
  })
  @IsOptional()
  @IsString()
  result?: string;
}
