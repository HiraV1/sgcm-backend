import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserType } from '../users/enums/user-type.enum';

@ApiTags('Specialties')
@ApiBearerAuth('JWT-auth')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}
 
  @Auth(UserType.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Cadastrar uma nova especialidade médica' })
  @ApiResponse({ status: 201, description: 'Especialidade criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou nome já existente.' })
  @ApiResponse({ status: 401, description: 'Token ausente, expirado ou inválido.' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão para esta operação.' })
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtiesService.create(createSpecialtyDto);
  }
 
  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get()
  @ApiOperation({ summary: 'Listar especialidades com paginação' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'sort', required: false, example: 'name:asc' })
  @ApiQuery({ name: 'search', required: false, example: 'cardiology' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Token ausente, expirado ou inválido.' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.specialtiesService.findAll(paginationQuery);
  }
 
  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar especialidade por ID' })
  @ApiParam({ name: 'id', description: 'Specialty ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Especialidade encontrada.' })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada.' })
  @ApiResponse({ status: 401, description: 'Token ausente, expirado ou inválido.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.specialtiesService.findOne(id);
  }
 
  @Auth(UserType.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar especialidade' })
  @ApiParam({ name: 'id', description: 'Specialty ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Especialidade atualizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada.' })
  @ApiResponse({ status: 401, description: 'Token ausente, expirado ou inválido.' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão para esta operação.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(id, updateSpecialtyDto);
  }
 
  @Auth(UserType.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover especialidade' })
  @ApiParam({ name: 'id', description: 'Specialty ID', example: 1 })
  @ApiResponse({ status: 204, description: 'Especialidade removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada.' })
  @ApiResponse({ status: 409, description: 'Especialidade possui médicos associados.' })
  @ApiResponse({ status: 401, description: 'Token ausente, expirado ou inválido.' })
  @ApiResponse({ status: 403, description: 'Perfil sem permissão para esta operação.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.specialtiesService.remove(id);
  }
 
  @Auth(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Get(':id/doctors')
  @ApiOperation({ summary: 'Listar médicos associados a uma especialidade' })
  @ApiParam({ name: 'id', description: 'Specialty ID', example: 1 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: 'Médicos retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada.' })
  @ApiResponse({ status: 401, description: 'Token ausente, expirado ou inválido.' })
  findDoctorsBySpecialty(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.specialtiesService.findDoctorsBySpecialty(id, paginationQuery);
  }
}
