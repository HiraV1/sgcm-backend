import { ChildEntity, Column } from 'typeorm';
import { AppointmentType } from '../enums/appointment-type.enum';
import { AppointmentEntity } from './appointment.entity';

@ChildEntity(AppointmentType.FOLLOW_UP)
export class FollowUpEntity extends AppointmentEntity {
  @Column()
  clinicalEvolution!: string;

  @Column()
  originAppointmentId!: number;
}
