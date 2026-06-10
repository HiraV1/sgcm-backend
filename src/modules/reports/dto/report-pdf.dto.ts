export class ReportPdfDto {
  patientName!: string;

  doctorName!: string;

  doctorCrm!: string;

  examType!: string;

  result!: string;

  examDate!: Date;

  issuedAt!: Date;

  validationCode!: string;

  reportContent!: string;

  revokedAt?: Date;

  revokedReason?: string;
}
