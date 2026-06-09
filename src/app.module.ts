import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './modules/users/users.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { SchedulesModule } from './modules/schedules/schedules.module';

import { AuthModule } from './modules/auth/auth.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';

import * as Joi from 'joi';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ProceduresModule } from './modules/procedures/procedures.module';

@Module({
  imports: [
    AuthModule,
    /* Responsável por carregar o módulo de configuração e centralizar o gerencimento das variáveis de ambiente.
    Carregando os dados do arquivo .env evitando alguns valores hand-coded, além disso foi utilizada a biblioteca
    Joi pra validar as váriaveis de embiente (dados dentro da nossa .env) durante a inicialização da aplicação */
    ConfigModule.forRoot({
      isGlobal: true,

      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DATABASE_PATH: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
      }),
    }),
    /* Mudei o módulo do TypeOrm de forRoot para forRootAsync permitindo o carregamento dinâmico de algumas
    configurações com o ConfigService como o path do banco de dados definido no .env, dispensando a necessidade
    de alterações feitas a mão */
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE_PATH'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    UsersModule,
    SpecialtiesModule,
    SchedulesModule,
    AppointmentsModule,
    ProceduresModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
