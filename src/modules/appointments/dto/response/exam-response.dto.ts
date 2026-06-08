import { ApiProperty } from '@nestjs/swagger';
import { ExamEntity } from '../../entities/exam.entity';
import { AppointmentResponseBaseDto } from './appointment-response-base.dto';

export class ExamResponseDto extends AppointmentResponseBaseDto {
  @ApiProperty({
    example: 'Electrocardiogram',
  })
  examType!: string;

  @ApiProperty({
    example: 'Normal sinus rhythm',
    required: false,
    nullable: true,
  })
  result?: string;

  constructor(appointment: ExamEntity) {
    super(appointment);

    this.examType = appointment.examType;
    this.result = appointment.result;
  }
}
