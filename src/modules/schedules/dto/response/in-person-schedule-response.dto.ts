import { ApiProperty } from '@nestjs/swagger';
import { ScheduleResponseBaseDto } from './schedule-response-base.dto';
import { InPersonScheduleEntity } from '../../entities/in-person-schedule.entity';

export class InPersonScheduleResponseDto extends ScheduleResponseBaseDto {
  @ApiProperty({
    example: 'Room 204',
  })
  room!: string;

  @ApiProperty({
    example: 'Main Clinic Unit',
  })
  unit!: string;

  constructor(schedule: InPersonScheduleEntity) {
    super(schedule);

    this.room = schedule.room;
    this.unit = schedule.unit;
  }
}
