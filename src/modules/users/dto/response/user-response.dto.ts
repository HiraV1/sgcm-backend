import { UserEntity } from '../../entities/user.entity';
import { UserType } from '../../enums/user-type.enum';

export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  type: UserType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.type = user.type;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
