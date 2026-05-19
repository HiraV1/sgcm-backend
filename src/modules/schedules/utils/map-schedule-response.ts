import { HomeScheduleResponseDto } from '../dto/response/home-schedule-response.dto';
import { InPersonScheduleResponseDto } from '../dto/response/in-person-schedule-response.dto';
import { OnlineScheduleResponseDto } from '../dto/response/online-schedule-response.dto';
import { ScheduleResponseBaseDto } from '../dto/response/schedule-response-base.dto';

import { HomeScheduleEntity } from '../entities/home-schedule.entity';
import { InPersonScheduleEntity } from '../entities/in-person-schedule.entity';
import { OnlineScheduleEntity } from '../entities/online-schedule.entity';
import { ScheduleEntity } from '../entities/schedule.entity';

export function mapScheduleResponse(
  schedule: ScheduleEntity,
): ScheduleResponseBaseDto {
  if (schedule instanceof InPersonScheduleEntity) {
    return new InPersonScheduleResponseDto(schedule);
  }

  if (schedule instanceof HomeScheduleEntity) {
    return new HomeScheduleResponseDto(schedule);
  }

  return new OnlineScheduleResponseDto(schedule as OnlineScheduleEntity);
}
