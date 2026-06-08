import { AppointmentResponseBaseDto } from '../dto/response/appointment-response-base.dto';
import { ConsultationResponseDto } from '../dto/response/consultation-response.dto';
import { ExamResponseDto } from '../dto/response/exam-response.dto';
import { FollowUpResponseDto } from '../dto/response/follow-up-response.dto';
import { AppointmentEntity } from '../entities/appointment.entity';
import { ConsultationEntity } from '../entities/consultation.entity';
import { ExamEntity } from '../entities/exam.entity';
import { FollowUpEntity } from '../entities/follow-up.entity';

export function mapAppointmentResponse(
  appointment: AppointmentEntity,
): AppointmentResponseBaseDto {
  if (appointment instanceof ConsultationEntity) {
    return new ConsultationResponseDto(appointment);
  }

  if (appointment instanceof ExamEntity) {
    return new ExamResponseDto(appointment);
  }

  return new FollowUpResponseDto(appointment as FollowUpEntity);
}
