import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../entities/user.entity';
import { UserType } from '../../enums/user-type.enum';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Higor' })
  name: string;

  @ApiProperty({ example: 'higor@email.com' })
  email: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.PATIENT,
  })
  type: UserType;

  @ApiProperty({ example: true })
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
