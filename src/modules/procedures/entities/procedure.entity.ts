import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { ProcedureType } from '../enums/procedure-type.enum';
import { AppointmentEntity } from 'src/modules/appointments/entities/appointment.entity';

@Entity('procedures')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class ProcedureEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column({
    type: 'varchar',
    enum: ProcedureType,
  })
  type!: ProcedureType;

  @ManyToOne(() => AppointmentEntity, (appointment) => appointment.procedures)
  appointment!: AppointmentEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
