import { ScheduleStatus } from 'src/modules/schedules/enums/schedule-status.enum';

export class DoctorOccupationReportResponseDto {
  doctorId!: number;

  totalSchedules!: number;

  byStatus!: {
    PENDING: number;
    CONFIRMED: number;
    CANCELLED: number;
    COMPLETED: number;
  };

  occupationRate!: number;

  constructor(
    doctorId: number,
    totalSchedules: number,
    byStatus: Record<ScheduleStatus, number>,
    occupationRate: number,
  ) {
    this.doctorId = doctorId;

    this.totalSchedules = totalSchedules;

    this.byStatus = {
      PENDING: byStatus.PENDING ?? 0,
      CONFIRMED: byStatus.CONFIRMED ?? 0,
      CANCELLED: byStatus.CANCELLED ?? 0,
      COMPLETED: byStatus.COMPLETED ?? 0,
    };

    this.occupationRate = occupationRate;
  }
}
