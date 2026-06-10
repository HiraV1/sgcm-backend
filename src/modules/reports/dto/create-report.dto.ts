import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    example:
      'Electrocardiogram report indicating normal sinus rhythm with no abnormalities detected.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}
