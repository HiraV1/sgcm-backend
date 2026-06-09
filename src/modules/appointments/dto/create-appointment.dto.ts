import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsPositive } from 'class-validator';
import { AppointmentType } from '../enums/appointment-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the confirmed schedule that will originate the appointment',
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  scheduleId!: number;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.CONSULTATION,
    description: 'Type of appointment to be created',
  })
  @IsEnum(AppointmentType)
  type!: AppointmentType;

  @ApiPropertyOptional({
    example: 'Patient reports mild headache during the last week',
    description: 'Additional notes related to the appointment',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
