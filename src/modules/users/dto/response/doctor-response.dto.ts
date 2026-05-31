import { SpecialtyResponseDto } from 'src/modules/specialties/dto/response/specialty-response.dto';
import { DoctorEntity } from '../../entities/doctor.entity';
import { UserResponseDto } from './user-response.dto';

export class DoctorResponseDto extends UserResponseDto {
  crm: string;

  specialties: SpecialtyResponseDto[];

  constructor(doctor: DoctorEntity) {
    super(doctor);
    this.crm = doctor.crm;

    this.specialties =
      doctor.specialties?.map(
        (specialty) => new SpecialtyResponseDto(specialty),
      ) ?? [];
  }
}
