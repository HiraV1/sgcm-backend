import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentEntity } from './entities/appointment.entity';
import { ConsultationEntity } from './entities/consultation.entity';
import { ExamEntity } from './entities/exam.entity';
import { FollowUpEntity } from './entities/follow-up.entity';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { ProceduresModule } from '../procedures/procedures.module';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';

@Module({
  imports: [
    ProceduresModule,
    MedicalRecordsModule,
    TypeOrmModule.forFeature([
      AppointmentEntity,
      ConsultationEntity,
      ExamEntity,
      FollowUpEntity,
      ScheduleEntity,
    ]),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
