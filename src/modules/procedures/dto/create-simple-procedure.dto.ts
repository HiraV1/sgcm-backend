import { IsInt, Min } from 'class-validator';
import { CreateProcedureDto } from './create-procedure.dto';

export class CreateSimpleProcedureDto extends CreateProcedureDto {
  @IsInt()
  @Min(1)
  estimatedDuration!: number;
}
