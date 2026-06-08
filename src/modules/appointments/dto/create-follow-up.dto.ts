import { IsInt, IsPositive, IsString } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFollowUpDto extends CreateAppointmentDto {
  @ApiProperty({
    example: 'Patient reports significant improvement after treatment',
  })
  @IsString()
  clinicalEvolution!: string;

  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @IsPositive()
  originAppointmentId!: number;
}
