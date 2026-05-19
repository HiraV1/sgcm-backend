import { ApiProperty } from '@nestjs/swagger';
import { ScheduleResponseBaseDto } from './schedule-response-base.dto';
import { OnlineScheduleEntity } from '../../entities/online-schedule.entity';

export class OnlineScheduleResponseDto extends ScheduleResponseBaseDto {
  @ApiProperty()
  accessLink!: string;

  @ApiProperty()
  platform!: string;

  constructor(schedule: OnlineScheduleEntity) {
    super(schedule);

    this.accessLink = schedule.accessLink;
    this.platform = schedule.platform;
  }
}
