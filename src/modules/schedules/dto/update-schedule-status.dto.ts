import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateScheduleStatusDto {
  @ApiProperty({
    enum: [ScheduleStatus.CONFIRMED, ScheduleStatus.CANCELLED],
    example: ScheduleStatus.CONFIRMED,
    description: 'Only CONFIRMED and CANCELLED are allowed',
  })
  @IsEnum(ScheduleStatus)
  status!: ScheduleStatus;

  @ApiPropertyOptional({
    example: 'Patient requested cancellation',
    description: 'Reason for cancellation when status is CANCELLED',
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
