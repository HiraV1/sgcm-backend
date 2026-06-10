import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { UserType } from '../users/enums/user-type.enum';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminReportQueryDto } from './dto/query/admin-report-query.dto';
import { AppointmentReportResponseDto } from './dto/response/appointment-report-response.dto';
import { ScheduleReportResponseDto } from './dto/response/schedule-resport-response.dto';
import { ProcedureReportResponseDto } from './dto/response/procedure-report-response.dto';
import { DoctorOccupationReportResponseDto } from './dto/response/doctor-occupation-report-response.dto';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Auth(UserType.ADMIN)
  @Get('schedules')
  @ApiOperation({
    summary: 'Get schedules administrative report',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2025-09-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-09-30',
  })
  @ApiOkResponse({
    description: 'Schedules report generated successfully',
    type: ScheduleReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied',
  })
  getSchedulesReport(@Query() query: AdminReportQueryDto) {
    return this.adminReportsService.getSchedulesReport(query);
  }

  @Auth(UserType.ADMIN)
  @Get('appointments')
  @ApiOperation({
    summary: 'Get appointments administrative report',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2025-09-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-09-30',
  })
  @ApiQuery({
    name: 'doctorId',
    required: false,
    example: 1,
  })
  @ApiOkResponse({
    description: 'Appointments report generated successfully',
    type: AppointmentReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied',
  })
  getAppointmentsReport(
    @Query() query: AdminReportQueryDto,
  ): Promise<AppointmentReportResponseDto> {
    return this.adminReportsService.getAppointmentsReport(query);
  }

  @Auth(UserType.ADMIN)
  @Get('procedures')
  @ApiOperation({
    summary: 'Get procedures administrative report',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2025-09-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-09-30',
  })
  @ApiOkResponse({
    description: 'Procedures report generated successfully',
    type: ProcedureReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied',
  })
  getProceduresReport(
    @Query() query: AdminReportQueryDto,
  ): Promise<ProcedureReportResponseDto> {
    return this.adminReportsService.getProceduresReport(query);
  }

  @Auth(UserType.ADMIN)
  @Get('doctors/:id/occupation')
  @ApiOperation({
    summary: 'Get doctor occupation report',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    example: '2025-09-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    example: '2026-09-30',
  })
  @ApiOkResponse({
    description: 'Doctor occupation report generated successfully',
    type: DoctorOccupationReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found',
  })
  getDoctorOccupationReport(
    @Param('id', ParseIntPipe) doctorId: number,
    @Query() query: AdminReportQueryDto,
  ): Promise<DoctorOccupationReportResponseDto> {
    return this.adminReportsService.getDoctorOccupationReport(doctorId, query);
  }
}
