import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './entities/report.entity';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';
import { PatientEntity } from '../users/entities/patient.entity';
import { DoctorEntity } from '../users/entities/doctor.entity';
import { PdfService } from './pdf.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportEntity,
      AppointmentEntity,
      PatientEntity,
      DoctorEntity,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, PdfService],
  exports: [ReportsService],
})
export class ReportsModule {}
