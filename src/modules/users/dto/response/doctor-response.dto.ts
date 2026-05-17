import { DoctorEntity } from '../../entities/doctor.entity';
import { UserResponseDto } from './user-response.dto';

export class DoctorResponseDto extends UserResponseDto {
  crm: string;

  constructor(doctor: DoctorEntity) {
    super(doctor);
    this.crm = doctor.crm;
  }
}
