import { ChildEntity, Column } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserType } from '../enums/user-type.enum';

@ChildEntity(UserType.ADMIN)
export class AdminEntity extends UserEntity {
  @Column()
  acessLevel!: number;
}
