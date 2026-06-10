import { ReportEntity } from '../../entities/report.entity';
import { ReportStatus } from '../../enums/report-status.enum';

export class ValidateReportResponseDto {
  validationCode!: string;

  status!: ReportStatus;

  issuedAt!: Date;

  patientName!: string;

  doctorName!: string;

  isRevoked!: boolean;

  revokedAt?: Date;

  revokedReason?: string;

  constructor(report: ReportEntity) {
    this.validationCode = report.validationCode;

    this.status = report.status;

    this.issuedAt = report.issuedAt;

    this.patientName = report.patient.name;

    this.doctorName = report.doctor.name;

    this.isRevoked = report.status === ReportStatus.REVOKED;

    this.revokedAt = report.revokedAt;

    this.revokedReason = report.revokedReason;
  }
}
