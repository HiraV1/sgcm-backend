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

@ApiBearerAuth('JWT-auth')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

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
    console.log(dto);
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
}
