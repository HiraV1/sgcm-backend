import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { DoctorResponseDto } from './dto/response/doctor-response.dto';
import { DoctorQueryDto } from './dto/query/find-doctors-query.dto';
import { SpecialtyResponseDto } from '../specialties/dto/response/specialty-response.dto';
import { AddSpecialtyDto } from './dto/add-specialty.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List doctors with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sort', required: false, example: 'name:asc' })
  @ApiQuery({ name: 'search', required: false, example: 'house' })
  @ApiQuery({ name: 'specialtyId', required: false, example: 1 })
  findAll(@Query() query: DoctorQueryDto) {
    return this.usersService.findAllDoctors(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find doctor by id' })
  @ApiResponse({
    status: 200,
    type: DoctorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneDoctor(id);
  }

  @Get(':id/schedules')
  @ApiOperation({ summary: 'List doctor schedules' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  findDoctorSchedules(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.usersService.findDoctorSchedules(id, paginationQuery);
  }

  @Get(':id/specialties')
  @ApiOperation({
    summary: 'List doctor specialties',
    description: 'Returns all specialties associated with a doctor.',
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Specialties retrieved successfully.',
    type: SpecialtyResponseDto,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor not found.',
  })
  findDoctorSpecialties(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findDoctorSpecialties(id);
  }

  @Post(':id/specialties')
  @ApiOperation({ summary: 'Associate specialty to doctor' })
  @ApiParam({ 
    name: 'id', 
    description: 'Doctor ID', 
    example: 1 
  })
  @ApiResponse({
    status: 200, 
    description: 'Specialty associated successfully.',
    type: DoctorResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Doctor or specialty not found.' 
  })
  @ApiResponse({ 
    status: 409,
    description: 'Doctor already has this specialty.' 
  })
  addSpecialty(
  @Param('id', ParseIntPipe) id: number,
  @Body() addSpecialtyDto: AddSpecialtyDto,
  ) {
    return this.usersService.addSpecialty(id, addSpecialtyDto.specialtyId);
  }

  @Delete(':id/specialties/:specialtyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove specialty from doctor',
    description: 'Removes the association between a doctor and a specialty.',
  })
  @ApiParam({
    name: 'id',
    description: 'Doctor ID',
    example: 1,
  })
  @ApiParam({
    name: 'specialtyId',
    description: 'Specialty ID',
    example: 2,
  })
  @ApiResponse({
    status: 204,
    description: 'Specialty removed successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Doctor, specialty, or association not found.',
  })
  removeSpecialty(
    @Param('id', ParseIntPipe) id: number,
    @Param('specialtyId', ParseIntPipe) specialtyId: number,
  ) {
    return this.usersService.removeSpecialty(id, specialtyId);
  }
}
