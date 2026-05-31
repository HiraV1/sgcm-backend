import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserResponseDto } from './dto/response/user-response.dto';

import { UserEntity } from './entities/user.entity';
import { AdminEntity } from './entities/admin.entity';
import { DoctorEntity } from './entities/doctor.entity';
import { PatientEntity } from './entities/patient.entity';

import { UserType } from './enums/user-type.enum';

import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { mapUserResponse } from './utils/map-user-response';
import { DoctorResponseDto } from './dto/response/doctor-response.dto';
import { SpecialtyResponseDto } from '../specialties/dto/response/specialty-response.dto';
import { Specialty } from '../specialties/entities/specialty.entity';
import { ScheduleEntity } from '../schedules/entities/schedule.entity';
import { mapScheduleResponse } from '../schedules/utils/map-schedule-response';
import { ScheduleResponseBaseDto } from '../schedules/dto/response/schedule-response-base.dto';
import { DoctorQueryDto } from './dto/query/find-doctors-query.dto';
import { PatientResponseDto } from './dto/response/patient-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(AdminEntity)
    private readonly adminsRepository: Repository<AdminEntity>,

    @InjectRepository(DoctorEntity)
    private readonly doctorsRepository: Repository<DoctorEntity>,

    @InjectRepository(PatientEntity)
    private readonly patientsRepository: Repository<PatientEntity>,

    @InjectRepository(Specialty)
    private readonly specialtiesRepository: Repository<Specialty>,

    @InjectRepository(ScheduleEntity)
    private readonly schedulesRepository: Repository<ScheduleEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, type } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    let user: UserEntity;

    switch (type) {
      case UserType.ADMIN: {
        const admin = new AdminEntity();
        Object.assign(admin, createUserDto);
        admin.password = hashedPassword;
        admin.type = UserType.ADMIN;
        user = admin;
        break;
      }
      case UserType.DOCTOR: {
        const existingCrm = await this.doctorsRepository.findOne({
          where: { crm: createUserDto.crm! },
        });
        if (existingCrm) {
          throw new ConflictException('CRM already in use');
        }

        const doctor = new DoctorEntity();
        Object.assign(doctor, createUserDto);
        doctor.password = hashedPassword;
        doctor.crm = createUserDto.crm!;
        doctor.type = UserType.DOCTOR;
        user = doctor;
        break;
      }
      case UserType.PATIENT: {
        const existingCpf = await this.patientsRepository.findOne({
          where: { cpf: createUserDto.cpf },
        });
        if (existingCpf) {
          throw new ConflictException('CPF already in use');
        }

        const patient = new PatientEntity();
        Object.assign(patient, createUserDto);
        patient.password = hashedPassword;
        patient.cpf = createUserDto.cpf!;
        patient.type = UserType.PATIENT;
        user = patient;
        break;
      }
      default:
        throw new BadRequestException('Invalid user type');
    }

    const savedUser = await this.usersRepository.save(user);

    return mapUserResponse(savedUser);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const { page = 1, limit = 20, sort, search } = paginationQuery;

    const skip = (page - 1) * limit;

    let order: Record<string, 'ASC' | 'DESC'> = {
      createdAt: 'DESC',
    };

    if (sort) {
      const [field, direction] = sort.split(':');

      order = {
        [field]: direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      };
    }

    const where = search
      ? [
          { name: Like(`%${search}%`), isActive: true },
          { email: Like(`%${search}%`), isActive: true },
        ]
      : { isActive: true };

    const [users, totalItems] = await this.usersRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data: users.map((user) => mapUserResponse(user)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findAllDoctors(
    paginationQuery: DoctorQueryDto,
  ): Promise<PaginatedResponse<DoctorResponseDto>> {
    const { page = 1, limit = 20, sort, search, specialtyId } = paginationQuery;

    const skip = (page - 1) * limit;

    const qb = this.doctorsRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialties', 'specialty')
      .where('doctor.isActive = :isActive', {
        isActive: true,
      });

    if (sort) {
      const [field, direction] = sort.split(':');

      qb.orderBy(
        `doctor.${field}`,
        direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    } else {
      qb.orderBy('doctor.createdAt', 'DESC');
    }

    if (search) {
      qb.andWhere('(doctor.name LIKE :search OR doctor.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (specialtyId) {
      qb.andWhere('specialty.id = :specialtyId', {
        specialtyId,
      });
    }

    qb.skip(skip).take(limit);

    const [doctors, totalItems] = await qb.getManyAndCount();

    return {
      data: doctors.map((user) => new DoctorResponseDto(user)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findAllPatients(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<PatientResponseDto>> {
    const { page = 1, limit = 20, sort, search } = paginationQuery;

    const skip = (page - 1) * limit;

    let order: Record<string, 'ASC' | 'DESC'> = {
      createdAt: 'DESC',
    };

    if (sort) {
      const [field, direction] = sort.split(':');

      order = {
        [field]: direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      };
    }

    const where = search
      ? [
          { name: Like(`%${search}%`), isActive: true },
          { email: Like(`%${search}%`), isActive: true },
        ]
      : { isActive: true };

    const [patients, totalItems] = await this.patientsRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data: patients.map((patient) => new PatientResponseDto(patient)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.usersRepository.findOneBy({ email: email });

    return user;
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOneBy({ id });
    /* se o User estiver inativo vai entrar aqui, então não vai mostrar no get/id ou delete/id */
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    return mapUserResponse(user);
  }

  async findOneDoctor(id: number): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: ['specialties'],
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException(`Doctor not found with ID ${id}`);
    }

    return new DoctorResponseDto(doctor);
  }

  async findOnePatient(id: number): Promise<PatientResponseDto> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
    });

    if (!patient || !patient.isActive) {
      throw new NotFoundException(`Patient not found with ID ${id}`);
    }

    return new PatientResponseDto(patient);
  }

  async findDoctorSpecialties(id: number): Promise<SpecialtyResponseDto[]> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: ['specialties'],
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException(`Doctor not found with ID ${id}`);
    }

    return doctor.specialties.map(
      (specialty) => new SpecialtyResponseDto(specialty),
    );
  }

  async findDoctorSchedules(
    doctorId: number,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<ScheduleResponseBaseDto>> {
    const doctor = await this.doctorsRepository.findOneBy({
      id: doctorId,
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException(`Doctor not found with ID ${doctorId}`);
    }

    const { page = 1, limit = 20 } = paginationQuery;

    const skip = (page - 1) * limit;

    const [schedules, totalItems] = await this.schedulesRepository.findAndCount(
      {
        where: {
          doctor: {
            id: doctorId,
          },
        },
        relations: ['doctor', 'patient'],
        skip,
        take: limit,
        order: {
          scheduledAt: 'ASC',
        },
      },
    );

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

  async findPatientSchedules(
    patientId: number,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<ScheduleResponseBaseDto>> {
    const patient = await this.patientsRepository.findOneBy({ id: patientId });

    if (!patient || !patient.isActive) {
      throw new NotFoundException(`Patient not found with ID ${patientId}`);
    }

    const { page = 1, limit = 20 } = paginationQuery;

    const skip = (page - 1) * limit;

    const [schedules, totalItems] = await this.schedulesRepository.findAndCount(
      {
        where: {
          patient: {
            id: patientId,
          },
        },
        relations: ['doctor', 'patient'],
        skip,
        take: limit,
        order: {
          scheduledAt: 'ASC',
        },
      },
    );

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

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }
    }
    Object.assign(user, updateUserDto);

    const updatedUser = await this.usersRepository.save(user);
    return mapUserResponse(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    user.deactivate();

    await this.usersRepository.save(user);
  }

  async addSpecialty(doctorId: number, specialtyId: number) {
    const doctor = await this.usersRepository.manager.findOne(DoctorEntity, {
      where: { id: doctorId },
      relations: ['specialties'],
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException(`Doctor not found with ID ${doctorId}`);
    }

    const specialty = await this.specialtiesRepository.findOneBy({
      id: specialtyId,
    });

    if (!specialty) {
      throw new NotFoundException(`Specialty not found with ID ${specialtyId}`);
    }

    const alreadyHas = doctor.specialties.some((s) => s.id === specialtyId);
    if (alreadyHas) {
      throw new ConflictException('The doctor already has this specialty.');
    }

    doctor.specialties.push(specialty);
    await this.usersRepository.manager.save(doctor);

    return new DoctorResponseDto(doctor);
  }

  async removeSpecialty(doctorId: number, specialtyId: number) {
    const doctor = await this.usersRepository.manager.findOne(DoctorEntity, {
      where: { id: doctorId },
      relations: ['specialties'],
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException('Médico não encontrado.');
    }

    const specialty = await this.specialtiesRepository.findOneBy({
      id: specialtyId,
    });

    if (!specialty) {
      throw new NotFoundException(`Specialty not found with ID ${specialtyId}`);
    }

    const specialtyExists = doctor.specialties.some(
      (s) => s.id === specialtyId,
    );

    if (!specialtyExists) {
      throw new NotFoundException('Specialty is not linked to the doctor.');
    }

    doctor.specialties = doctor.specialties.filter((s) => s.id !== specialtyId);
    await this.usersRepository.save(doctor);

    return;
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`User not found with ID ${userId}`);
    }

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedRefreshToken;
    await this.usersRepository.save(user);

    return;
  }
}
