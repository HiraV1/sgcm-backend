import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AddSpecialtyDto {
  @ApiProperty({ example: 2, description: 'Specialty ID to associate' })
  @IsInt()
  @IsPositive()
  specialtyId!: number;
}