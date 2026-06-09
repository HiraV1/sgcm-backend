import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ComplexityLevel } from '../enums/procedure-complexity-level.enum';

export class UpdateProcedureDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredEquipment?: string[];

  @IsOptional()
  @IsEnum(ComplexityLevel)
  complexityLevel?: ComplexityLevel;

  @IsOptional()
  @IsBoolean()
  requiresAuthorization?: boolean;
}
