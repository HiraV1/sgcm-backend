import { ProcedureResponseBaseDto } from '../dto/response/procedure-response-base.dto';
import { SimpleProcedureResponseDto } from '../dto/response/simple-procedure-response.dto';
import { SpecializedProcedureResponseDto } from '../dto/response/specialized-procedure-response.dto';
import { ProcedureEntity } from '../entities/procedure.entity';
import { SimpleProcedureEntity } from '../entities/simple-procedure.entity';
import { SpecializedProcedureEntity } from '../entities/specialized-procedure.entity';
import { ProcedureType } from '../enums/procedure-type.enum';

export function mapProcedureResponse(
  procedure: ProcedureEntity,
): ProcedureResponseBaseDto {
  switch (procedure.type) {
    case ProcedureType.SIMPLE:
      return new SimpleProcedureResponseDto(procedure as SimpleProcedureEntity);

    case ProcedureType.SPECIALIZED:
      return new SpecializedProcedureResponseDto(
        procedure as SpecializedProcedureEntity,
      );

    default:
      throw new Error(`Unsupported procedure type`);
  }
}
