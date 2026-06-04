import { ApiProperty } from '@nestjs/swagger';
import { ScheduleStatus } from '../../enums/schedule-status.enum';
import { ScheduleType } from '../../enums/schedule-type.enum';
import { ScheduleEntity } from '../../entities/schedule.entity';

export abstract class ScheduleResponseBaseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: '2026-01-15T14:00:00Z',
  })
  scheduledAt!: Date;

  @ApiProperty({
    enum: ScheduleStatus,
    example: ScheduleStatus.PENDING,
  })
  status!: ScheduleStatus;

  @ApiProperty({
    enum: ScheduleType,
    example: ScheduleType.ONLINE,
  })
  type!: ScheduleType;

  @ApiProperty({
    example: 1,
  })
  doctorId!: number;

  @ApiProperty({
    example: 2,
  })
  patientId!: number;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  cancelledAt?: Date;

  @ApiProperty({
    example: 1,
    required: false,
    nullable: true,
  })
  cancelledBy?: number;

  @ApiProperty({
    example: 'Patient requested cancellation',
    nullable: true,
  })
  cancellationReason?: string;

  @ApiProperty({
    example: '2026-01-01T10:00:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: 1,
    nullable: true,
  })
  createdBy?: number;

  @ApiProperty({
    example: '2026-01-01T12:00:00Z',
  })
  updatedAt!: Date;

  /* Como apenas identificadores numéricos são retornados, informações pessoais como 
  nome e e-mail dos usuários não são divulgadas. Essa abordagem mantém a capacidade 
  de auditoria sem expor dados sensíveis. */
  constructor(schedule: ScheduleEntity) {
    this.id = schedule.id;
    this.scheduledAt = schedule.scheduledAt;
    this.status = schedule.status;
    this.type = schedule.type;

    this.doctorId = schedule.doctor.id;
    this.patientId = schedule.patient.id;

    this.cancelledAt = schedule.cancelledAt;
    this.cancelledBy = schedule.cancelledBy;
    this.cancellationReason = schedule.cancellationReason;
    this.createdAt = schedule.createdAt;
    this.createdBy = schedule.createdBy;
    this.updatedAt = schedule.updatedAt;
  }
}
