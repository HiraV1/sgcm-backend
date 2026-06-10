import { IsEnum } from 'class-validator';
import { AuthorizationStatus } from '../enums/procedure-authorization-status.enum';

export class ProcedureAuthorizationDto {
  @IsEnum(AuthorizationStatus)
  status!: AuthorizationStatus;
}
