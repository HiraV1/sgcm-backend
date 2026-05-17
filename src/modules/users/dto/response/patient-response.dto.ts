import { PatientEntity } from '../../entities/patient.entity';
import { UserResponseDto } from './user-response.dto';

export class PatientResponseDto extends UserResponseDto {
  cpf: string;
  birthDate: Date;

  constructor(patient: PatientEntity) {
    super(patient);
    this.cpf = patient.cpf;
    this.birthDate = patient.birthDate;
  }
}
