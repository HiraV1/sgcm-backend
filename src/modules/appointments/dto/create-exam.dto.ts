import { IsString } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExamDto extends CreateAppointmentDto {
  @ApiProperty({
    example: 'Electrocardiogram',
  })
  @IsString()
  examType!: string;
}
