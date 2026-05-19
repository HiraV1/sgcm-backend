import { ApiProperty } from '@nestjs/swagger';
import { ScheduleStatus } from '../enums/schedule-status.enum';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateScheduleStatusDto {
  @ApiProperty({
    enum: [ScheduleStatus.CONFIRMED, ScheduleStatus.CANCELLED],
  })
  @IsEnum([ScheduleStatus.CONFIRMED, ScheduleStatus.CANCELLED])
  status!: ScheduleStatus;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
