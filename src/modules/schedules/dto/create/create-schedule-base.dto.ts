import { Type } from 'class-transformer';
import { IsDate, IsInt, Min } from 'class-validator';

export class CreateScheduleBaseDto {
  @Type(() => Date)
  @IsDate()
  scheduledAt!: Date;

  @IsInt()
  @Min(1)
  doctorId!: number;

  @IsInt()
  @Min(1)
  patientId!: number;
}
