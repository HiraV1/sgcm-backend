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
git clone https://github.com/SEU-USUARIO/sgcm-backend.git
cd sgcm-backend
```

---

### 2. Instalar dependências

```bash
npm install
```

---

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
DATABASE_URL=database.sqlite
```

---

## 🔐 Variáveis de ambiente

| Variável     | Descrição               |
| ------------ | ----------------------- |
| PORT         | Porta da aplicação      |
| DATABASE_URL | Caminho do banco SQLite |

---

### 4. Executar o projeto

```bash
npm run start:dev
```

---

### 5. Acessar a API

**Aplicação:**
http://localhost:3000

**Documentação Swagger (após iniciar o projeto):** 
http://localhost:3000/api

---

## 🔄 Controle de versão (branches)

* **main** → versão estável
* **stage-*** → integração por etapa
* **feature/*** → desenvolvimento de funcionalidades

---

## 📌 Observações

* O banco SQLite é criado automaticamente na primeira execução
* O arquivo `database.sqlite` não deve ser versionado
* O projeto segue arquitetura modular utilizando NestJS

---

## 📌 Status do projeto

🚧 Em desenvolvimento (Etapa 1)
