# Relatório — Stage 1 — SGCM

## 1. Integrantes e Contribuições

| Integrante | Contribuições |
|---|---|
| Brener Martins | Implementação dos módulos Users(doctors), Specialties, estrutura base do projeto, herança STI |
| Breno Maeda | Revisão técnica da Stage 1, testes manuais dos endpoints, conferência das regras de negócio, revisão do relatório e validação da documentação exigida pelo professor. |
| Higor Morais Vieira | Implementação dos módulos Users(Patients, Admins e Users - Base), Schedules |


## 2. Diagrama de Classes
Os diagramas foram atualizados para representar a implementação real da Stage 1. A hierarquia de usuários contempla `UserEntity`, `AdminEntity`, `DoctorEntity` e `PatientEntity`. A hierarquia de agendamentos contempla `ScheduleEntity`, `InPersonScheduleEntity`, `OnlineScheduleEntity` e `HomeScheduleEntity`. A entidade `Specialty` se relaciona com `DoctorEntity` por uma associação muitos-para-muitos.

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

### Associação entre Doctor e Specialty

**Alternativas consideradas:** entidade de junção explícita DoctorSpecialty ou tabela de junção automática com `@ManyToMany` e `@JoinTable`.

**Decisão:** utilizar `@ManyToMany` com `@JoinTable`.

**Justificativa:** para a Stage 1, a associação entre médicos e especialidades não possui atributos próprios. Por isso, a tabela de junção automática reduz complexidade e atende aos requisitos funcionais de associar, desassociar e listar especialidades por médico.

**Limitação:** caso futuramente seja necessário armazenar informações na relação, como data de certificação ou status da especialidade do médico, será recomendável refatorar para uma entidade explícita `DoctorSpecialty`.

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

## 5. Pontos de melhoria identificados

Durante a revisão da Stage 1, foram identificados alguns pontos que podem evoluir nas próximas etapas:

- Reduzir o tamanho de alguns services, extraindo métodos auxiliares para regras específicas de negócio.
- Avaliar a criação de repositórios customizados para consultas mais complexas.
- Adicionar testes automatizados para os fluxos principais de usuários, especialidades e agendamentos.
- Evoluir a associação entre médicos e especialidades para uma entidade explícita caso a relação passe a ter atributos próprios.
- Revisar o acoplamento entre módulos à medida que autenticação, atendimentos e prontuários forem adicionados.


# Relatório — Stage 2 — SGCM


# Relatório — Stage 3 — SGCM

## 6. Novos Módulos Implementados

A Stage 3 expande o sistema de gerenciamento clínico com a introdução dos módulos:

* Appointments (atendimentos)
* Procedures (procedimentos)
* Medical Records (prontuários)
* Reports (laudos)
* Administrative Reports (relatórios administrativos)

Esses módulos representam o fluxo clínico após a confirmação de um agendamento, permitindo registrar atendimentos, procedimentos executados, prontuários médicos, emissão de laudos e geração de indicadores administrativos.

---

## 7. Decisões Técnicas

### Continuidade da estratégia STI (Single Table Inheritance)

**Alternativas consideradas:** STI (Single Table Inheritance) e tabelas independentes para cada subtipo.

**Decisão:** Manter STI para as novas hierarquias da Stage 3.

Aplicado em:

* AppointmentEntity

  * ConsultationEntity
  * ExamEntity
  * FollowUpEntity

* ProcedureEntity

  * SimpleProcedureEntity
  * SpecializedProcedureEntity

**Justificativa:** Os subtipos compartilham grande quantidade de atributos em comum. A criação de tabelas independentes aumentaria a duplicação estrutural, a quantidade de relacionamentos e a complexidade das consultas.

Além disso, o STI permite consultas polimórficas utilizando um único repositório, simplificando a implementação dos endpoints de listagem e filtros.

---

### Organização dos endpoints por recurso proprietário

**Alternativas consideradas:** Declarar rotas em seus respectivos módulos ou declarar rotas a partir do recurso principal.

**Decisão:** Algumas rotas foram declaradas dentro do contexto do recurso Appointment, mesmo quando a lógica é executada por outro módulo.

