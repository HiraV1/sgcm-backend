import { JwtPayload } from './../auth/interfaces/jwt-payload.interface';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PatientResponseDto } from './dto/response/patient-response.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserType } from './enums/user-type.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MedicalRecordsService } from '../medical-records/medical-records.service';
import { ReportsService } from '../reports/reports.service';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly reportsService: ReportsService,
  ) {}

  @Auth(UserType.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List patients with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sort', required: false, example: 'name:asc' })
  @ApiQuery({ name: 'search', required: false, example: 'john' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAllPatients(paginationQuery);
  }

  @Auth(UserType.ADMIN, UserType.PATIENT)
  @Get(':id')
  @ApiOperation({ summary: 'Find patient by id' })
  @ApiResponse({
    status: 200,
    type: PatientResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'You can only access your data',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.findOnePatient(id, currentUser);
  }

  @Auth(UserType.ADMIN, UserType.PATIENT)
  @Get(':id/schedules')
  @ApiOperation({ summary: 'List patient schedules' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findPatientSchedules(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.findPatientSchedules(
      id,
      paginationQuery,
      currentUser,
    );
  }

  @Auth(UserType.ADMIN, UserType.PATIENT)
  @Get(':id/appointments')
  @ApiOperation({
    summary: 'List patient appointments',
  })
  @ApiParam({
    name: 'id',
    example: 2,
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
  @ApiResponse({
    status: 200,
    description: 'Patient appointments retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only access your appointments',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  findPatientAppointments(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.usersService.findPatientAppointments(
      id,
      paginationQuery,
      currentUser,
    );
  }

  // MEDICAL RECORDS

  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get(':id/records')
  @ApiOperation({
    summary: 'List patient medical records',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Patient ID',
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
  @ApiResponse({
    status: 200,
    description: 'Medical records retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'You can only access your own medical records',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  findPatientRecords(
    @Param('id', ParseIntPipe) patientId: number,
    @Query() query: PaginationQueryDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.medicalRecordsService.findPatientRecords(
      patientId,
      query,
      currentUser,
    );
  }

  // REPORTS

  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get(':id/reports')
  @ApiOperation({
    summary: 'List reports from a patient',
  })
  @ApiParam({
    name: 'id',
    example: 1,
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
  @ApiResponse({
    status: 200,
    description: 'Reports retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description:
      'You can only access your reports or reports from your patients',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  findPatientReports(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: PaginationQueryDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.reportsService.findPatientReports(id, query, currentUser);
  }
}
