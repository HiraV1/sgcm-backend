import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { UserEntity } from './entities/user.entity';
import { AdminEntity } from './entities/admin.entity';
import { DoctorEntity } from './entities/doctor.entity';
import { PatientEntity } from './entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AdminEntity,
      DoctorEntity,
      PatientEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
