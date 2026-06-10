import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* Responsavel pela validação automática dos dados que chegam para as DTOs.
  Antes de enviar para o controller/service
  Whitelist = true vai remover os campos que não estão definidos na DTO, e o
  forbidNonWhitelisted = true vai lançar um erro se algum campo não whitelisted for enviado
  transform = true vai transformar os dados para o tipo correto JSON {"page" : "1"} vira TypeScript{ page: number }*/
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /* Controla o que sai da API por exemplo o @Exclude() no user.entity.ts,
  então quando o JSON de resposta for enviado ele vai excluir aquele campo na resposta */
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  /* Responsavel por capturar as exceções não tratadas e formatar a resposta de erro
  de forma consistente, usando o HttpExceptionFilter que criamos */
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('SGCM API')
    .setDescription('Sistema de Gestão de Clínica Médica')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
