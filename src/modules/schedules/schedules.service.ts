import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InPersonScheduleEntity } from './entities/in-person-schedule.entity';
import { Repository } from 'typeorm';

import { OnlineScheduleEntity } from './entities/online-schedule.entity';
import { HomeScheduleEntity } from './entities/home-schedule.entity';
import { ScheduleEntity } from './entities/schedule.entity';
import { DoctorEntity } from '../users/entities/doctor.entity';
import { PatientEntity } from '../users/entities/patient.entity';

import { ScheduleStatus } from './enums/schedule-status.enum';
import { ScheduleType } from './enums/schedule-type.enum';

import { InPersonScheduleResponseDto } from './dto/response/in-person-schedule-response.dto';
import { HomeScheduleResponseDto } from './dto/response/home-schedule-response.dto';
import { OnlineScheduleResponseDto } from './dto/response/online-schedule-response.dto';
import { mapScheduleResponse } from './utils/map-schedule-response';
import { ScheduleResponseBaseDto } from './dto/response/schedule-response-base.dto';
import { FindSchedulesQueryDto } from './dto/query/find-schedules-query.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { ScheduleOwnershipInfo } from './interfaces/schedule-ownership-info.interface';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserType } from '../users/enums/user-type.enum';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(InPersonScheduleEntity)
    private readonly inPersonScheduleRepository: Repository<InPersonScheduleEntity>,

    @InjectRepository(OnlineScheduleEntity)
    private readonly onlineScheduleRepository: Repository<OnlineScheduleEntity>,

    @InjectRepository(HomeScheduleEntity)
    private readonly homeScheduleRepository: Repository<HomeScheduleEntity>,

    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,

    @InjectRepository(DoctorEntity)
    private readonly doctorRepository: Repository<DoctorEntity>,

    @InjectRepository(PatientEntity)
    private readonly patientRepository: Repository<PatientEntity>,
  ) {}

  private async validateUsers(doctorId: number, patientId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor not found with ID ${doctorId}`);
    }

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient not found with ID ${patientId}`);
    }

    return { doctor, patient };
  }

  private validateScheduleTypeFields(dto: CreateScheduleDto): void {
    switch (dto.type) {
      case ScheduleType.IN_PERSON:
        if (!dto.room || !dto.unit) {
          throw new BadRequestException(
            'room and unit are required for IN_PERSON schedules',
          );
        }
        break;

      case ScheduleType.ONLINE:
        if (!dto.accessLink || !dto.platform) {
          throw new BadRequestException(
            'accessLink and platform are required for ONLINE schedules',
          );
        }
        break;

      case ScheduleType.HOME:
        if (!dto.fullAddress) {
          throw new BadRequestException(
            'fullAddress is required for HOME schedules',
          );
        }
        break;
    }
  }

  private validateFutureDate(scheduledAt: string | Date): void {
    const scheduleDate = new Date(scheduledAt);

    if (isNaN(scheduleDate.getTime())) {
      throw new BadRequestException('Invalid schedule date');
    }

    if (scheduleDate <= new Date()) {
      throw new BadRequestException('Schedule date must be in the future');
    }
  }

  async create(
    createScheduleDto: CreateScheduleDto,
    user: JwtPayload,
  ): Promise<ScheduleResponseBaseDto> {
    if (
      user.type === UserType.PATIENT &&
      createScheduleDto.patientId !== user.sub
    ) {
      throw new ForbiddenException(
        'Patients can only create schedules for themselves',
      );
    }

    this.validateFutureDate(createScheduleDto.scheduledAt);
    this.validateScheduleTypeFields(createScheduleDto);

    switch (createScheduleDto.type) {
      case ScheduleType.HOME:
        return this.createHome(createScheduleDto);
      case ScheduleType.IN_PERSON:
        return this.createInPerson(createScheduleDto);
      case ScheduleType.ONLINE:
        return this.createOnline(createScheduleDto);
    }
  }

  private async createInPerson(
    dto: CreateScheduleDto,
  ): Promise<InPersonScheduleResponseDto> {
    const { doctor, patient } = await this.validateUsers(
      dto.doctorId,
      dto.patientId,
    );

    const schedule = this.inPersonScheduleRepository.create({
      scheduledAt: dto.scheduledAt,
      room: dto.room,
      unit: dto.unit,
      doctor,
      patient,
      status: ScheduleStatus.PENDING,
      type: ScheduleType.IN_PERSON,
    });

    const savedInPersonSchedule =
      await this.inPersonScheduleRepository.save(schedule);

    return new InPersonScheduleResponseDto(savedInPersonSchedule);
  }

  private async createHome(
    dto: CreateScheduleDto,
  ): Promise<HomeScheduleResponseDto> {
    const { doctor, patient } = await this.validateUsers(
      dto.doctorId,
      dto.patientId,
    );

    const schedule = this.homeScheduleRepository.create({
      scheduledAt: dto.scheduledAt,
      fullAddress: dto.fullAddress,
      accessNotes: dto.accessNotes,
      doctor,
      patient,
      status: ScheduleStatus.PENDING,
      type: ScheduleType.HOME,
    });

    const savedHomeSchedule = await this.homeScheduleRepository.save(schedule);

    return new HomeScheduleResponseDto(savedHomeSchedule);
  }

  private async createOnline(
    dto: CreateScheduleDto,
  ): Promise<OnlineScheduleResponseDto> {
    const { doctor, patient } = await this.validateUsers(
      dto.doctorId,
      dto.patientId,
    );

    const schedule = this.onlineScheduleRepository.create({
      scheduledAt: dto.scheduledAt,
      accessLink: dto.accessLink,
      platform: dto.platform,
      doctor,
      patient,
      status: ScheduleStatus.PENDING,
      type: ScheduleType.ONLINE,
    });

    const savedOnlineSchedule =
      await this.onlineScheduleRepository.save(schedule);

    return new OnlineScheduleResponseDto(savedOnlineSchedule);
  }

  async findAll(
    query: FindSchedulesQueryDto,
  ): Promise<PaginatedResponse<FindSchedulesQueryDto>> {
    const {
      page = 1,
      limit = 20,
      sort,
      doctorId,
      patientId,
      status,
      type,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.doctor', 'doctor')
      .leftJoinAndSelect('schedule.patient', 'patient');

    if (doctorId) {
      queryBuilder.andWhere('doctor.id = :doctorId', { doctorId });
    }

    if (patientId) {
      queryBuilder.andWhere('patient.id = :patientId', { patientId });
    }

    if (status) {
      queryBuilder.andWhere('schedule.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('schedule.type = :type', { type });
    }

    if (startDate) {
      queryBuilder.andWhere('schedule.scheduledAt >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('schedule.scheduledAt <= :endDate', { endDate });
    }

    if (sort) {
      const [field, direction] = sort.split(':');

      queryBuilder.orderBy(
        `schedule.${field}`,
        direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    } else {
      queryBuilder.orderBy('schedule.createdAt', 'DESC');
    }

    queryBuilder.skip(skip).take(limit);

    const [schedules, totalItems] = await queryBuilder.getManyAndCount();

    return {
      data: schedules.map((schedule) => mapScheduleResponse(schedule)),
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
  ): Promise<ScheduleResponseBaseDto> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found with ID ${id}`);
    }

    if (currentUser.type !== UserType.ADMIN) {
      const ownsSchedule =
        schedule.patient.id === currentUser.sub ||
        schedule.doctor.id === currentUser.sub;

      if (!ownsSchedule) {
        throw new ForbiddenException('You can only access your own schedules');
      }
    }

    return mapScheduleResponse(schedule);
  }

  async findOwnershipInfo(id: number): Promise<ScheduleOwnershipInfo> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found with ID ${id}`);
    }

    return {
      doctorId: schedule.doctor.id,
      patientId: schedule.patient.id,
    };
  }

  private isValidStatusTransition(
    currentStatus: ScheduleStatus,
    nextStatus: ScheduleStatus,
  ): boolean {
    const validTransitions: Partial<Record<ScheduleStatus, ScheduleStatus[]>> =
      {
        [ScheduleStatus.PENDING]: [
          ScheduleStatus.CONFIRMED,
          ScheduleStatus.CANCELLED,
        ],

        [ScheduleStatus.CONFIRMED]: [ScheduleStatus.CANCELLED],
      };

    return validTransitions[currentStatus]?.includes(nextStatus) ?? false;
  }

  async updateStatus(
    id: number,
    updateScheduleStatusDto: UpdateScheduleStatusDto,
    currentUser: JwtPayload,
  ): Promise<ScheduleResponseBaseDto> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found with ID ${id}`);
    }

    if (currentUser.type !== UserType.ADMIN) {
      const ownsSchedule = schedule.patient.id === currentUser.sub;

      if (!ownsSchedule) {
        throw new ForbiddenException();
      }
    }

    if (
      currentUser.type === UserType.PATIENT &&
      updateScheduleStatusDto.status !== ScheduleStatus.CANCELLED
    ) {
      throw new ForbiddenException('Patients can only cancel schedules');
    }

    if (updateScheduleStatusDto.status === ScheduleStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot update status to COMPLETED manually',
      );
    }

    const isValidTransition = this.isValidStatusTransition(
      schedule.status,
      updateScheduleStatusDto.status,
    );

    if (!isValidTransition) {
      throw new BadRequestException(
        `Transition from ${schedule.status} to ${updateScheduleStatusDto.status} is not allowed`,
      );
    }

    schedule.status = updateScheduleStatusDto.status;

    if (updateScheduleStatusDto.status === ScheduleStatus.CANCELLED) {
      schedule.cancelledAt = new Date();
      schedule.cancellationReason =
        updateScheduleStatusDto.cancellationReason ?? 'No reason provided';
    }

    const updatedSchedule = await this.scheduleRepository.save(schedule);

    return mapScheduleResponse(updatedSchedule);
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleResponseBaseDto> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found with ID ${id}`);
    }

    if (updateScheduleDto.scheduledAt) {
      this.validateFutureDate(updateScheduleDto.scheduledAt);
    }

    Object.assign(schedule, updateScheduleDto);

    const updatedSchedule = await this.scheduleRepository.save(schedule);

    return mapScheduleResponse(updatedSchedule);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.scheduleRepository.findOneBy({ id });
    if (!schedule) {
      throw new NotFoundException(`Schedule not found with ID ${id}`);
    }

    if (schedule.status === ScheduleStatus.COMPLETED) {
      throw new BadRequestException('Completed schedules cannot be cancelled');
    }

    await this.scheduleRepository.remove(schedule);
  }
}
