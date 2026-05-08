import { AdminEntity } from '../entities/admin.entity';
import { DoctorEntity } from '../entities/doctor.entity';
import { PatientEntity } from '../entities/patient.entity';
import { UserEntity } from '../entities/user.entity';

import { AdminResponseDto } from '../dto/response/admin-response.dto';
import { DoctorResponseDto } from '../dto/response/doctor-response.dto';
import { PatientResponseDto } from '../dto/response/patient-response.dto';
import { UserResponseDto } from '../dto/response/user-response.dto';

export function mapUserResponse(user: UserEntity): UserResponseDto {
  if (user instanceof AdminEntity) {
    return new AdminResponseDto(user);
  }

  if (user instanceof DoctorEntity) {
    return new DoctorResponseDto(user);
  }

  if (user instanceof PatientEntity) {
    return new PatientResponseDto(user);
  }

  return new UserResponseDto(user);
}
