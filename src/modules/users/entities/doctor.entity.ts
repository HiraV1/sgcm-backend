import { ChildEntity, Column, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from './user.entity';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { UserType } from '../enums/user-type.enum';

@ChildEntity(UserType.DOCTOR)
export class DoctorEntity extends UserEntity {
  @Column({ unique: true })
  crm!: string;

  // 👇 Adiciona este bloco de código 👇
  @ManyToMany(() => Specialty, (specialty) => specialty.doctors)
  @JoinTable({
    name: 'doctor_specialties',
    joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'specialty_id', referencedColumnName: 'id' },
  })
  specialties!: Specialty[];
}
