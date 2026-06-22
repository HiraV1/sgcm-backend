import { ReportEntity } from '../../entities/report.entity';
import { ReportStatus } from '../../enums/report-status.enum';

export class ReportResponseDto {
  id!: number;

  validationCode!: string;

  content!: string;

  status!: ReportStatus;

  issuedAt!: Date;

  revokedAt?: Date;

  revokedReason?: string;

  revokedBy?: number;

  doctorId!: number;

  patientId!: number;

  examId!: number;

  createdAt!: Date;

  updatedAt!: Date;

  constructor(report: ReportEntity) {
    this.id = report.id;

    this.validationCode = report.validationCode;

    this.content = report.content;

    this.status = report.status;

    this.issuedAt = report.issuedAt;

    this.revokedAt = report.revokedAt;
    this.revokedReason = report.revokedReason;
    this.revokedBy = report.revokedBy;

    this.doctorId = report.doctor.id;
    this.patientId = report.patient.id;
    this.examId = report.exam.id;

    this.createdAt = report.createdAt;
    this.updatedAt = report.updatedAt;
  }
}
