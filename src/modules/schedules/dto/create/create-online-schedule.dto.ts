import { IsString, IsUrl } from 'class-validator';
import { CreateScheduleBaseDto } from './create-schedule-base.dto';

export class CreateOnlineScheduleDto extends CreateScheduleBaseDto {
  @IsUrl()
  accessLink!: string;

  @IsString()
  platform!: string;
}
