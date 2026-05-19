import { ApiProperty } from '@nestjs/swagger';
import { ScheduleResponseBaseDto } from './schedule-response-base.dto';
import { HomeScheduleEntity } from '../../entities/home-schedule.entity';

export class HomeScheduleResponseDto extends ScheduleResponseBaseDto {
  @ApiProperty()
  fullAddress!: string;

  @ApiProperty({ required: false })
  accessNotes?: string;

  constructor(schedule: HomeScheduleEntity) {
    super(schedule);

    this.fullAddress = schedule.fullAddress;
    this.accessNotes = schedule.accessNotes;
  }
}
