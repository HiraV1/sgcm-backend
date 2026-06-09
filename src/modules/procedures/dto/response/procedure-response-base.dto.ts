import { ProcedureEntity } from '../../entities/procedure.entity';
import { ProcedureType } from '../../enums/procedure-type.enum';

export abstract class ProcedureResponseBaseDto {
  id!: number;

  name!: string;

  description!: string;

  type!: ProcedureType;

  appointmentId!: number;

  createdAt!: Date;

  updatedAt!: Date;

  constructor(procedure: ProcedureEntity) {
    this.id = procedure.id;

    this.name = procedure.name;
    this.description = procedure.description;

    this.type = procedure.type;

    this.appointmentId = procedure.appointment.id;

    this.createdAt = procedure.createdAt;
    this.updatedAt = procedure.updatedAt;
  }
}
