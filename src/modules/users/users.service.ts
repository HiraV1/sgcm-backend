import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

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
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, type } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    let user: UserEntity;

    switch (type) {
      case UserType.ADMIN: {
        const admin = new AdminEntity();
        Object.assign(admin, createUserDto);
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

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOneBy({ id });
    /* se o User estiver inativo vai entrar aqui, então não vai mostrar no get/id ou delete/id */
    if (!user || !user.isActive) {
      throw new NotFoundException('User not found');
    }

    return mapUserResponse(user);
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
}
