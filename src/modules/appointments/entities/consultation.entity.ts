import { ChildEntity, Column } from 'typeorm';
import { AppointmentType } from '../enums/appointment-type.enum';
import { AppointmentEntity } from './appointment.entity';

@ChildEntity(AppointmentType.CONSULTATION)
export class ConsultationEntity extends AppointmentEntity {
  @Column()
  reason!: string;

  @Column({ nullable: true })
  diagnosticHypothesis?: string;
}
