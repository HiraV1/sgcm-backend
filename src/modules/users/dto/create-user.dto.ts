/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
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
  accesLevel?: string;

  @IsOptional()
  crm?: string;

  @IsOptional()
  cpf?: string;

  @IsOptional()
  birthDate?: Date;
}
