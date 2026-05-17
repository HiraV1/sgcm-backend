import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('specialties') // Organiza o módulo de Especialidades numa aba bonita no Swagger
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar uma nova especialidade médica' })
  @ApiResponse({ status: 21, description: 'Especialidade criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou nome já existente.' })
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtiesService.create(createSpecialtyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as especialidades cadastradas' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  findAll() {
    return this.specialtiesService.findAll();
  }

  // Deixamos as rotas de buscar por ID, atualizar e remover prontas para o futuro
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specialtiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSpecialtyDto: UpdateSpecialtyDto) {
    return this.specialtiesService.update(+id, updateSpecialtyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specialtiesService.remove(+id);
  }
}