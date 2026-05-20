import { ChildEntity, Column } from 'typeorm';

import { ScheduleType } from '../enums/schedule-type.enum';

import { ScheduleEntity } from './schedule.entity';

@ChildEntity(ScheduleType.HOME)
export class HomeScheduleEntity extends ScheduleEntity {
  @Column()
  fullAddress!: string;

  @Column({ nullable: true })
  accessNotes?: string;
}
