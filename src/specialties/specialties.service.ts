import { Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Specialty } from './entities/specialty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SpecialtiesService {
  // Injetamos o "Repositório", que é a ferramenta do TypeORM que conversa com o SQLite
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
  ) {}

  // Função para CRIAR uma nova especialidade
  async create(createSpecialtyDto: CreateSpecialtyDto) {
    const specialty = this.specialtyRepository.create(createSpecialtyDto);
    return await this.specialtyRepository.save(specialty);
  }

  // Função para LISTAR todas as especialidades
  async findAll() {
    return await this.specialtyRepository.find();
  }

  // As outras funções (buscar uma só, atualizar, deletar) deixaremos prontas para depois!
  findOne(id: number) {
    return `This action returns a #${id} specialty`;
  }

  update(id: number, updateSpecialtyDto: UpdateSpecialtyDto) {
    return `This action updates a #${id} specialty`;
  }

  remove(id: number) {
    return `This action removes a #${id} specialty`;
  }
}