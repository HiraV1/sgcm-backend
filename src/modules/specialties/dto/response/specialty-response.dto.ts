import { ApiProperty } from '@nestjs/swagger';

import { Specialty } from '../../entities/specialty.entity';

export class SpecialtyResponseDto {
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: 'Cardiology',
  })
  name: string;

  @ApiProperty({
    example: 'Medical specialty focused on the heart.',
  })
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(specialty: Specialty) {
    this.id = specialty.id;
    this.name = specialty.name;
    this.description = specialty.description;
    this.createdAt = specialty.createdAt;
    this.updatedAt = specialty.updatedAt;
  }
}
