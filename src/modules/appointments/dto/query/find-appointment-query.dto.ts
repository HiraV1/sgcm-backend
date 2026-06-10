import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { AppointmentType } from '../../enums/appointment-type.enum';
import { AppointmentStatus } from '../../enums/appointment-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AppointmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter appointments by doctor identifier',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  doctorId?: number;

  @ApiPropertyOptional({
    description: 'Filter appointments by patient identifier',
    example: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  patientId?: number;

  @ApiPropertyOptional({
    enum: AppointmentType,
    example: AppointmentType.EXAM,
    description: 'Filter appointments by appointment type',
  })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional({
    enum: AppointmentStatus,
    example: AppointmentStatus.FINISHED,
    description: 'Filter appointments by appointment status',
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Start date for filtering appointments by period',
    example: '2025-09-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering appointments by period',
    example: '2025-09-30',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
