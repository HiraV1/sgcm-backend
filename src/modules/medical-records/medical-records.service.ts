import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MedicalRecordResponseDto } from './dto/response/medical-record-response.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { MedicalRecordEntity } from './entities/medical-record.entity';
import { UserType } from '../users/enums/user-type.enum';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { DoctorEntity } from '../users/entities/doctor.entity';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PatientEntity } from '../users/entities/patient.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecordEntity)
    private readonly medicalRecordsRepository: Repository<MedicalRecordEntity>,

    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,

    @InjectRepository(DoctorEntity)
    private readonly doctorsRepository: Repository<DoctorEntity>,

    @InjectRepository(PatientEntity)
    private readonly patientsRepository: Repository<PatientEntity>,
  ) {}

  async create(
    appointmentId: number,
    dto: CreateMedicalRecordDto,
    currentUser: JwtPayload,
  ): Promise<MedicalRecordResponseDto> {
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
        'You can only create records for your appointments',
      );
    }

    if (appointment.status !== AppointmentStatus.FINISHED) {
      throw new BadRequestException(
        'Medical records can only be created for finished appointments',
      );
    }

    const existingRecord = await this.medicalRecordsRepository.findOne({
      where: {
        appointment: {
          id: appointmentId,
        },
      },
    });

    if (existingRecord) {
      throw new ConflictException(
        'A medical record already exists for this appointment',
      );
    }

    let doctor: DoctorEntity | null = appointment.doctor;

    if (currentUser.type === UserType.DOCTOR) {
      const currentDoctor = await this.doctorsRepository.findOneBy({
        id: currentUser.sub,
      });

      if (!currentDoctor) {
        throw new NotFoundException(
          `Doctor not found with ID ${currentUser.sub}`,
        );
      }

      doctor = currentDoctor;
    }

    const record = this.medicalRecordsRepository.create({
      diagnosis: dto.diagnosis,
      prescription: dto.prescription,
      notes: dto.notes,

      appointment,
      updatedBy: doctor,
    });

    const saved = await this.medicalRecordsRepository.save(record);

    return new MedicalRecordResponseDto(saved);
  }

  async findAppointmentRecord(
    appointmentId: number,
    currentUser: JwtPayload,
  ): Promise<MedicalRecordResponseDto> {
    const record = await this.medicalRecordsRepository.findOne({
      where: {
        appointment: {
          id: appointmentId,
        },
      },
      relations: [
        'appointment',
        'appointment.doctor',
        'appointment.patient',
        'updatedBy',
      ],
    });

    if (!record) {
      throw new NotFoundException(
        `Medical record not found for appointment ${appointmentId}`,
      );
    }

    if (currentUser.type !== UserType.ADMIN) {
      const ownsRecord =
        record.appointment.patient.id === currentUser.sub ||
        record.appointment.doctor.id === currentUser.sub;

      if (!ownsRecord) {
        throw new ForbiddenException('You can only access your medical record');
      }
    }

    return new MedicalRecordResponseDto(record);
  }

  async update(
    id: number,
    dto: UpdateMedicalRecordDto,
    currentUser: JwtPayload,
  ): Promise<MedicalRecordResponseDto> {
    const record = await this.medicalRecordsRepository.findOne({
      where: {
        id,
      },
      relations: [
        'appointment',
        'appointment.doctor',
        'appointment.patient',
        'updatedBy',
      ],
    });

    if (!record) {
      throw new NotFoundException(`Medical record not found with ID ${id}`);
    }

    if (
      currentUser.type !== UserType.ADMIN &&
      currentUser.sub !== record.appointment.doctor.id
    ) {
      throw new ForbiddenException('You can only update your medical records');
    }

    record.diagnosis = dto.diagnosis ?? record.diagnosis;

    record.prescription = dto.prescription ?? record.prescription;

    record.notes = dto.notes ?? record.notes;

    let doctor: DoctorEntity | null = record.appointment.doctor;

    if (currentUser.type === UserType.DOCTOR) {
      const currentDoctor = await this.doctorsRepository.findOneBy({
        id: currentUser.sub,
      });

      if (!currentDoctor) {
        throw new NotFoundException(
          `Doctor not found with ID ${currentUser.sub}`,
        );
      }

      doctor = currentDoctor;
    }

    record.updatedBy = doctor;

    const updatedRecord = await this.medicalRecordsRepository.save(record);

    return new MedicalRecordResponseDto(updatedRecord);
  }

  remove(id: number) {
    return `This action removes a #${id} medicalRecord`;
  }

  async findPatientRecords(
    patientId: number,
    paginationQuery: PaginationQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResponse<MedicalRecordResponseDto>> {
    if (currentUser.type === UserType.PATIENT) {
      if (currentUser.sub !== patientId) {
        throw new ForbiddenException(
          'You can only access your medical records',
        );
      }
    }

    if (currentUser.type === UserType.DOCTOR) {
      const hasAccess = await this.medicalRecordsRepository.exists({
        where: {
          appointment: {
            patient: {
              id: patientId,
            },
            doctor: {
              id: currentUser.sub,
            },
          },
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException(
          'You can only access records from your patients',
        );
      }
    }

    const patient = await this.patientsRepository.findOneBy({
      id: patientId,
    });

    if (!patient || !patient.isActive) {
      throw new NotFoundException(`Patient not found with ID ${patientId}`);
    }

    const { page = 1, limit = 20 } = paginationQuery;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<MedicalRecordEntity> = {
      appointment: {
        patient: {
          id: patientId,
        },
      },
    };

    if (currentUser.type === UserType.DOCTOR) {
      where.appointment = {
        patient: {
          id: patientId,
        },
        doctor: {
          id: currentUser.sub,
        },
      };
    }

    const [records, totalItems] =
      await this.medicalRecordsRepository.findAndCount({
        where,
        relations: [
          'appointment',
          'appointment.doctor',
          'appointment.patient',
          'updatedBy',
        ],
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      data: records.map((record) => new MedicalRecordResponseDto(record)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findDoctorRecords(
    doctorId: number,
    paginationQuery: PaginationQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResponse<MedicalRecordResponseDto>> {
    if (currentUser.type !== UserType.ADMIN && currentUser.sub !== doctorId) {
      throw new ForbiddenException('You can only access your medical records');
    }

    const doctor = await this.doctorsRepository.findOneBy({
      id: doctorId,
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException(`Doctor not found with ID ${doctorId}`);
    }

    const { page = 1, limit = 20 } = paginationQuery;

    const skip = (page - 1) * limit;

    const [records, totalItems] =
      await this.medicalRecordsRepository.findAndCount({
        where: {
          appointment: {
            doctor: {
              id: doctorId,
            },
          },
        },
        relations: [
          'appointment',
          'appointment.doctor',
          'appointment.patient',
          'updatedBy',
        ],
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      data: records.map((record) => new MedicalRecordResponseDto(record)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }
}
