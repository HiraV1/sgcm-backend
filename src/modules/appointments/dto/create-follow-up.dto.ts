import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFollowUpDto extends CreateAppointmentDto {
  @ApiProperty({
    example: 5,
    description:
      'Identifier of the appointment that originated this follow-up',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  originAppointmentId!: number;

  @ApiPropertyOptional({
    description: 'Clinical evolution observed during the follow-up appointment',
    example:
      'Patient reports significant improvement after treatment',
  })

  @IsOptional()
  @IsString()
  clinicalEvolution!: string;
}
