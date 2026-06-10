import { ChildEntity, Column } from 'typeorm';
import { ProcedureType } from '../enums/procedure-type.enum';
import { ProcedureEntity } from './procedure.entity';
import { ComplexityLevel } from '../enums/procedure-complexity-level.enum';
import { AuthorizationStatus } from '../enums/procedure-authorization-status.enum';

@ChildEntity(ProcedureType.SPECIALIZED)
export class SpecializedProcedureEntity extends ProcedureEntity {
  @Column('simple-json', {
    nullable: true,
  })
  requiredEquipment!: string[];

  @Column({
    type: 'varchar',
    enum: ComplexityLevel,
  })
  complexityLevel!: ComplexityLevel;

  @Column({
    default: false,
  })
  requiresAuthorization!: boolean;

  @Column({
    type: 'varchar',
    enum: AuthorizationStatus,
    nullable: true,
  })
  authorizationStatus?: AuthorizationStatus;

  @Column({
    nullable: true,
  })
  authorizedAt?: Date;

  @Column({
    nullable: true,
  })
  authorizedBy!: number;
}
