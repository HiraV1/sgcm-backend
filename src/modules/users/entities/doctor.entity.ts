import { ChildEntity, Column } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserType } from '../enums/user-type.enum';

@ChildEntity(UserType.DOCTOR)
export class DoctorEntity extends UserEntity {
  @Column()
  crm!: string;
}
