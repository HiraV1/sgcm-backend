import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
  ValidateIf,
  Length,
} from 'class-validator';
import { UserType } from '../enums/user-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Higor',
    description: 'User full name',
  })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'higor@email.com',
    description: 'Unique user email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    minLength: 6,
    description: 'User password',
  })
  @MinLength(6)
  password!: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.PATIENT,
  })
  @IsEnum(UserType)
  type!: UserType;

  @ApiPropertyOptional({
    example: 10,
    description: 'Required for ADMIN users',
  })
  @IsOptional()
  accessLevel?: number;

  @ApiPropertyOptional({
    example: 'CRM12345',
    description: 'Required for DOCTOR users',
  })
  @ValidateIf((o: CreateUserDto) => o.type === UserType.DOCTOR)
  @IsNotEmpty()
  crm?: string;

  @ApiPropertyOptional({
    example: '99999999999',
    description: 'Required for PATIENT users',
  })
  @ValidateIf((o: CreateUserDto) => o.type === UserType.PATIENT)
  @IsNotEmpty()
  @Length(11, 11)
  cpf?: string;

  @ApiPropertyOptional({
    example: '2000-05-10',
    description: 'User birth date. Required for PATIENT users',
  })
  @IsOptional()
  birthDate?: Date;
}
