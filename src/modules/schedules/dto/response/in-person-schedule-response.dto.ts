import { ApiProperty } from '@nestjs/swagger';
import { ScheduleResponseBaseDto } from './schedule-response-base.dto';
import { InPersonScheduleEntity } from '../../entities/in-person-schedule.entity';

export class InPersonScheduleResponseDto extends ScheduleResponseBaseDto {
  @ApiProperty()
  room!: string;

  @ApiProperty()
  unit!: string;

  constructor(schedule: InPersonScheduleEntity) {
    super(schedule);

    this.room = schedule.room;
    this.unit = schedule.unit;
  }
}
