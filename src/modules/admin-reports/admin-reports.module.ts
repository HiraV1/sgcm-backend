import { Module } from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { AdminReportsController } from './admin-reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';
import { ProcedureEntity } from '../procedures/entities/procedure.entity';
import { DoctorEntity } from '../users/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScheduleEntity,
      AppointmentEntity,
      ProcedureEntity,
      DoctorEntity,
    ]),
  ],
  controllers: [AdminReportsController],
  providers: [AdminReportsService],
})
export class AdminReportsModule {}
