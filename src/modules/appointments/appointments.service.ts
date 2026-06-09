import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentEntity } from './entities/appointment.entity';
import { ConsultationEntity } from './entities/consultation.entity';
import { ExamEntity } from './entities/exam.entity';
import { FollowUpEntity } from './entities/follow-up.entity';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { Repository } from 'typeorm';
import { ScheduleStatus } from '../schedules/enums/schedule-status.enum';
import { AppointmentType } from './enums/appointment-type.enum';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { mapAppointmentResponse } from './utils/map-appointment-response';
import { AppointmentResponseBaseDto } from './dto/response/appointment-response-base.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserType } from '../users/enums/user-type.enum';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentQueryDto } from './dto/query/find-appointment-query.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,

    @InjectRepository(ConsultationEntity)
    private readonly consultationRepository: Repository<ConsultationEntity>,

    @InjectRepository(ExamEntity)
    private readonly examRepository: Repository<ExamEntity>,

    @InjectRepository(FollowUpEntity)
    private readonly followUpRepository: Repository<FollowUpEntity>,

    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
  ) {}

  private async validateSchedule(scheduleId: number): Promise<ScheduleEntity> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: ['doctor', 'patient'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found with ID ${scheduleId}`);
    }

    if (schedule.status !== ScheduleStatus.CONFIRMED) {
      throw new BadRequestException(
        'Appointment can only be created from confirmed schedules',
      );
    }

    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        schedule: {
          id: scheduleId,
        },
      },
    });

    if (existingAppointment) {
      throw new ConflictException('This schedule already has an appointment');
    }

    return schedule;
  }

  private validateDoctorOwnership(
    currentUser: JwtPayload,
    doctorId: number,
    msg: string,
  ) {
    if (currentUser.type !== UserType.ADMIN && currentUser.sub !== doctorId) {
      throw new ForbiddenException(msg);
    }
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseBaseDto> {
    const schedule = await this.validateSchedule(
      createAppointmentDto.scheduleId,
    );

    switch (createAppointmentDto.type) {
      case AppointmentType.CONSULTATION:
        return this.createConsultation(
          createAppointmentDto as CreateConsultationDto,
          schedule,
        );
      case AppointmentType.EXAM:
        return this.createExam(createAppointmentDto as CreateExamDto, schedule);
      case AppointmentType.FOLLOW_UP:
        return this.createFollowUp(
          createAppointmentDto as CreateFollowUpDto,
          schedule,
        );
    }
  }

  private async createConsultation(
    dto: CreateConsultationDto,
    schedule: ScheduleEntity,
  ): Promise<AppointmentResponseBaseDto> {
    const appointment = this.consultationRepository.create({
      type: AppointmentType.CONSULTATION,
      reason: dto.reason,
      startedAt: new Date(),

      schedule,
      doctor: schedule.doctor,
      patient: schedule.patient,

      status: AppointmentStatus.IN_PROGRESS,
    });
    console.log(appointment);

    console.log('Antes de salvar');
    const saved = await this.consultationRepository.save(appointment);
    console.log(saved);
    return mapAppointmentResponse(saved);
  }

  private async createExam(
    dto: CreateExamDto,
    schedule: ScheduleEntity,
  ): Promise<AppointmentResponseBaseDto> {
    const appointment = this.examRepository.create({
      type: AppointmentType.EXAM,
      examType: dto.examType,

      schedule,
      doctor: schedule.doctor,
      patient: schedule.patient,

      status: AppointmentStatus.IN_PROGRESS,
    });

    const saved = await this.examRepository.save(appointment);

    return mapAppointmentResponse(saved);
  }

  private async createFollowUp(
    dto: CreateFollowUpDto,
    schedule: ScheduleEntity,
  ): Promise<AppointmentResponseBaseDto> {
    const originAppointment = await this.appointmentRepository.findOne({
      where: {
        id: dto.originAppointmentId,
      },
      relations: ['patient'],
    });

    if (!originAppointment) {
      throw new NotFoundException('Origin appointment not found');
    }

    if (originAppointment.patient.id !== schedule.patient.id) {
      throw new BadRequestException(
        'Follow-up must reference an appointment from the same patient',
      );
    }

    const appointment = this.followUpRepository.create({
      type: AppointmentType.FOLLOW_UP,
      clinicalEvolution: dto.clinicalEvolution,
      originAppointmentId: dto.originAppointmentId,

      schedule,
      doctor: schedule.doctor,
      patient: schedule.patient,

      status: AppointmentStatus.IN_PROGRESS,
    });

    const saved = await this.followUpRepository.save(appointment);

    return mapAppointmentResponse(saved);
  }

  async findAll(
    paginationQuery: AppointmentQueryDto,
  ): Promise<PaginatedResponse<AppointmentResponseBaseDto>> {
    const {
      page = 1,
      limit = 20,
      sort,
      doctorId,
      patientId,
      type,
      status,
      startDate,
      endDate,
    } = paginationQuery;

    const skip = (page - 1) * limit;

    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.schedule', 'schedule');

    if (doctorId) {
      qb.andWhere('doctor.id = :doctorId', {
        doctorId,
      });
    }

    if (patientId) {
      qb.andWhere('patient.id = :patientId', {
        patientId,
      });
    }

    if (type) {
      qb.andWhere('appointment.type = :type', {
        type,
      });
    }

    if (status) {
      qb.andWhere('appointment.status = :status', {
        status,
      });
    }

    if (startDate) {
      qb.andWhere('appointment.startedAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      qb.andWhere('appointment.startedAt <= :endDate', {
        endDate,
      });
    }

    if (sort) {
      const [field, direction] = sort.split(':');

      qb.orderBy(
        `appointment.${field}`,
        direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    } else {
      qb.orderBy('appointment.createdAt', 'DESC');
    }

    qb.skip(skip).take(limit);

    const [appointments, totalItems] = await qb.getManyAndCount();

    return {
      data: appointments.map(mapAppointmentResponse),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(
    id: number,
    currentUser: JwtPayload,
  ): Promise<AppointmentResponseBaseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient', 'schedule'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment not found with ID ${id}`);
    }

    if (currentUser.type !== UserType.ADMIN) {
      const ownsAppointment =
        appointment.patient.id === currentUser.sub ||
        appointment.doctor.id === currentUser.sub;

      if (!ownsAppointment) {
        throw new ForbiddenException(
          'You can only access your own appointments',
        );
      }
    }

    return mapAppointmentResponse(appointment);
  }

  private updateConsultation(
    consultation: ConsultationEntity,
    dto: UpdateAppointmentDto,
  ): void {
    consultation.reason = dto.reason ?? consultation.reason;

    consultation.diagnosticHypothesis =
      dto.diagnosticHypothesis ?? consultation.diagnosticHypothesis;
  }

  private updateExam(exam: ExamEntity, dto: UpdateAppointmentDto): void {
    exam.examType = dto.examType ?? exam.examType;

    exam.result = dto.result ?? exam.result;
  }

  private updateFollowUp(
    followUp: FollowUpEntity,
    dto: UpdateAppointmentDto,
  ): void {
    followUp.clinicalEvolution =
      dto.clinicalEvolution ?? followUp.clinicalEvolution;
  }

  async update(id: number, dto: UpdateAppointmentDto, currentUser: JwtPayload) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient', 'schedule'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment not found with ID ${id}`);
    }

    this.validateDoctorOwnership(
      currentUser,
      appointment.doctor.id,
      'You can only update your appointment',
    );

    if (appointment.status === AppointmentStatus.FINISHED) {
      throw new BadRequestException('Finished appointments cannot be edited');
    }

    appointment.notes = dto.notes ?? appointment.notes;

    switch (appointment.type) {
      case AppointmentType.CONSULTATION: {
        this.updateConsultation(appointment as ConsultationEntity, dto);
        break;
      }
      case AppointmentType.EXAM: {
        this.updateExam(appointment as ExamEntity, dto);
        break;
      }
      case AppointmentType.FOLLOW_UP: {
        this.updateFollowUp(appointment as FollowUpEntity, dto);
        break;
      }
      default:
        throw new BadRequestException('Unsupported appointment type');
    }

    const updatedAppointment =
      await this.appointmentRepository.save(appointment);

    return mapAppointmentResponse(updatedAppointment);
  }

  async finish(
    id: number,
    currentUser: JwtPayload,
  ): Promise<AppointmentResponseBaseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient', 'schedule'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment not found with ID ${id}`);
    }

    this.validateDoctorOwnership(
      currentUser,
      appointment.doctor.id,
      `You can only finish your appointment`,
    );

    if (appointment.status === AppointmentStatus.FINISHED) {
      throw new BadRequestException('Appointment is already finished');
    }

    if (appointment.type === AppointmentType.CONSULTATION) {
      const consultation = appointment as ConsultationEntity;

      if (!consultation.diagnosticHypothesis) {
        throw new BadRequestException(
          'Diagnostic hypothesis must be filled before finishing the consultation appointment',
        );
      }
    }

    if (appointment.type === AppointmentType.EXAM) {
      const exam = appointment as ExamEntity;

      if (!exam.result) {
        throw new BadRequestException(
          'Exam result must be filled before finishing the appointment',
        );
      }
    }

    appointment.status = AppointmentStatus.FINISHED;
    appointment.endedAt = new Date();

    await this.scheduleRepository.update(appointment.schedule.id, {
      status: ScheduleStatus.COMPLETED,
    });

    const saved = await this.appointmentRepository.save(appointment);

    return mapAppointmentResponse(saved);
  }
}
