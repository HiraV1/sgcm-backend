import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialty } from './entities/specialty.entity';
import { Repository, Not, Like } from 'typeorm';

import { SpecialtyResponseDto } from './dto/response/specialty-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class SpecialtiesService {
  // Injetamos o "Repositório", que é a ferramenta do TypeORM que conversa com o SQLite
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
  ) {}

  // Função para CRIAR uma nova especialidade
  async create(
    createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    const existingSpecialty = await this.specialtyRepository.findOne({
      where: { name: createSpecialtyDto.name },
    });

    if (existingSpecialty) {
      throw new ConflictException('Specialty with this name already exists');
    }

    const specialty = this.specialtyRepository.create(createSpecialtyDto);
    const savedSpecialty = await this.specialtyRepository.save(specialty);
    return new SpecialtyResponseDto(savedSpecialty);
  }

  // Função para LISTAR todas as especialidades
  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<SpecialtyResponseDto>> {
    const { page = 1, limit = 20, sort, search } = paginationQuery;

    const skip = (page - 1) * limit;

    let order: Record<string, 'ASC' | 'DESC'> = {
      createdAt: 'DESC',
    };

    if (sort) {
      const [field, direction] = sort.split(':');

      order = {
        [field]: direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      };
    }

    const where = search
      ? {
          name: Like(`%${search}%`),
        }
      : {};

    const [specialties, totalItems] =
      await this.specialtyRepository.findAndCount({
        where,
        order,
        skip,
        take: limit,
      });

    return {
      data: specialties.map((specialty) => new SpecialtyResponseDto(specialty)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: number): Promise<SpecialtyResponseDto> {
    const specialtyReturned = await this.specialtyRepository.findOneBy({ id });
    if (!specialtyReturned) {
      throw new NotFoundException(`Specialty not found with ID ${id}`);
    }
    return new SpecialtyResponseDto(specialtyReturned);
  }

  async update(
    id: number,
    updateSpecialtyDto: UpdateSpecialtyDto,
  ): Promise<SpecialtyResponseDto> {
    const specialty = await this.specialtyRepository.findOneBy({ id });
    if (!specialty) {
      throw new NotFoundException(`Specialty not found with ID ${id}`);
    }

    const existingSpecialty = await this.specialtyRepository.findOne({
      where: { name: updateSpecialtyDto.name, id: Not(id) },
    });

    if (existingSpecialty) {
      throw new ConflictException('Specialty with this name already exists');
    }

    Object.assign(specialty, updateSpecialtyDto);
    const updatedSpecialty = await this.specialtyRepository.save(specialty);
    return new SpecialtyResponseDto(updatedSpecialty);
  }

async remove(id: number) {
    const specialty = await this.specialtyRepository.findOne({
      where: { id },
      relations: ['doctors'], 
    });

    if (!specialty) {
      throw new NotFoundException('Especialidade não encontrada');
    }

    if (specialty.doctors && specialty.doctors.length > 0) {
      throw new BadRequestException(
        'A especialidade não pode ser apagada porque existem médicos associados a ela.',
      );
    }
    return await this.specialtyRepository.remove(specialty);
  }
}