Exemplos:

```txt
GET /appointments/{id}/procedures
POST /appointments/{id}/procedures
GET /appointments/{id}/records
POST /appointments/{id}/records
POST /appointments/{id}/report
```

**Justificativa:** Sob a ótica REST, esses recursos representam navegação a partir de um atendimento específico. Dessa forma, a API se torna mais intuitiva para quem a consome e mantém uma hierarquia de recursos mais natural.

A lógica de negócio continua encapsulada nos respectivos services dos módulos Procedures, Medical Records e Reports.

---

### DTOs específicos por operação

**Alternativas consideradas:** Reutilização agressiva de DTOs ou DTOs específicos por operação.

**Decisão:** Utilizar DTOs específicos para os diferentes fluxos da aplicação.

Exemplos:

* CreateConsultationDto
* CreateExamDto
* CreateFollowUpDto
* CreateMedicalRecordDto
* CreateReportDto

**Justificativa:** Embora a reutilização fosse possível em alguns cenários, DTOs específicos trazem benefícios importantes:

* Melhor documentação Swagger;
* Regras de validação mais explícitas;
* Menor acoplamento entre endpoints;
* Maior facilidade de evolução futura da API.

---

### Cálculo da taxa de ocupação médica

**Decisão:** Utilizar a fórmula:

```txt
((Pending + Confirmed + Completed) / Total Schedules) * 100
```

**Justificativa:** Agendamentos pendentes, confirmados e concluídos representam horários reservados na agenda médica.

Somente agendamentos cancelados são considerados horários não utilizados.

Essa abordagem gera uma métrica simples, intuitiva e adequada para avaliar a utilização da agenda médica.

---

### Serviço dedicado para geração de PDF

**Alternativas consideradas:** Gerar PDFs diretamente nos services de domínio ou criar um serviço dedicado.

**Decisão:** Isolar a geração de PDFs em um serviço específico.

**Justificativa:** A biblioteca PDFKit permanece concentrada em uma única camada da aplicação, reduzindo o acoplamento entre módulos clínicos e componentes de infraestrutura.

Essa decisão facilita:

* manutenção;
* testes;
* substituição futura da biblioteca PDF;
* separação de responsabilidades.

O domínio permanece responsável apenas pelas regras de negócio relacionadas aos laudos.

---

### Imutabilidade dos documentos clínicos

**Decisão:** Prontuários e laudos não podem ser removidos fisicamente após sua criação.

**Justificativa:** Informações clínicas representam registros históricos importantes para auditoria e rastreabilidade médica.

Em vez de exclusão, o sistema utiliza mecanismos controlados, como revogação de laudos, preservando o histórico completo do atendimento.

---

### Centralização das regras de negócio nos Services

**Alternativas consideradas:** Controllers contendo validações de negócio ou centralização nos services.

**Decisão:** Controllers permanecem responsáveis apenas pelo recebimento de requisições, documentação Swagger e delegação para os services.

**Justificativa:** Regras como:

* validação de propriedade dos recursos;
* emissão de laudos;
* transições de estado;
* autorização de procedimentos especializados;

permanecem concentradas nos services.

Essa abordagem melhora a manutenibilidade e segue o princípio de responsabilidade única.

---

## 8. Dificuldades e Aprendizados

* Modelar o fluxo clínico completo mantendo compatibilidade com a arquitetura das etapas anteriores.
* Definir corretamente quais validações pertencem aos DTOs e quais pertencem às regras de negócio dos services.
* Garantir consistência dos estados dos atendimentos e procedimentos durante as transições.
* Integrar geração de PDF sem acoplar bibliotecas externas ao domínio da aplicação.
* Organizar endpoints REST de forma intuitiva sem comprometer a separação entre módulos.

---

## 9. Pontos de melhoria identificados

* Ampliação da cobertura de testes automatizados para fluxos clínicos.
* Extração de regras complexas para serviços especializados de domínio.
* Implementação futura de trilhas completas de auditoria para alterações clínicas.
* Evolução dos relatórios administrativos com novos indicadores gerenciais.
* Revisão periódica do acoplamento entre módulos conforme novas funcionalidades forem adicionadas.