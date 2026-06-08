import { ApiProperty } from '@nestjs/swagger';
import { FollowUpEntity } from '../../entities/follow-up.entity';
import { AppointmentResponseBaseDto } from './appointment-response-base.dto';

export class FollowUpResponseDto extends AppointmentResponseBaseDto {
  @ApiProperty({
    example: 'Patient reports significant improvement after treatment',
  })
  clinicalEvolution!: string;

  @ApiProperty({
    example: 10,
  })
  originAppointmentId!: number;

  constructor(appointment: FollowUpEntity) {
    super(appointment);

    this.clinicalEvolution = appointment.clinicalEvolution;

    this.originAppointmentId = appointment.originAppointmentId;
  }
}
