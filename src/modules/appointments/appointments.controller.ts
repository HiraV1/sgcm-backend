import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserType } from '../users/enums/user-type.enum';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AppointmentResponseBaseDto } from './dto/response/appointment-response-base.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentQueryDto } from './dto/query/find-appointment-query.dto';
import { AppointmentType } from './enums/appointment-type.enum';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { ProceduresService } from '../procedures/procedures.service';
import { CreateSimpleProcedureDto } from '../procedures/dto/create-simple-procedure.dto';
import { CreateSpecializedProcedureDto } from '../procedures/dto/create-specialized-procedure.dto';
import { ProcedureQueryDto } from '../procedures/dto/query/procedure-query.dto';
import { ProcedureType } from '../procedures/enums/procedure-type.enum';
import { AuthorizationStatus } from '../procedures/enums/procedure-authorization-status.enum';
import { MedicalRecordResponseDto } from '../medical-records/dto/response/medical-record-response.dto';
import { CreateMedicalRecordDto } from '../medical-records/dto/create-medical-record.dto';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { CreateReportDto } from '../reports/dto/create-report.dto';
import { ReportsService } from '../reports/reports.service';
import { ReportResponseDto } from '../reports/dto/response/report-response.dto';

@ApiTags('Appointments')
@ApiBearerAuth('JWT-auth')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly proceduresService: ProceduresService,
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly reportsService: ReportsService,
  ) {}

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new appointment',
  })
  @ApiBody({
    description:
      'Create appointments based on their type. Appointments can only be created from confirmed schedules.',
    examples: {
      consultation: {
        summary: 'Create consultation appointment',
        value: {
          scheduleId: 1,
          type: 'CONSULTATION',
          reason: 'Persistent headache for the last two weeks',
        },
      },

      exam: {
        summary: 'Create exam appointment',
        value: {
          scheduleId: 2,
          type: 'EXAM',
          examType: 'Electrocardiogram',
        },
      },

      followUp: {
        summary: 'Create follow-up appointment',
        value: {
          scheduleId: 3,
          type: 'FOLLOW_UP',
          clinicalEvolution:
            'Patient reports significant improvement after treatment',
          originAppointmentId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid appointment data or schedule is not confirmed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Schedule not found',
  })
  @ApiResponse({
    status: 409,
    description: 'An appointment already exists for this schedule',
  })
  create(
    @Body() dto: CreateConsultationDto | CreateExamDto | CreateFollowUpDto,
  ) {
    return this.appointmentsService.create(dto);
  }

  @Auth(UserType.ADMIN)
  @Get()
  @ApiOperation({
    summary: 'List appointments',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'createdAt:DESC',
  })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    example: 2,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: AppointmentType,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2026-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  findAll(@Query() query: AppointmentQueryDto) {
    return this.appointmentsService.findAll(query);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get(':id')
  @ApiOperation({
    summary: 'Find a appointment by id',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    type: AppointmentResponseBaseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'You can only finish your appointment',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.appointmentsService.findOne(id, currentUser);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Put(':id')
  @ApiOperation({
    summary: 'Update an appointment',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiBody({
    description: 'Update appointment data according to its type',
    examples: {
      consultation: {
        summary: 'Update consultation',
        value: {
          reason: 'Updated consultation reason',
          diagnosticHypothesis: 'Migraine',
        },
      },

      exam: {
        summary: 'Update exam',
        value: {
          examType: 'Electrocardiogram',
          result: 'Normal sinus rhythm',
        },
      },

      followUp: {
        summary: 'Update follow-up',
        value: {
          clinicalEvolution: 'Patient reports complete symptom remission',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Finished appointments cannot be edited',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only update your appointment',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.appointmentsService.update(id, dto, currentUser);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Patch(':id/finish')
  @ApiOperation({
    summary: 'Finish an appointment',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment finished successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only finish your appointment',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Appointment already finished or required data is missing',
  })
  finish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.appointmentsService.finish(id, currentUser);
  }

  //PROCEDURES

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Post(':id/procedures')
  @ApiOperation({
    summary: 'Create a procedure for an appointment',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Appointment ID',
  })
  @ApiBody({
    description:
      'Create procedures based on their type. Procedures can only be created for appointments that are still in progress.',
    examples: {
      simpleProcedure: {
        summary: 'Create simple procedure',
        value: {
          type: 'SIMPLE',
          name: 'Blood Collection',
          description: 'Routine blood collection for laboratory analysis',
          estimatedDuration: 15,
        },
      },

      specializedWithoutAuthorization: {
        summary: 'Create specialized procedure without authorization',
        value: {
          type: 'SPECIALIZED',
          name: 'Abdominal Ultrasound',
          description: 'Ultrasound examination of the abdominal region',
          requiredEquipment: ['Ultrasound Device'],
          complexityLevel: 'MEDIUM',
          requiresAuthorization: false,
        },
      },

      specializedWithAuthorization: {
        summary: 'Create specialized procedure requiring authorization',
        value: {
          type: 'SPECIALIZED',
          name: 'Cardiac MRI',
          description: 'Magnetic resonance imaging of the heart',
          requiredEquipment: ['MRI Scanner', 'Contrast Injector'],
          complexityLevel: 'HIGH',
          requiresAuthorization: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Procedure created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid procedure data or appointment is already finished',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only create procedures for your own appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  createProcedure(
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() dto: CreateSimpleProcedureDto | CreateSpecializedProcedureDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.proceduresService.create(appointmentId, dto, currentUser);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Get(':id/procedures')
  @ApiOperation({
    summary: 'List procedures associated with an appointment',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Appointment ID',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    example: 'createdAt:DESC',
    description:
      'Sort field and direction. Supported fields: createdAt, updatedAt, name',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ProcedureType,
    description: 'Filter procedures by type',
  })
  @ApiQuery({
    name: 'authorizationStatus',
    required: false,
    enum: AuthorizationStatus,
    description: 'Filter specialized procedures by authorization status',
  })
  @ApiResponse({
    status: 200,
    description: 'Procedures retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only access procedures from your own appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  findAppointmentProcedures(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: ProcedureQueryDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.proceduresService.findAppointmentProcedures(
      id,
      query,
      currentUser,
    );
  }

  //MEDICAL RECORDS

  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Post(':id/records')
  @ApiOperation({
    summary: 'Create a medical record',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Appointment ID',
  })
  @ApiBody({
    description: 'Create a medical record for a finished appointment',
    examples: {
      medicalRecord: {
        summary: 'Create medical record',
        value: {
          diagnosis: 'Type 2 diabetes mellitus',
          prescription: 'Metformin 500mg twice daily for 30 days',
          notes: 'Patient should return in 30 days for follow-up evaluation',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Medical records can only be created for finished appointments',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only create records for your own appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  @ApiResponse({
    status: 409,
    description: 'A medical record already exists for this appointment',
  })
  createMedicalRecord(
    @Param('id', ParseIntPipe)
    appointmentId: number,

    @Body()
    dto: CreateMedicalRecordDto,

    @CurrentUser()
    currentUser: JwtPayload,
  ) {
    return this.medicalRecordsService.create(appointmentId, dto, currentUser);
  }

  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get(':id/records')
  @ApiOperation({
    summary: 'Get medical record by appointment',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Appointment ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical record found successfully',
    type: MedicalRecordResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'You can only access medical records related to your appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment or medical record not found',
  })
  findAppointmentRecord(
    @Param('id', ParseIntPipe) appointmentId: number,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.medicalRecordsService.findAppointmentRecord(
      appointmentId,
      currentUser,
    );
  }

  // REPORTS MODULE
  @Auth(UserType.ADMIN, UserType.DOCTOR)
  @Post(':id/report')
  @ApiOperation({
    summary: 'Issue a report for a finished exam',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Exam appointment ID',
  })
  @ApiBody({
    type: CreateReportDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Report issued successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Appointment is not an exam, is not finished, or exam result is missing',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only issue reports for your own appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  @ApiResponse({
    status: 409,
    description: 'An active report already exists for this exam',
  })
  createReport(
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() dto: CreateReportDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.reportsService.create(appointmentId, dto, currentUser);
  }
}
