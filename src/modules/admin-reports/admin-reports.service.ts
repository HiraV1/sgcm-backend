import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminReportQueryDto } from './dto/query/admin-report-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { Repository } from 'typeorm';
import { ScheduleReportResponseDto } from './dto/response/schedule-resport-response.dto';
import { AppointmentReportResponseDto } from './dto/response/appointment-report-response.dto';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';
import { ProcedureReportResponseDto } from './dto/response/procedure-report-response.dto';
import { ProcedureEntity } from '../procedures/entities/procedure.entity';
import { ProcedureType } from '../procedures/enums/procedure-type.enum';
import { SpecializedProcedureEntity } from '../procedures/entities/specialized-procedure.entity';
import { DoctorOccupationReportResponseDto } from './dto/response/doctor-occupation-report-response.dto';
import { DoctorEntity } from '../users/entities/doctor.entity';

@Injectable()
export class AdminReportsService {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,

    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,

    @InjectRepository(ProcedureEntity)
    private readonly proceduresRepository: Repository<ProcedureEntity>,

    @InjectRepository(DoctorEntity)
    private readonly doctorsRepository: Repository<DoctorEntity>,
  ) {}

  private validateDateRange(query: AdminReportQueryDto): void {
    if (
      query.startDate &&
      query.endDate &&
      new Date(query.startDate) > new Date(query.endDate)
    ) {
      throw new BadRequestException('startDate cannot be after endDate');
    }
  }

  async getSchedulesReport(query: AdminReportQueryDto) {
    this.validateDateRange(query);

    const qb = this.scheduleRepository.createQueryBuilder('schedule');

    if (query.startDate) {
      qb.andWhere('schedule.scheduledAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('schedule.scheduledAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    const schedules = await qb.getMany();

    const byStatus = {
      PENDING: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
      COMPLETED: 0,
    };

    const byType = {
      IN_PERSON: 0,
      ONLINE: 0,
      HOME: 0,
    };

    for (const schedule of schedules) {
      byStatus[schedule.status]++;
      byType[schedule.type]++;
    }

    return new ScheduleReportResponseDto(schedules.length, byStatus, byType);
  }

  async getAppointmentsReport(
    query: AdminReportQueryDto,
  ): Promise<AppointmentReportResponseDto> {
    this.validateDateRange(query);

    const qb = this.appointmentRepository.createQueryBuilder('appointment');

    if (query.startDate) {
      qb.andWhere('appointment.startedAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('appointment.startedAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.doctorId) {
      qb.andWhere('appointment.doctor.id = :doctorId', {
        doctorId: query.doctorId,
      });
    }

    const appointments = await qb
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .getMany();

    const byStatus = {
      IN_PROGRESS: 0,
      FINISHED: 0,
    };

    const byType = {
      CONSULTATION: 0,
      EXAM: 0,
      FOLLOW_UP: 0,
    };

    for (const appointment of appointments) {
      byStatus[appointment.status]++;
      byType[appointment.type]++;
    }

    return new AppointmentReportResponseDto(
      appointments.length,
      byStatus,
      byType,
    );
  }

  async getProceduresReport(
    query: AdminReportQueryDto,
  ): Promise<ProcedureReportResponseDto> {
    this.validateDateRange(query);

    const qb = this.proceduresRepository.createQueryBuilder('procedure');

    if (query.startDate) {
      qb.andWhere('procedure.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('procedure.createdAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    const procedures = await qb.getMany();

    const byType = {
      SIMPLE: 0,
      SPECIALIZED: 0,
    };

    const byAuthorizationStatus = {
      PENDING: 0,
      AUTHORIZED: 0,
      DENIED: 0,
    };

    const byComplexityLevel = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
    };

    for (const procedure of procedures) {
      byType[procedure.type]++;

      if (procedure.type === ProcedureType.SPECIALIZED) {
        const specialized = procedure as SpecializedProcedureEntity;

        if (specialized.authorizationStatus) {
          byAuthorizationStatus[specialized.authorizationStatus]++;
        }

        byComplexityLevel[specialized.complexityLevel]++;
      }
    }

    return new ProcedureReportResponseDto(
      procedures.length,
      byType,
      byAuthorizationStatus,
      byComplexityLevel,
    );
  }

  async getDoctorOccupationReport(
    doctorId: number,
    query: AdminReportQueryDto,
  ): Promise<DoctorOccupationReportResponseDto> {
    this.validateDateRange(query);

    const doctor = await this.doctorsRepository.findOneBy({
      id: doctorId,
    });

    if (!doctor) {
      throw new NotFoundException(`Doctor not found with ID ${doctorId}`);
    }

    const qb = this.scheduleRepository.createQueryBuilder('schedule');

    qb.andWhere('schedule.doctorId = :doctorId', {
      doctorId,
    });

    if (query.startDate) {
      qb.andWhere('schedule.scheduledAt >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('schedule.scheduledAt <= :endDate', {
        endDate: query.endDate,
      });
    }

    const schedules = await qb.getMany();

    const byStatus = {
      PENDING: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
      COMPLETED: 0,
    };

    for (const schedule of schedules) {
      byStatus[schedule.status]++;
    }

    const occupiedSchedules =
      byStatus.PENDING + byStatus.CONFIRMED + byStatus.COMPLETED;

    const occupationRate =
      schedules.length === 0
        ? 0
        : Number(((occupiedSchedules / schedules.length) * 100).toFixed(2));

    return new DoctorOccupationReportResponseDto(
      doctorId,
      schedules.length,
      byStatus,
      occupationRate,
    );
  }
}
