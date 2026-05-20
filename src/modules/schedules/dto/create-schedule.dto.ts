import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ScheduleType } from '../enums/schedule-type.enum';

export class CreateScheduleDto {
  @ApiProperty({
    example: '2026-01-15T14:00:00Z',
    description: 'Scheduled date and time for the appointment',
  })
  @IsDateString()
  scheduledAt!: Date;

  @ApiProperty({
    example: 1,
    description: 'Doctor ID',
  })
  @Type(() => Number)
  @IsInt()
  doctorId!: number;

  @ApiProperty({
    example: 1,
    description: 'Patient ID',
  })
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @ApiProperty({
    enum: ScheduleType,
    example: ScheduleType.ONLINE,
    description: 'Schedule modality type',
  })
  @IsEnum(ScheduleType)
  type!: ScheduleType;

  @ApiPropertyOptional({
    example: 'Room 204',
    description: 'Required for in-person schedules',
  })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional({
    example: 'Main Clinic Unit',
    description: 'Required for in-person schedules',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    example: 'https://meet.google.com/abc-defg',
    description: 'Required for online schedules',
  })
  @IsOptional()
  @IsString()
  accessLink?: string;

  @ApiPropertyOptional({
    example: 'Google Meet',
    description: 'Required for online schedules',
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({
    example: '123 Main Street, Apartment 45',
    description: 'Required for home schedules',
  })
  @IsOptional()
  @IsString()
  fullAddress?: string;

  @ApiPropertyOptional({
    example: 'Ring the bell twice',
    description: 'Additional notes for home schedules',
  })
  @IsOptional()
  @IsString()
  accessNotes?: string;
}
