import { AppointmentEntity } from 'src/modules/appointments/entities/appointment.entity';
import { DoctorEntity } from 'src/modules/users/entities/doctor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('medical_records')
export class MedicalRecordEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  diagnosis!: string;

  @Column('text')
  prescription!: string;

  @Column('text')
  notes!: string;

  @ManyToOne(() => DoctorEntity)
  updatedBy!: DoctorEntity;

  @OneToOne(() => AppointmentEntity)
  @JoinColumn()
  appointment!: AppointmentEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
