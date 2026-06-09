import { SimpleProcedureEntity } from '../../entities/simple-procedure.entity';
import { ProcedureResponseBaseDto } from './procedure-response-base.dto';

export class SimpleProcedureResponseDto extends ProcedureResponseBaseDto {
  estimatedDuration!: number;

  constructor(procedure: SimpleProcedureEntity) {
    super(procedure);

    this.estimatedDuration = procedure.estimatedDuration;
  }
}
