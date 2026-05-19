import {
  BadRequestException,
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
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

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

  async createInPerson(
    dto: CreateScheduleDto,
  ): Promise<InPersonScheduleResponseDto> {
    if (dto.scheduledAt <= new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

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

  async createHome(dto: CreateScheduleDto): Promise<HomeScheduleResponseDto> {
    if (dto.scheduledAt <= new Date()) {
      throw new BadRequestException('Schedule date must be in the future');
    }

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

  async createOnline(
    dto: CreateScheduleDto,
  ): Promise<OnlineScheduleResponseDto> {
    if (dto.scheduledAt <= new Date()) {
      throw new BadRequestException('Schedule date must be in the future');
    }

    if (!dto.accessLink || !dto.platform) {
      throw new BadRequestException(
        'Access link and platform are required for online schedules',
      );
    }

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

  async findOne(id: number): Promise<ScheduleResponseBaseDto> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found with ID ${id}`);
    }

    return mapScheduleResponse(schedule);
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
  ): Promise<ScheduleResponseBaseDto> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['doctor', 'patient'],
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule not found with ID ${id}`);
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

    if (
      updateScheduleDto.scheduledAt &&
      updateScheduleDto.scheduledAt <= new Date()
    ) {
      throw new BadRequestException('Schedule date must be in the future');
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
