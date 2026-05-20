import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';

import { TypeOrmModule } from '@nestjs/typeorm';

import { InPersonScheduleEntity } from './entities/in-person-schedule.entity';
import { ScheduleEntity } from './entities/schedule.entity';
import { OnlineScheduleEntity } from './entities/online-schedule.entity';
import { HomeScheduleEntity } from './entities/home-schedule.entity';
import { DoctorEntity } from '../users/entities/doctor.entity';
import { PatientEntity } from '../users/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleEntity,
      InPersonScheduleEntity,
      OnlineScheduleEntity,
      HomeScheduleEntity,
      DoctorEntity,
      PatientEntity,
    ]),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
