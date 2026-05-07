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

export class CreateUserDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsEnum(UserType)
  type!: UserType;

  @IsOptional()
  accessLevel?: number;

  @ValidateIf((o: CreateUserDto) => o.type === UserType.DOCTOR)
  @IsNotEmpty()
  crm?: string;

  @ValidateIf((o: CreateUserDto) => o.type === UserType.PATIENT)
  @IsNotEmpty()
  @Length(11, 11)
  cpf?: string;

  @IsOptional()
  birthDate?: Date;
}
