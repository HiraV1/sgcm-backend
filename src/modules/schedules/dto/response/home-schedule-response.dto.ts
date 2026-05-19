import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleResponseBaseDto } from './schedule-response-base.dto';
import { HomeScheduleEntity } from '../../entities/home-schedule.entity';

export class HomeScheduleResponseDto extends ScheduleResponseBaseDto {
  @ApiProperty({
    example: '123 Main Street, Apartment 45',
  })
  fullAddress!: string;

  @ApiPropertyOptional({
    example: 'Ring the bell twice',
  })
  accessNotes?: string;

  constructor(schedule: HomeScheduleEntity) {
    super(schedule);

    this.fullAddress = schedule.fullAddress;
    this.accessNotes = schedule.accessNotes;
  }
}
