import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('specialties') // Nome da tabela no banco de dados
export class Specialty {

    @PrimaryGeneratedColumn('uuid') // Gera um ID único e aleatório automaticamente
    id!: string;

    @Column({ unique: true }) // O nome da especialidade (ex: Cardiologia), não pode repetir
    name!: string;

    @Column({ type: 'text', nullable: true }) // Uma descrição opcional
    description!: string;

}