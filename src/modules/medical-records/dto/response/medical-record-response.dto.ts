import { MedicalRecordEntity } from '../../entities/medical-record.entity';

export class MedicalRecordResponseDto {
  id!: number;

  diagnosis!: string;

  prescription!: string;

  notes?: string;

  appointmentId!: number;

  doctorId!: number;

  patientId!: number;

  updatedById!: number;

  createdAt!: Date;

  updatedAt!: Date;

  constructor(record: MedicalRecordEntity) {
    this.id = record.id;

    this.diagnosis = record.diagnosis;
    this.prescription = record.prescription;
    this.notes = record.notes;

    this.appointmentId = record.appointment.id;

    this.doctorId = record.appointment.doctor.id;
    this.patientId = record.appointment.patient.id;

    this.updatedById = record.updatedBy.id;

    this.createdAt = record.createdAt;
    this.updatedAt = record.updatedAt;
  }
}
