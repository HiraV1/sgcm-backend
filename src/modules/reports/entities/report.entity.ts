import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ExamEntity } from '../../appointments/entities/exam.entity';

import { ReportStatus } from '../enums/report-status.enum';
import { DoctorEntity } from 'src/modules/users/entities/doctor.entity';
import { PatientEntity } from 'src/modules/users/entities/patient.entity';

@Entity('reports')
export class ReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
  })
  validationCode!: string;

  @Column('text')
  content!: string;

  @Column()
  issuedAt!: Date;

  @Column({
    type: 'varchar',
    enum: ReportStatus,
    default: ReportStatus.ACTIVE,
  })
  status!: ReportStatus;

  @Column({
    nullable: true,
  })
  revokedAt?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  revokedReason?: string;

  @ManyToOne(() => DoctorEntity, {
    nullable: false,
  })
  doctor!: DoctorEntity;

  @ManyToOne(() => PatientEntity, {
    nullable: false,
  })
  patient!: PatientEntity;

  @ManyToOne(() => ExamEntity, {
    nullable: false,
  })
  exam!: ExamEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
