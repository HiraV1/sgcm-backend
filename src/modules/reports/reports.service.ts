import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ReportResponseDto } from './dto/response/report-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from './entities/report.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';
import { UserType } from '../users/enums/user-type.enum';
import { AppointmentType } from '../appointments/enums/appointment-type.enum';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { ExamEntity } from '../appointments/entities/exam.entity';
import { ReportStatus } from './enums/report-status.enum';
import { randomUUID } from 'crypto';
import { ValidateReportResponseDto } from './dto/response/validate-report-response.dto';
import { RevokeReportDto } from './dto/revoke-report.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { PatientEntity } from '../users/entities/patient.entity';
import { DoctorEntity } from '../users/entities/doctor.entity';
import { ReportPdfDto } from './dto/report-pdf.dto';
import { PdfService } from './pdf.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportsRepository: Repository<ReportEntity>,

    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,

    @InjectRepository(PatientEntity)
    private readonly patientsRepository: Repository<PatientEntity>,

    @InjectRepository(DoctorEntity)
    private readonly doctorsRepository: Repository<DoctorEntity>,

    private readonly pdfService: PdfService,
  ) {}

  async create(
    appointmentId: number,
    dto: CreateReportDto,
    currentUser: JwtPayload,
  ): Promise<ReportResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        id: appointmentId,
      },
      relations: ['doctor', 'patient'],
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment not found with ID ${appointmentId}`,
      );
    }

    if (
      currentUser.type !== UserType.ADMIN &&
      currentUser.sub !== appointment.doctor.id
    ) {
      throw new ForbiddenException(
        'You can only issue reports for your appointments',
      );
    }

    if (appointment.type !== AppointmentType.EXAM) {
      throw new BadRequestException('Reports can only be issued for exams');
    }

    if (appointment.status !== AppointmentStatus.FINISHED) {
      throw new BadRequestException(
        'Report can only be issued for finished exams',
      );
    }

    const exam = appointment as ExamEntity;

    if (!exam.result || !exam.result.trim()) {
      throw new BadRequestException(
        'Exam result must be filled before issuing a report',
      );
    }

    const activeReportExists = await this.reportsRepository.exists({
      where: {
        exam: {
          id: exam.id,
        },
        status: ReportStatus.ACTIVE,
      },
    });

    if (activeReportExists) {
      throw new ConflictException(
        'An active report already exists for this exam',
      );
    }

    const report = this.reportsRepository.create({
      validationCode: randomUUID(),

      content: dto.content,

      issuedAt: new Date(),

      status: ReportStatus.ACTIVE,

      doctor: appointment.doctor,

      patient: appointment.patient,

      exam,
    });

    const savedReport = await this.reportsRepository.save(report);

    return new ReportResponseDto(savedReport);
  }

  async validate(code: string): Promise<ValidateReportResponseDto> {
    const report = await this.reportsRepository.findOne({
      where: {
        validationCode: code,
      },
      relations: ['doctor', 'patient'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    console.log('teste');
    return new ValidateReportResponseDto(report);
  }

  async revoke(
    reportId: number,
    dto: RevokeReportDto,
    currentUser: JwtPayload,
  ): Promise<ReportResponseDto> {
    const report = await this.reportsRepository.findOne({
      where: {
        id: reportId,
      },
      relations: ['doctor', 'patient', 'exam'],
    });

    if (!report) {
      throw new NotFoundException(`Report not found with ID ${reportId}`);
    }

    if (
      currentUser.type !== UserType.ADMIN &&
      currentUser.sub !== report.doctor.id
    ) {
      throw new ForbiddenException('You can only revoke your reports');
    }

    if (report.status === ReportStatus.REVOKED) {
      throw new BadRequestException('Report is already revoked');
    }

    if (!dto.revokedReason || !dto.revokedReason.trim()) {
      throw new BadRequestException('Revoked reason is required');
    }

    report.status = ReportStatus.REVOKED;

    report.revokedAt = new Date();

    report.revokedReason = dto.revokedReason;

    report.revokedBy = currentUser.sub;

    const saved = await this.reportsRepository.save(report);
    
    return new ReportResponseDto(saved);
  }

  async findPatientReports(
    patientId: number,
    paginationQuery: PaginationQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResponse<ReportResponseDto>> {
    const patient = await this.patientsRepository.findOneBy({
      id: patientId,
    });

    if (!patient || !patient.isActive) {
      throw new NotFoundException(`Patient not found with ID ${patientId}`);
    }

    if (currentUser.type === UserType.PATIENT) {
      if (currentUser.sub !== patientId) {
        throw new ForbiddenException('You can only access your reports');
      }
    }

    if (currentUser.type === UserType.DOCTOR) {
      const hasAccess = await this.reportsRepository.exists({
        where: {
          patient: {
            id: patientId,
          },
          doctor: {
            id: currentUser.sub,
          },
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          'You can only access reports from your patients',
        );
      }
    }

    const { page = 1, limit = 20 } = paginationQuery;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<ReportEntity> = {
      patient: {
        id: patientId,
      },
    };

    if (currentUser.type === UserType.DOCTOR) {
      where.doctor = {
        id: currentUser.sub,
      };
    }

    const [reports, totalItems] = await this.reportsRepository.findAndCount({
      where,
      relations: ['doctor', 'patient', 'exam'],
      skip,
      take: limit,
      order: {
        issuedAt: 'DESC',
      },
    });

    return {
      data: reports.map((report) => new ReportResponseDto(report)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findDoctorReports(
    doctorId: number,
    paginationQuery: PaginationQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResponse<ReportResponseDto>> {
    if (currentUser.type === UserType.DOCTOR && currentUser.sub !== doctorId) {
      throw new ForbiddenException('You can only access your reports');
    }

    const doctor = await this.doctorsRepository.findOneBy({ id: doctorId });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException(`Doctor not found with ID ${doctorId}`);
    }

    const { page = 1, limit = 20 } = paginationQuery;

    const skip = (page - 1) * limit;

    const [reports, totalItems] = await this.reportsRepository.findAndCount({
      where: {
        doctor: {
          id: doctorId,
        },
      },
      relations: ['doctor', 'patient', 'exam'],
      skip,
      take: limit,
      order: {
        issuedAt: 'DESC',
      },
    });

    return {
      data: reports.map((report) => new ReportResponseDto(report)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async downloadPdf(
    reportId: number,
    currentUser: JwtPayload,
  ): Promise<{
    validationCode: string;
    buffer: Buffer;
  }> {
    const report = await this.reportsRepository.findOne({
      where: {
        id: reportId,
      },
      relations: ['doctor', 'patient', 'exam'],
    });

    if (!report) {
      throw new NotFoundException(`Report not found with ID ${reportId}`);
    }

    if (currentUser.type !== UserType.ADMIN) {
      const ownsReport =
        currentUser.type === UserType.DOCTOR
          ? report.doctor.id === currentUser.sub
          : report.patient.id === currentUser.sub;

      if (!ownsReport) {
        throw new ForbiddenException('You can only access your reports');
      }
    }

    if (!report.exam.endedAt) {
      throw new InternalServerErrorException(
        'Exam does not contain an end date',
      );
    }

    const pdfDto = this.mapReportPdfDto(report);

    const buffer = await this.pdfService.generateReportPdf(pdfDto);

    return {
      validationCode: report.validationCode,
      buffer,
    };
  }

  private mapReportPdfDto(report: ReportEntity): ReportPdfDto {
    return {
      patientName: report.patient.name,

      doctorName: report.doctor.name,

      doctorCrm: report.doctor.crm,

      examType: report.exam.examType,

      result: report.exam.result ?? '',

      examDate: report.exam.endedAt!,

      issuedAt: report.issuedAt,

      validationCode: report.validationCode,

      reportContent: report.content,

      revokedAt: report.revokedAt,

      revokedReason: report.revokedReason,
    };
  }
}
