import { IsString } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsultationDto extends CreateAppointmentDto {
  @ApiProperty({
    example: 'Persistent headache for two weeks',
  })
  @IsString()
  reason!: string;
}
