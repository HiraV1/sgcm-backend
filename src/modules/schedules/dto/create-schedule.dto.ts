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
  @ApiProperty()
  @IsDateString()
  scheduledAt!: Date;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  doctorId!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  patientId!: number;

  @ApiProperty({
    enum: ScheduleType,
  })
  @IsEnum(ScheduleType)
  type!: ScheduleType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessNotes?: string;
}
