import { ScheduleStatus } from 'src/modules/schedules/enums/schedule-status.enum';
import { ScheduleType } from 'src/modules/schedules/enums/schedule-type.enum';

export class ScheduleReportResponseDto {
  total!: number;

  byStatus!: {
    PENDING: number;
    CONFIRMED: number;
    CANCELLED: number;
    COMPLETED: number;
  };

  byType!: {
    IN_PERSON: number;
    ONLINE: number;
    HOME: number;
  };

  constructor(
    total: number,
    byStatus: Record<ScheduleStatus, number>,
    byType: Record<ScheduleType, number>,
  ) {
    this.total = total;

    this.byStatus = {
      PENDING: byStatus.PENDING ?? 0,
      CONFIRMED: byStatus.CONFIRMED ?? 0,
      CANCELLED: byStatus.CANCELLED ?? 0,
      COMPLETED: byStatus.COMPLETED ?? 0,
    };

    this.byType = {
      IN_PERSON: byType.IN_PERSON ?? 0,
      ONLINE: byType.ONLINE ?? 0,
      HOME: byType.HOME ?? 0,
    };
  }
}
