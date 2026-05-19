import { IsString } from 'class-validator';
import { CreateScheduleBaseDto } from './create-schedule-base.dto';

export class CreateInPersonScheduleDto extends CreateScheduleBaseDto {
  @IsString()
  room!: string;

  @IsString()
  unit!: string;
}
