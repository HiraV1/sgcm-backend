import { ChildEntity, Column } from 'typeorm';

import { ScheduleType } from '../enums/schedule-type.enum';

import { ScheduleEntity } from './schedule.entity';

@ChildEntity(ScheduleType.IN_PERSON)
export class InPersonScheduleEntity extends ScheduleEntity {
  @Column()
  room!: string;

  @Column()
  unit!: string;
}
