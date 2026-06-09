import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsPositive } from 'class-validator';
import { AppointmentType } from '../enums/appointment-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  scheduleId!: number;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.CONSULTATION,
  })
  @IsEnum(AppointmentType)
  type!: AppointmentType;

  @ApiProperty({
    example: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
