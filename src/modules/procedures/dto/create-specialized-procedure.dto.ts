import { IsArray, IsBoolean, IsEnum, IsString } from 'class-validator';
import { ComplexityLevel } from '../enums/procedure-complexity-level.enum';
import { CreateProcedureDto } from './create-procedure.dto';

export class CreateSpecializedProcedureDto extends CreateProcedureDto {
  @IsArray()
  @IsString({ each: true })
  requiredEquipment!: string[];

  @IsEnum(ComplexityLevel)
  complexityLevel!: ComplexityLevel;

  @IsBoolean()
  requiresAuthorization!: boolean;
}
