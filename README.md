# 🏥 SGCM - Sistema de Gestão de Clínica Médica
 
## 📌 Descrição
 
O **SGCM (Sistema de Gestão de Clínica Médica)** é uma API backend desenvolvida para centralizar o gerenciamento de usuários, agendamentos e informações clínicas.
 
O sistema resolve problemas de inconsistência de dados e processos manuais, oferecendo uma base única e confiável para múltiplas interfaces (web, mobile e sistemas internos).
 
---
 
## 👥 Integrantes
 
* BRENO TAKESHI CAMARGO DA SILVA MAEDA
* BRENER MARTINS SILVA
* HIGOR MORAIS VIEIRA
---
 
## 🛠️ Tecnologias e versões
 
* **Node.js:** 20.20.2 (LTS)
* **NestJS:** 11.1.19
* **TypeScript:** 5.9.3
* **TypeORM:** 0.3.28
* **SQLite:** 3.x
---
 
## 🚀 Como executar o projeto
 
### 1. Clonar o repositório
 
```bash
git clone https://github.com/HiraV1/sgcm-backend.git
cd sgcm-backend
```
 
---
 
### 2. Instalar dependências
 
```bash
npm install
```
 
---
 
### 3. Configurar variáveis de ambiente
 
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
 
```env
PORT=3000
DATABASE_PATH=./database.sqlite
JWT_SECRET=seu_segredo_aqui_com_minimo_32_caracteres
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```
 
> Para gerar um segredo JWT seguro:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
 
---
 
### 4. Executar o projeto
 
```bash
npm run start:dev
```
 
---
 
### 5. Acessar a API
 
**Aplicação:**
<http://localhost:3000>
 
**Documentação Swagger (após iniciar o projeto):**
<http://localhost:3000/api>
 
---
 
## 🔐 Variáveis de ambiente
 
| Variável               | Descrição                                           |
|------------------------|-----------------------------------------------------|
| PORT                   | Porta da aplicação                                  |
| DATABASE_PATH          | Caminho do banco SQLite                             |
| JWT_SECRET             | Segredo para assinar tokens JWT (mínimo 32 chars)   |
| JWT_EXPIRES_IN         | Tempo de expiração do token de acesso (ex: 15m, 1h) |
| JWT_REFRESH_EXPIRES_IN | Tempo de expiração do refresh token (ex: 7d, 30d)   |
 
---
 
## 🔑 Credenciais de Teste
 
Para testar os endpoints protegidos:
 
1. Faça login em **POST /auth/login** com uma das credenciais abaixo
2. Copie o `accessToken` retornado
3. Clique em **Authorize** no Swagger e insira o token
| Perfil  | E-mail                         | Senha        |
|---------|--------------------------------|--------------|
| Admin   | admin@sgcm.com                 | Admin@123    |
| Doctor  | rafael.mendes@sgcm.com         | Doctor@123   |
| Patient | joao.silva@email.com           | Patient@123  |
 
---
 
## 🔄 Controle de versão (branches)
 
* **main** → versão estável
* **stage-*** → integração por etapa
* **feature/*** → desenvolvimento de funcionalidades
---
 
## 📌 Observações
 
* O banco SQLite é criado automaticamente na primeira execução
* O arquivo `.env` **não deve ser versionado** — está no `.gitignore`
* O projeto segue arquitetura modular utilizando NestJS
---
 
## 📌 Status do projeto
 
🚧 Em desenvolvimento (Etapa 2)