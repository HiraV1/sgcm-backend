import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { UserEntity } from './entities/user.entity';
import { AdminEntity } from './entities/admin.entity';
import { DoctorEntity } from './entities/doctor.entity';
import { PatientEntity } from './entities/patient.entity';
import { DoctorsController } from './doctors.controller';
import { Specialty } from '../specialties/entities/specialty.entity';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { PatientsController } from './patients.controller';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    MedicalRecordsModule,
    ReportsModule,
    TypeOrmModule.forFeature([
      UserEntity,
      AdminEntity,
      DoctorEntity,
      PatientEntity,
      Specialty,
      ScheduleEntity,
      AppointmentEntity,
    ]),
  ],
  controllers: [UsersController, DoctorsController, PatientsController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
