import { ApiProperty } from '@nestjs/swagger';
import { ConsultationEntity } from '../../entities/consultation.entity';
import { AppointmentResponseBaseDto } from './appointment-response-base.dto';

export class ConsultationResponseDto extends AppointmentResponseBaseDto {
  @ApiProperty({
    example: 'Persistent headache for two weeks',
  })
  reason!: string;

  @ApiProperty({
    example: 'Migraine',
    required: false,
    nullable: true,
  })
  diagnosticHypothesis?: string;

  constructor(appointment: ConsultationEntity) {
    super(appointment);

    this.reason = appointment.reason;
    this.diagnosticHypothesis = appointment.diagnosticHypothesis;
  }
}
