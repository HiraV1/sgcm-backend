import { IsOptional, IsString } from 'class-validator';
import { CreateScheduleBaseDto } from './create-schedule-base.dto';

export class CreateHomeScheduleDto extends CreateScheduleBaseDto {
  @IsString()
  fullAddress!: string;

  @IsOptional()
  @IsString()
  accessNotes?: string;
}
