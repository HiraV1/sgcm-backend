import { AuthorizationStatus } from 'src/modules/procedures/enums/procedure-authorization-status.enum';
import { ComplexityLevel } from 'src/modules/procedures/enums/procedure-complexity-level.enum';
import { ProcedureType } from 'src/modules/procedures/enums/procedure-type.enum';

export class ProcedureReportResponseDto {
  total!: number;

  byType!: {
    SIMPLE: number;
    SPECIALIZED: number;
  };

  byAuthorizationStatus!: {
    PENDING: number;
    AUTHORIZED: number;
    DENIED: number;
  };

  byComplexityLevel!: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };

  constructor(
    total: number,
    byType: Record<ProcedureType, number>,
    byAuthorizationStatus: Record<AuthorizationStatus, number>,
    byComplexityLevel: Record<ComplexityLevel, number>,
  ) {
    this.total = total;

    this.byType = {
      SIMPLE: byType.SIMPLE ?? 0,
      SPECIALIZED: byType.SPECIALIZED ?? 0,
    };

    this.byAuthorizationStatus = {
      PENDING: byAuthorizationStatus.PENDING ?? 0,
      AUTHORIZED: byAuthorizationStatus.AUTHORIZED ?? 0,
      DENIED: byAuthorizationStatus.DENIED ?? 0,
    };

    this.byComplexityLevel = {
      LOW: byComplexityLevel.LOW ?? 0,
      MEDIUM: byComplexityLevel.MEDIUM ?? 0,
      HIGH: byComplexityLevel.HIGH ?? 0,
    };
  }
}
