import { IsEnum, IsString } from 'class-validator';
import { ProcedureType } from '../enums/procedure-type.enum';

export class CreateProcedureDto {
  @IsEnum(ProcedureType)
  type!: ProcedureType;

  @IsString()
  name!: string;

  @IsString()
  description!: string;
}
