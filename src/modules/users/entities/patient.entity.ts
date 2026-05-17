import { ChildEntity, Column } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserType } from '../enums/user-type.enum';

@ChildEntity(UserType.PATIENT)
export class PatientEntity extends UserEntity {
  @Column({ unique: true })
  cpf!: string;

  @Column({ type: 'date' })
  birthDate!: Date;
}
