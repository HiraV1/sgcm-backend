import { AppointmentStatus } from 'src/modules/appointments/enums/appointment-status.enum';
import { AppointmentType } from 'src/modules/appointments/enums/appointment-type.enum';

export class AppointmentReportResponseDto {
  total!: number;

  byStatus!: {
    IN_PROGRESS: number;
    FINISHED: number;
  };

  byType!: {
    CONSULTATION: number;
    EXAM: number;
    FOLLOW_UP: number;
  };

  constructor(
    total: number,
    byStatus: Record<AppointmentStatus, number>,
    byType: Record<AppointmentType, number>,
  ) {
    this.total = total;

    this.byStatus = {
      IN_PROGRESS: byStatus.IN_PROGRESS ?? 0,
      FINISHED: byStatus.FINISHED ?? 0,
    };

    this.byType = {
      CONSULTATION: byType.CONSULTATION ?? 0,
      EXAM: byType.EXAM ?? 0,
      FOLLOW_UP: byType.FOLLOW_UP ?? 0,
    };
  }
}
