# Relatório — Stage 1 — SGCM

## 1. Integrantes e Contribuições

| Integrante | Contribuições |
|---|---|
| Brener Martins | Implementação dos módulos Users(doctors), Specialties, estrutura base do projeto, herança STI |
| Breno Maeda | Atuou como Tester (QA) da etapa, responsável pelos testes manuais das rotas via Swagger, validação rigorosa das regras de negócio (como conflitos de agendamento) e garantia da qualidade dos fluxos da API | 
| Higor Morais Vieira | Implementação dos módulos Users(Patients, Admins e Users - Base), Schedules |


## 2. Diagrama de Classes

### Usuários e Especialidades
![Diagrama Users e Specialties](./diagrams/diagrama-user-specialty-stage1.png)

### Agendamentos
![Diagrama Schedules](./diagrams/diagrama-schedules-stage1.png)

## 3. Decisões Técnicas

### Estratégia de herança (STI) para User e Schedule
**Alternativas consideradas:** STI (Single Table Inheritance) e CTI (Class Table Inheritance).  
**Decisão:** STI para ambas as hierarquias.  
**Justificativa:** O TypeORM com SQLite tem suporte mais estável para STI. Listagens mistas (todos os usuários, todos os agendamentos) são feitas em uma única query sem joins, o que simplifica o código e melhora a performance para o volume esperado.

### Granularidade dos controllers
**Alternativas consideradas:** Um único UsersController ou controllers separados por perfil.  
**Decisão:** Controllers separados — UsersController, DoctorsController, PatientsController.  
**Justificativa:** Rotas mais expressivas (/doctors, /patients), DTOs de resposta específicos por perfil e documentação Swagger mais clara por recurso.

### Exportação do UsersService para outros módulos
**Alternativas consideradas:** Exportar o UsersService completo ou criar um service auxiliar.  
**Decisão:** Exportar o UsersService completo.  
**Justificativa:** Para o escopo atual o custo de criar um service auxiliar supera o benefício. O UsersModule exporta o UsersService e o SchedulesModule o importa para validar médico e paciente no momento do agendamento.

### Verificação de unicidade no service
**Decisão:** Verificar no service antes de persistir, lançando ConflictException explícita.  
**Justificativa:** Mensagens de erro mais descritivas e controle total sobre o fluxo. A possibilidade de race condition foi aceita dado o contexto acadêmico do projeto.

### Entidade de junção explícita DoctorSpecialty
**Decisão:** Usar entidade explícita em vez de tabela de junção automática do TypeORM.  
**Justificativa:** Permite adicionar atributos à relação futuramente (ex: certificationDate) sem reescrita, conforme previsto no diagrama base do enunciado.

### Repositório genérico vs customizado
**Decisão:** Repository<T> genérico para operações simples, QueryBuilder para consultas com filtros combinados (findAll de schedules).  
**Justificativa:** Evita criar classes de repositório desnecessárias mantendo as queries complexas organizadas no service.

### Remoção vs inativação de usuários
**Decisão:** Inativação via campo isActive.  
**Justificativa:** Preserva o histórico de agendamentos. Usuários inativos não aparecem nas listagens padrão. A restrição de login para usuários inativos será aplicada na Etapa 2.

### O que caracteriza agendamento "ativo"
**Decisão:** Agendamentos com status PENDING ou CONFIRMED são considerados ativos para fins de bloqueio de remoção de usuário.

### cancelledBy e createdBy nesta etapa
**Decisão:** Campos existem no modelo mas são deixados nulos nesta etapa.  
**Justificativa:** Sem autenticação implementada não há como identificar o usuário autenticado. Serão preenchidos via @CurrentUser() na Etapa 2.

### DTOs por modalidade ou DTO único para Schedule
**Decisão:** DTO único (CreateScheduleDto) com validação condicional no service.  
**Justificativa:** Simplifica o endpoint POST /schedules. A validação dos campos específicos por modalidade é feita no método validateScheduleTypeFields do service.

### Fator de custo do bcrypt
**Decisão:** Fator 10.  
**Justificativa:** Valor padrão amplamente adotado, equilibra segurança e performance para o contexto da aplicação.

### synchronize: true vs migrations
**Decisão:** synchronize: true nesta etapa.  
**Justificativa:** Adequado para desenvolvimento com banco compartilhado no repositório. Migrations serão avaliadas nas próximas etapas conforme o schema se estabiliza.

## 4. Dificuldades e Aprendizados

- **Herança com TypeORM e SQLite:** O comportamento do STI com SQLite exigiu atenção na configuração dos decorators @TableInheritance e @ChildEntity para que as queries polimórficas funcionassem corretamente.
- **Serialização com ClassSerializerInterceptor:** Garantir que os DTOs de resposta excluíssem campos sensíveis (password, refreshToken) em todas as rotas exigiu revisão cuidadosa de cada DTO.
- **Filtro de exceção RFC 7807:** Adaptar o formato padrão do NestJS para o formato RFC 7807 exigiu tratamento especial para os erros do ValidationPipe, que retornam um array de mensagens.
- **Dependências entre módulos:** Estruturar a dependência do SchedulesModule no UsersModule sem criar acoplamento excessivo foi o principal desafio arquitetural desta etapa.