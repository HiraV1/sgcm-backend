import { ApiProperty } from '@nestjs/swagger';
import { ScheduleStatus } from '../../enums/schedule-status.enum';
import { ScheduleType } from '../../enums/schedule-type.enum';
import { ScheduleEntity } from '../../entities/schedule.entity';

export abstract class ScheduleResponseBaseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  scheduledAt!: Date;

  @ApiProperty({
    enum: ScheduleStatus,
  })
  status!: ScheduleStatus;

  @ApiProperty({
    enum: ScheduleType,
  })
  type!: ScheduleType;

  @ApiProperty()
  doctorId!: number;

  @ApiProperty()
  patientId!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(schedule: ScheduleEntity) {
    this.id = schedule.id;
    this.scheduledAt = schedule.scheduledAt;
    this.status = schedule.status;
    this.type = schedule.type;

    this.doctorId = schedule.doctor.id;
    this.patientId = schedule.patient.id;

    this.createdAt = schedule.createdAt;
    this.updatedAt = schedule.updatedAt;
  }
}
