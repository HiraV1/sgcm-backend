import { ChildEntity, Column } from 'typeorm';

import { ScheduleType } from '../enums/schedule-type.enum';

import { ScheduleEntity } from './schedule.entity';

@ChildEntity(ScheduleType.ONLINE)
export class OnlineScheduleEntity extends ScheduleEntity {
  @Column()
  accessLink!: string;

  @Column()
  platform!: string;
}
