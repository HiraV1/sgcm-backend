import * as PDFDocument from 'pdfkit';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ReportPdfDto } from './dto/report-pdf.dto';

@Injectable()
export class PdfService {
  async generateReportPdf(data: ReportPdfDto): Promise<Buffer> {
    try {
      const doc = new PDFDocument({
        margin: 50,
      });

      const chunks: Buffer[] = [];

      return await new Promise<Buffer>((resolve, reject) => {
        doc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        // ==================================================
        // HEADER
        // ==================================================

        doc.fontSize(20).text('SGCM - Medical Report', {
          align: 'center',
        });

        doc.moveDown(2);

        // ==================================================
        // PATIENT
        // ==================================================

        doc.fontSize(16).text('Patient');

        doc.moveDown(0.5).fontSize(12).text(`Name: ${data.patientName}`);

        doc.moveDown();

        // ==================================================
        // DOCTOR
        // ==================================================

        doc.fontSize(16).text('Doctor');

        doc
          .moveDown(0.5)
          .fontSize(12)
          .text(`Name: ${data.doctorName}`)
          .text(`CRM: ${data.doctorCrm}`);

        doc.moveDown();

        // ==================================================
        // EXAM
        // ==================================================

        doc.fontSize(16).text('Exam Information');

        doc
          .moveDown(0.5)
          .fontSize(12)
          .text(`Exam Type: ${data.examType}`)
          .text(`Exam Date: ${data.examDate.toLocaleString()}`);

        doc.moveDown();

        // ==================================================
        // RESULT
        // ==================================================

        doc.fontSize(16).text('Exam Result');

        doc.moveDown(0.5).fontSize(12).text(data.result);

        doc.moveDown();

        // ==================================================
        // REPORT CONTENT
        // ==================================================

        doc.fontSize(16).text('Report');

        doc.moveDown(0.5).fontSize(12).text(data.reportContent, {
          align: 'justify',
        });

        doc.moveDown();

        // ==================================================
        // ISSUED DATE
        // ==================================================

        doc.fontSize(16).text('Issue Information');

        doc
          .moveDown(0.5)
          .fontSize(12)
          .text(`Issued At: ${data.issuedAt.toLocaleString()}`);

        doc.moveDown();

        // ==================================================
        // REVOKED
        // ==================================================

        if (data.revokedAt) {
          doc.fontSize(16).text('REVOKED');

          doc
            .moveDown(0.5)
            .fontSize(12)
            .text(`Revoked At: ${data.revokedAt.toLocaleString()}`)
            .text(`Reason: ${data.revokedReason ?? '-'}`);

          doc.moveDown();
        }

        // ==================================================
        // VALIDATION CODE
        // ==================================================

        doc.moveDown();

        doc.fontSize(18).text('Validation Code', {
          align: 'center',
        });

        doc.moveDown(0.5).fontSize(22).text(data.validationCode, {
          align: 'center',
        });

        doc.moveDown();

        doc
          .fontSize(12)
          .text(
            'Use this code in the public validation endpoint to verify the authenticity of this report.',
            {
              align: 'center',
            },
          );

        doc.end();
      });
    } catch {
      throw new InternalServerErrorException('Failed to generate PDF report');
    }
  }
}
