import { SpecializedProcedureEntity } from '../../entities/specialized-procedure.entity';
import { AuthorizationStatus } from '../../enums/procedure-authorization-status.enum';
import { ComplexityLevel } from '../../enums/procedure-complexity-level.enum';
import { ProcedureResponseBaseDto } from './procedure-response-base.dto';

export class SpecializedProcedureResponseDto extends ProcedureResponseBaseDto {
  requiredEquipment!: string[];

  complexityLevel!: ComplexityLevel;

  requiresAuthorization!: boolean;

  authorizationStatus?: AuthorizationStatus;

  authorizedAt?: Date;

  authorizedBy?: number;

  constructor(procedure: SpecializedProcedureEntity) {
    super(procedure);

    this.requiredEquipment = procedure.requiredEquipment;
    this.complexityLevel = procedure.complexityLevel;
    this.requiresAuthorization = procedure.requiresAuthorization;
    this.authorizationStatus = procedure.authorizationStatus;
    this.authorizedAt = procedure.authorizedAt;
    this.authorizedBy = procedure.authorizedBy;
  }
}
