import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    example: '2026-01-15T14:00:00Z',
    description: 'Updated scheduled date and time',
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @ApiPropertyOptional({
    example: 'Room 305',
    description: 'Updated room for in-person schedules',
  })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiPropertyOptional({
    example: 'North Clinic Unit',
    description: 'Updated unit for in-person schedules',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    example: 'https://meet.google.com/new-link',
    description: 'Updated access link for online schedules',
  })
  @IsOptional()
  @IsString()
  accessLink?: string;

  @ApiPropertyOptional({
    example: 'Zoom',
    description: 'Updated platform for online schedules',
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({
    example: '456 New Avenue, House 12',
    description: 'Updated address for home schedules',
  })
  @IsOptional()
  @IsString()
  fullAddress?: string;

  @ApiPropertyOptional({
    example: 'Use side entrance',
    description: 'Updated access notes for home schedules',
  })
  @IsOptional()
  @IsString()
  accessNotes?: string;
}
