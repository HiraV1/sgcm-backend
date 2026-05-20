import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';

import { ScheduleStatus } from '../enums/schedule-status.enum';
import { ScheduleType } from '../enums/schedule-type.enum';

import { DoctorEntity } from 'src/modules/users/entities/doctor.entity';
import { PatientEntity } from 'src/modules/users/entities/patient.entity';

@Entity('schedules')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class ScheduleEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  scheduledAt!: Date;

  @Column({
    type: 'varchar',
    enum: ScheduleStatus,
    default: ScheduleStatus.PENDING,
  })
  status!: ScheduleStatus;

  @Column({
    type: 'varchar',
    enum: ScheduleType,
  })
  type!: ScheduleType;

  @ManyToOne(() => DoctorEntity)
  doctor!: DoctorEntity;

  @ManyToOne(() => PatientEntity)
  patient!: PatientEntity;

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
