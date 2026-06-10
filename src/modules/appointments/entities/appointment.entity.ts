import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { AppointmentType } from '../enums/appointment-type.enum';
import { DoctorEntity } from 'src/modules/users/entities/doctor.entity';
import { PatientEntity } from 'src/modules/users/entities/patient.entity';
import { ScheduleEntity } from '../../schedules/entities/schedule.entity';
import { ProcedureEntity } from 'src/modules/procedures/entities/procedure.entity';

@Entity('appointments')
@TableInheritance({
  column: {
    type: 'varchar',
    name: 'type',
  },
})
export abstract class AppointmentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varchar',
    enum: AppointmentStatus,
    default: AppointmentStatus.IN_PROGRESS,
  })
  status!: AppointmentStatus;

  @Column({
    type: 'varchar',
    enum: AppointmentType,
  })
  type!: AppointmentType;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  startedAt!: Date;

  @Column({ nullable: true })
  endedAt?: Date;

  @ManyToOne(() => DoctorEntity)
  doctor!: DoctorEntity;

  @ManyToOne(() => PatientEntity)
  patient!: PatientEntity;

  @OneToOne(() => ScheduleEntity)
  @JoinColumn()
  schedule!: ScheduleEntity;

  @OneToMany(
    () => ProcedureEntity,
    (procedureEntity) => procedureEntity.appointment,
  )
  procedures!: ProcedureEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
