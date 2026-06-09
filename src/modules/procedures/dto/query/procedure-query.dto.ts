import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ProcedureType } from '../../enums/procedure-type.enum';
import { AuthorizationStatus } from '../../enums/procedure-authorization-status.enum';

export class ProcedureQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ProcedureType)
  type?: ProcedureType;

  @IsOptional()
  @IsEnum(AuthorizationStatus)
  authorizationStatus?: AuthorizationStatus;
}
