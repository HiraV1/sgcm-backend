import { ApiProperty } from '@nestjs/swagger';
import { AppointmentEntity } from '../../entities/appointment.entity';
import { AppointmentStatus } from '../../enums/appointment-status.enum';
import { AppointmentType } from '../../enums/appointment-type.enum';

export abstract class AppointmentResponseBaseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.IN_PROGRESS,
  })
  status!: AppointmentStatus;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.CONSULTATION,
  })
  type!: AppointmentType;

  @ApiProperty({
    example: 'Additional notes',
    required: false,
    nullable: true,
  })
  notes?: string;

  @ApiProperty({
    example: '2026-01-15T14:00:00Z',
  })
  startedAt!: Date;

  @ApiProperty({
    example: '2026-01-15T15:00:00Z',
    required: false,
    nullable: true,
  })
  endedAt?: Date;

  @ApiProperty({
    example: 1,
  })
  doctorId!: number;

  @ApiProperty({
    example: 2,
  })
  patientId!: number;

  @ApiProperty({
    example: 5,
  })
  scheduleId!: number;

  @ApiProperty({
    example: '2026-01-15T14:00:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-01-15T15:00:00Z',
  })
  updatedAt!: Date;

  constructor(appointment: AppointmentEntity) {
    this.id = appointment.id;

    this.status = appointment.status;
    this.type = appointment.type;

    this.notes = appointment.notes;

    this.startedAt = appointment.startedAt;
    this.endedAt = appointment.endedAt;

    this.doctorId = appointment.doctor.id;
    this.patientId = appointment.patient.id;
    this.scheduleId = appointment.schedule.id;

    this.createdAt = appointment.createdAt;
    this.updatedAt = appointment.updatedAt;
  }
}
