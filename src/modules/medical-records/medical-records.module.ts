import { Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordEntity } from './entities/medical-record.entity';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';
import { DoctorEntity } from '../users/entities/doctor.entity';
import { PatientEntity } from '../users/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalRecordEntity,
      AppointmentEntity,
      DoctorEntity,
      PatientEntity,
    ]),
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
