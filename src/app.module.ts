import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialtiesModule } from './specialties/specialties.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities:   [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    SpecialtiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
