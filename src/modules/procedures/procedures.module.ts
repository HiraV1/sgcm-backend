import { Module } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { ProceduresController } from './procedures.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcedureEntity } from './entities/procedure.entity';
import { SimpleProcedureEntity } from './entities/simple-procedure.entity';
import { SpecializedProcedureEntity } from './entities/specialized-procedure.entity';
import { AppointmentEntity } from '../appointments/entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcedureEntity,
      SimpleProcedureEntity,
      SpecializedProcedureEntity,
      AppointmentEntity,
    ]),
  ],
  controllers: [ProceduresController],
  providers: [ProceduresService],
  exports: [ProceduresService],
})
export class ProceduresModule {}
