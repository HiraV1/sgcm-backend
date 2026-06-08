import { ChildEntity, Column } from 'typeorm';
import { AppointmentType } from '../enums/appointment-type.enum';
import { AppointmentEntity } from './appointment.entity';

@ChildEntity(AppointmentType.EXAM)
export class ExamEntity extends AppointmentEntity {
  @Column()
  examType!: string;

  @Column({ type: 'text', nullable: true })
  result?: string;
}
