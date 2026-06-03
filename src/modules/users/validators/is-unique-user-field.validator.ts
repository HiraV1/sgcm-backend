import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { PatientEntity } from '../entities/patient.entity';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueUserFieldConstraint
  implements ValidatorConstraintInterface
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,

    @InjectRepository(PatientEntity)
    private readonly patientsRepository: Repository<PatientEntity>,
  ) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    const [field] = args.constraints;

    if (!value) {
      return true;
    }

    if (field === 'email') {
      const user = await this.usersRepository.findOne({
        where: { email: value },
      });

      return !user;
    }

    if (field === 'cpf') {
      const patient = await this.patientsRepository.findOne({
        where: { cpf: value },
      });

      return !patient;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const [field] = args.constraints;

    /*Verifica se o email ou cpf já foi utilizado */
    if (field === 'email') {
      return 'The email address is already registered in the system.';
    }

    if (field === 'cpf') {
      return 'The CPF (Brazilian taxpayer ID) is already registered in the system.';
    }

    return 'Value already registered in the system.';
  }
}

export function IsUniqueUserField(
  field: 'email' | 'cpf',
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [field],
      validator: IsUniqueUserFieldConstraint,
    });
  };
}