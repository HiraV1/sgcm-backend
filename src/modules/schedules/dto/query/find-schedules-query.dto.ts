import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ScheduleType } from '../../enums/schedule-type.enum';
import { ScheduleStatus } from '../../enums/schedule-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindSchedulesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filter schedules by doctor ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter schedules by patient ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @ApiPropertyOptional({
    enum: ScheduleStatus,
    example: ScheduleStatus.PENDING,
    description: 'Filter schedules by status',
  })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @ApiPropertyOptional({
    enum: ScheduleType,
    example: ScheduleType.ONLINE,
    description: 'Filter schedules by type',
  })
  @IsOptional()
  @IsEnum(ScheduleType)
  type?: ScheduleType;

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00Z',
    description: 'Start date for schedule range filtering',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-01-31T23:59:59Z',
    description: 'End date for schedule range filtering',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
