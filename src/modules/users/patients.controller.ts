import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PatientResponseDto } from './dto/response/patient-response.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List patients with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sort', required: false, example: 'name:asc' })
  @ApiQuery({ name: 'search', required: false, example: 'john' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAllPatients(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find patient by id' })
  @ApiResponse({
    status: 200,
    type: PatientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOnePatient(id);
  }

  @Get(':id/schedules')
  @ApiOperation({ summary: 'List patient schedules' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findPatientSchedules(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.usersService.findPatientSchedules(id, paginationQuery);
  }
}
