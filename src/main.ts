import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
 
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
 
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
 
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
 
  /* ClassSerializerInterceptor deve vir ANTES do TransformInterceptor.
  A ordem de execução no pós-handler é invertida (pilha), então:
  - ClassSerializerInterceptor serializa os dados (aplica @Exclude/@Expose)
  - TransformInterceptor envolve os dados já serializados no envelope { data, meta }
  Garantindo que campos sensíveis como password nunca apareçam na resposta */
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );
 
  /* Responsavel por capturar as exceções não tratadas e formatar a resposta de erro
  de forma consistente, usando o HttpExceptionFilter que criamos */
  app.useGlobalFilters(new HttpExceptionFilter());
 
  const config = new DocumentBuilder()
    .setTitle('SGCM API')
    .setDescription(
      `
## Sistema de Gestão de Clínica Médica — Etapa 2
 
### Como usar a API
 
1. Faça login em **POST /auth/login** com suas credenciais
2. Copie o \`accessToken\` retornado na resposta
3. Clique em **Authorize** no topo desta página e insira o token
4. Todos os endpoints protegidos passarão a funcionar automaticamente
 
### Endpoints públicos (não requerem autenticação)
- **POST /auth/login** — autenticar e obter tokens
- **POST /auth/refresh** — renovar token de acesso com refresh token
 
### Todas as demais rotas requerem token JWT válido no cabeçalho:
\`Authorization: Bearer {accessToken}\`
    `,
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT obtido no endpoint POST /auth/login',
      },
      'JWT-auth',
    )
    .build();
 
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
 