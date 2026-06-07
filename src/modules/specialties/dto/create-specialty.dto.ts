import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpecialtyDto {
  
  @ApiProperty({ example: 'Cardiologia', description: 'Nome da especialidade médica' })
  @IsString({ message: 'O nome deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome da especialidade não pode ficar em branco' })
  name!: string;

  @ApiProperty({ example: 'Especialidade que cuida do coração', required: false })
  @IsString({ message: 'A descrição deve ser um texto válido' })
  @IsOptional() 
  description?: string;

}