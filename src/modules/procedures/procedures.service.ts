import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProcedureEntity } from './entities/procedure.entity';
import { Repository } from 'typeorm';
import { SimpleProcedureEntity } from './entities/simple-procedure.entity';
import { SpecializedProcedureEntity } from './entities/specialized-procedure.entity';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';
import { CreateSimpleProcedureDto } from './dto/create-simple-procedure.dto';
import { CreateSpecializedProcedureDto } from './dto/create-specialized-procedure.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ProcedureResponseBaseDto } from './dto/response/procedure-response-base.dto';
import { UserType } from '../users/enums/user-type.enum';
import { ProcedureType } from './enums/procedure-type.enum';
import { mapProcedureResponse } from './utils/map-procedure-response';
import { AuthorizationStatus } from './enums/procedure-authorization-status.enum';
import { ProcedureQueryDto } from './dto/query/procedure-query.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { ProcedureAuthorizationDto } from './dto/procedure-authorization.dto';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(ProcedureEntity)
    private readonly procedureRepository: Repository<ProcedureEntity>,

    @InjectRepository(SimpleProcedureEntity)
    private readonly simpleProcedureRepository: Repository<SimpleProcedureEntity>,

    @InjectRepository(SpecializedProcedureEntity)
    private readonly specializedProcedureRepository: Repository<SpecializedProcedureEntity>,

    @InjectRepository(AppointmentEntity)
    private readonly appointmentRepository: Repository<AppointmentEntity>,
  ) {}

  private async validateAppointment(
    appointmentId: number,
  ): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'patient', 'schedule'],
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment not found with ID ${appointmentId}`,
      );
    }

    if (appointment.status === AppointmentStatus.FINISHED) {
      throw new BadRequestException(
        'Cannot add procedure to a finished appointment',
      );
    }

    return appointment;
  }

  private async validateAppointmentOwnership(
    appointmentId: number,
    currentUser: JwtPayload,
  ): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'patient', 'schedule'],
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment not found with ID ${appointmentId}`,
      );
    }

    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    const isDoctor = currentUser.type === UserType.DOCTOR &&
      currentUser.sub === appointment.doctor.id;

    const isPatient = currentUser.type === UserType.PATIENT &&
      currentUser.sub === appointment.patient.id;

    if (!isDoctor && !isPatient) {
      throw new ForbiddenException('You can only access your appointment');
    }
  }

  async create(
    appointmentId: number,
    dto: CreateSimpleProcedureDto | CreateSpecializedProcedureDto,
    currentUser: JwtPayload,
  ): Promise<ProcedureResponseBaseDto> {
    const appointment = await this.validateAppointment(appointmentId);

    if (
      currentUser.type !== UserType.ADMIN &&
      currentUser.sub !== appointment.doctor.id
    ) {
      throw new ForbiddenException('You can only manage your own procedure');
    }

    switch (dto.type) {
      case ProcedureType.SIMPLE:
        return this.createSimpleProcedure(
          appointment,
          dto as CreateSimpleProcedureDto,
        );
      case ProcedureType.SPECIALIZED:
        return this.createSpecializedProcedure(
          appointment,
          dto as CreateSpecializedProcedureDto,
        );
      default:
        throw new BadRequestException('Unsupported procedure type');
    }
  }

  private async createSimpleProcedure(
    appointment: AppointmentEntity,
    dto: CreateSimpleProcedureDto,
  ): Promise<ProcedureResponseBaseDto> {
    const procedure = this.simpleProcedureRepository.create({
      ...dto,
      appointment,
    });

    const saved = await this.simpleProcedureRepository.save(procedure);

    return mapProcedureResponse(saved);
  }

  private async createSpecializedProcedure(
    appointment: AppointmentEntity,
    dto: CreateSpecializedProcedureDto,
  ): Promise<ProcedureResponseBaseDto> {
    const procedure = this.specializedProcedureRepository.create({
      ...dto,
      appointment,
      authorizationStatus: dto.requiresAuthorization
        ? AuthorizationStatus.PENDING
        : AuthorizationStatus.AUTHORIZED,
    });

    const saved = await this.specializedProcedureRepository.save(procedure);

    return mapProcedureResponse(saved);
  }

  async findOne(
    id: number,
    currentUser: JwtPayload,
  ): Promise<ProcedureResponseBaseDto> {
    const procedure = await this.procedureRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.doctor', 'appointment.patient'],
    });

    if (!procedure) {
      throw new NotFoundException(`Procedure not found with ID ${id}`);
    }

    if (currentUser.type === UserType.ADMIN) {
      return mapProcedureResponse(procedure);
    }

    const isDoctor = currentUser.type === UserType.DOCTOR &&
      currentUser.sub === procedure.appointment.doctor.id;

    const isPatient = currentUser.type === UserType.PATIENT &&
      currentUser.sub === procedure.appointment.patient.id;

    if (!isDoctor && !isPatient) {
      throw new ForbiddenException('You can only access your procedures');
    }

    return mapProcedureResponse(procedure);
  }

  async findAppointmentProcedures(
    appointmentId: number,
    query: ProcedureQueryDto,
    currentUser: JwtPayload,
  ): Promise<PaginatedResponse<ProcedureResponseBaseDto>> {
    await this.validateAppointmentOwnership(appointmentId, currentUser);

    const { page = 1, limit = 20, sort, type, authorizationStatus } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.procedureRepository
      .createQueryBuilder('procedure')
      .leftJoinAndSelect('procedure.appointment', 'appointment')
      .where('appointment.id = :appointmentId', { appointmentId });

    if (type) {
      queryBuilder.andWhere('procedure.type = :type', { type });
    }

    if (authorizationStatus && type && type === ProcedureType.SPECIALIZED) {
      queryBuilder.andWhere(
        'procedure.authorizationStatus = :authorizationStatus',
        { authorizationStatus },
      );
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'name'];

    const [field, direction] = (sort ?? 'createdAt:DESC').split(':');

    const sortField = allowedSortFields.includes(field) ? field : 'createdAt';

    queryBuilder.orderBy(
      `procedure.${sortField}`,
      direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    );

    queryBuilder.skip(skip).take(limit);

    const [procedures, totalItems] = await queryBuilder.getManyAndCount();

    return {
      data: procedures.map(mapProcedureResponse),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async update(id: number, dto: UpdateProcedureDto, currentUser: JwtPayload) {
    const procedure = await this.procedureRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.doctor'],
    });

    if (!procedure) {
      throw new ForbiddenException(`Procedure not found with ID ${id}`);
    }

    if (
      currentUser.type !== UserType.ADMIN &&
      currentUser.sub !== procedure.appointment.doctor.id
    ) {
      throw new ForbiddenException('You can only update your procedures');
    }

    if (procedure.appointment.status === AppointmentStatus.FINISHED) {
      throw new BadRequestException(
        'Procedures from finished appointments cannot be edited',
      );
    }

    switch (procedure.type) {
      case ProcedureType.SIMPLE:
        this.updateSimpleProcedure(procedure as SimpleProcedureEntity, dto);
        break;

      case ProcedureType.SPECIALIZED:
        this.updateSpecializedProcedure(
          procedure as SpecializedProcedureEntity,
          dto,
        );
        break;

      default:
        throw new BadRequestException('Unsupported procedure type');
    }

    const updatedProcedure = await this.procedureRepository.save(procedure);

    return mapProcedureResponse(updatedProcedure);
  }

  private updateSimpleProcedure(
    procedure: SimpleProcedureEntity,
    dto: UpdateProcedureDto,
  ): void {
    if (
      dto.requiredEquipment !== undefined ||
      dto.complexityLevel !== undefined ||
      dto.requiresAuthorization !== undefined
    ) {
      throw new BadRequestException(
        'Specialized procedure fields are not allowed for SIMPLE procedures',
      );
    }

    procedure.name = dto.name ?? procedure.name;

    procedure.description = dto.description ?? procedure.description;

    procedure.estimatedDuration =
      dto.estimatedDuration ?? procedure.estimatedDuration;
  }

  private updateSpecializedProcedure(
    procedure: SpecializedProcedureEntity,
    dto: UpdateProcedureDto,
  ): void {
    if (
      procedure.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      procedure.authorizationStatus === AuthorizationStatus.DENIED
    ) {
      throw new BadRequestException(
        'Authorized or denied procedures cannot be edited',
      );
    }

    if (dto.estimatedDuration !== undefined) {
      throw new BadRequestException(
        'estimatedDuration is only available for SIMPLE procedures',
      );
    }

    procedure.name = dto.name ?? procedure.name;

    procedure.description = dto.description ?? procedure.description;

    procedure.requiredEquipment =
      dto.requiredEquipment ?? procedure.requiredEquipment;

    procedure.complexityLevel =
      dto.complexityLevel ?? procedure.complexityLevel;

    procedure.requiresAuthorization =
      dto.requiresAuthorization ?? procedure.requiresAuthorization;
  }

  private async validateSpecializedProcedureForAuthorization(
    procedureId: number,
  ): Promise<SpecializedProcedureEntity> {
    const procedure = await this.specializedProcedureRepository.findOne({
      where: {
        id: procedureId,
      },
      relations: ['appointment', 'appointment.doctor', 'appointment.patient'],
    });

    if (!procedure) {
      throw new NotFoundException(
        `Specialized procedure not found with ID ${procedureId}`,
      );
    }

    if (!procedure.requiresAuthorization) {
      throw new BadRequestException(
        'This procedure does not require authorization',
      );
    }

    if (procedure.authorizationStatus !== AuthorizationStatus.PENDING) {
      throw new BadRequestException('Authorization has already been decided');
    }

    return procedure;
  }

  async authorization(
    id: number,
    dto: ProcedureAuthorizationDto,
    currentUser: JwtPayload,
  ): Promise<ProcedureResponseBaseDto> {
    const procedure =
      await this.validateSpecializedProcedureForAuthorization(id);

    if (dto.status === AuthorizationStatus.PENDING) {
      throw new BadRequestException(
        'Cannot set authorization status back to PENDING',
      );
    }

    procedure.authorizationStatus = dto.status;

    procedure.authorizedAt = new Date();

    procedure.authorizedBy = currentUser.sub;

    const updatedProcedure =
      await this.specializedProcedureRepository.save(procedure);

    return mapProcedureResponse(updatedProcedure);
  }

  async remove(id: number, currentUser: JwtPayload): Promise<void> {
    const procedure = await this.procedureRepository.findOne({
      where: { id },
      relations: ['appointment', 'appointment.doctor'],
    });

    if (!procedure) {
      throw new NotFoundException(`Procedure not found with ID ${id}`);
    }

    if (
      currentUser.type !== UserType.ADMIN &&
      currentUser.sub !== procedure.appointment.doctor.id
    ) {
      throw new ForbiddenException('You can only delete your procedures');
    }

    if (procedure.appointment.status === AppointmentStatus.FINISHED) {
      throw new ConflictException(
        'Procedures from finished appointments cannot be deleted',
      );
    }

    if (procedure.type === ProcedureType.SPECIALIZED) {
      const specialized = procedure as SpecializedProcedureEntity;

      if (specialized.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        throw new ConflictException('Authorized procedures cannot be deleted');
      }
    }

    await this.procedureRepository.remove(procedure);
  }
}
