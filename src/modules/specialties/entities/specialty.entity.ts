import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('specialties') // Nome da tabela no banco de dados
export class Specialty {
  @PrimaryGeneratedColumn() // Gera um ID único e aleatório automaticamente
  id!: number;

  @Column() // O nome da especialidade (ex: Cardiologia), não pode repetir
  name!: string;

  @Column({ type: 'text', nullable: true }) // Uma descrição opcional
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
