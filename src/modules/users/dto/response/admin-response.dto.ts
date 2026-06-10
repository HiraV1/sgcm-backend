import { AdminEntity } from '../../entities/admin.entity';
import { UserResponseDto } from './user-response.dto';

export class AdminResponseDto extends UserResponseDto {
  accessLevel: number;

  constructor(admin: AdminEntity) {
    super(admin);
    this.accessLevel = admin.accessLevel;
  }
}
