import { ChildEntity, Column } from 'typeorm';
import { ProcedureType } from '../enums/procedure-type.enum';
import { ProcedureEntity } from './procedure.entity';

@ChildEntity(ProcedureType.SIMPLE)
export class SimpleProcedureEntity extends ProcedureEntity {
  @Column()
  estimatedDuration!: number;
}
