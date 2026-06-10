import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RevokeReportDto {
  @ApiProperty({
    example: 'Incorrect result identified after further analysis.',
  })
  @IsString()
  @IsNotEmpty()
  revokedReason!: string;
}
