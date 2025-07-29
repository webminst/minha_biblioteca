# Pastor Portfolio

> Portfólio ministerial digital com sistema completo de gestão de conteúdo

Site desenvolvido em React + Node.js para apresentar o ministério do Pastor Giovanni Moreira Guimarães, com sistema de administração dinâmica usando MongoDB.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Configuração de Ambiente](#configuração-de-ambiente)
- [Documentação](#documentação)
- [Resolução de Problemas](#resolução-de-problemas)
- [Status do Projeto](#status-do-projeto)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

O Pastor Portfolio é uma plataforma web completa que permite ao Pastor compartilhar seu ministério através de:

- **Sermões**: Pregações organizadas por série e referência bíblica
- **Estudos Bíblicos**: Material didático para grupos e EBD
- **Resumos de Livros**: Sínteses de obras teológicas relevantes
- **Agenda Ministerial**: Integração com Google Calendar
- **Sistema de Apoio**: Informações para doações e PIX

## ✨ Funcionalidades

### 🏠 Frontend Público

- ✅ **Página Inicial** - Últimos conteúdos em destaque
- ✅ **Navegação Intuitiva** - Sermões, estudos e livros organizados
- ✅ **Busca Avançada** - Pesquisa integrada em todo o conteúdo
- ✅ **Design Responsivo** - Adaptado para todos os dispositivos
- ✅ **Sistema de Newsletter** - Cadastro para receber atualizações

### 🎛️ Painel Administrativo

- ✅ **Dashboard Inteligente** - Visão geral com contadores dinâmicos
- ✅ **CRUD Completo** - Criar, editar, visualizar e deletar conteúdo
- ✅ **Paginação Avançada** - Controle flexível de itens por página (5, 10, 20, 50)
- ✅ **Ordenação Dinâmica** - Por data, título, autor/referência
- ✅ **Interface Otimizada** - Layout horizontal e cores consistentes

### 🔒 Sistema de Segurança

- ✅ **Autenticação JWT** - Sistema seguro com refresh tokens
- ✅ **Variáveis de Ambiente** - Proteção de credenciais sensíveis
- ✅ **Rate Limiting** - Proteção contra ataques de força bruta
- ✅ **Headers de Segurança** - Configurações avançadas implementadas

## 🚀 Tecnologias

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **React** | 19.1.0 | Framework principal |
| **React Router DOM** | 7.5.3 | Roteamento SPA |
| **Axios** | 1.10.0 | Cliente HTTP com interceptors |
| **FontAwesome** | 6.7.2 | Biblioteca de ícones |
| **React Markdown** | 10.1.0 | Renderização markdown |

### Backend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** + **Express** | 5.1.0 | Servidor web |
| **MongoDB** + **Mongoose** | 8.16.0 | Banco de dados |
| **JWT** | 9.0.2 | Autenticação |
| **bcryptjs** | 3.0.2 | Criptografia |
| **CORS** | 2.8.5 | Controle de acesso |
| **Joi** | 17.x | **NOVO:** Validação de dados DTOs |

### Arquitetura DTO (v3.0.0)

| Componente | Função | Status |
|------------|--------|---------|
| **BaseDTO** | Classe base para todos os DTOs | ✅ Implementado |
| **Joi Validation** | Validação automática de entrada | ✅ Implementado |
| **ApiResponseDTO** | Respostas padronizadas | ✅ Implementado |
| **PaginationDTO** | Sistema de paginação unificado | ✅ Implementado |
| **dtoValidation.js** | Middleware de validação | ✅ Implementado |

## 🛠️ Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ instalado
- **MongoDB** local ou MongoDB Atlas
- **Git** para controle de versão

### 1. Clone e Prepare o Projeto

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/pastor-portfolio.git
cd pastor-portfolio

# Instale as dependências do frontend
npm install
```

### 2. Configure o Backend

```bash
# Navegue para o backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações (veja seção de configuração)
```

### 3. Configure o Frontend

```bash
# Volte para a raiz
cd ..

# Configure as variáveis de ambiente do frontend
cp .env.local.example .env.local
# Edite o .env.local com suas configurações
```

### 4. Inicie o Sistema

```bash
# Opção 1: Inicie tudo simultaneamente (recomendado)
npm run dev

# Opção 2: Inicie separadamente
npm run dev:frontend  # Frontend na porta 3000
npm run dev:backend   # Backend na porta 3001
```

### 5. Acesse o Sistema

- **Frontend:** <http://localhost:3000>
- **Backend API:** <http://localhost:3001>
- **Admin Dashboard:** <http://localhost:3000/admin/dashboard>

## 📖 Como Usar

### Primeiro Acesso

1. Acesse `/admin/dashboard`
2. Crie sua conta de administrador
3. Faça login no sistema
4. Comece a adicionar conteúdo

### Gerenciando Conteúdo

- **Sermões:** `/admin/sermoes` - Adicione pregações com referências bíblicas
- **Estudos:** `/admin/estudos` - Crie material para grupos de estudo
- **Livros:** `/admin/livros` - Publique resumos de obras teológicas

### Upload de Arquivos

Suporte para múltiplas plataformas:

- ✅ **Google Drive:** `https://drive.google.com/file/d/ID/view`
- ✅ **Dropbox:** `https://www.dropbox.com/s/ID/file.pdf`
- ✅ **OneDrive:** `https://1drv.ms/b/s!ID`

## 🔧 Comandos Disponíveis

### Scripts de Desenvolvimento

```bash
npm run dev                 # Frontend + Backend simultaneamente
npm run dev:frontend        # Apenas frontend (porta 3000)
npm run dev:backend         # Apenas backend (porta 3001)
npm run build               # Build de produção
npm start                   # Servidor de produção
```

### Scripts de Teste

```bash
# Verificar conexão com banco
node backend/test-db.js

# Testar endpoints da API
curl http://localhost:3001/api/books
curl http://localhost:3001/api/sermons
curl http://localhost:3001/api/studies
```

### Comandos MongoDB

```bash
# Conectar ao banco local
mongo pastor-portfolio

# Contar documentos
db.sermons.countDocuments()
db.studies.countDocuments()
db.books.countDocuments()
```

## ⚙️ Configuração de Ambiente

### Backend (.env)

```env
# Servidor
PORT=3001

# Banco de dados
MONGODB_URI=mongodb://localhost:27017/pastor-portfolio
# Para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pastor-portfolio

# Segurança JWT
JWT_SECRET=sua_chave_secreta_de_64_caracteres_minimo
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Ambiente
NODE_ENV=development
```

### Frontend (.env.local)

```env
# API
REACT_APP_API_URL=http://localhost:3001

# Informações de suporte (PIX)
REACT_APP_PIX_KEY=sua_chave_pix_aqui
REACT_APP_BANK_NAME=Nome_do_Banco
REACT_APP_ACCOUNT_HOLDER=Nome_do_Titular
```

> ⚠️ **Segurança:** Nunca commite arquivos `.env` com credenciais reais. Use sempre `.env.example` como template.

## 📚 Documentação

A documentação técnica completa está em [`docs/README.md`](./docs/README.md):

### Documentos Principais

- **[API_CENTRALIZATION.md](./docs/API_CENTRALIZATION.md)** - Configuração centralizada de endpoints
- **[JWT_SECURITY_ENHANCEMENT.md](./docs/JWT_SECURITY_ENHANCEMENT.md)** - Melhorias de segurança JWT
- **[PIX_SECURITY_FIX.md](./docs/PIX_SECURITY_FIX.md)** - Correção de credenciais expostas
- **[CHANGES.md](./docs/CHANGES.md)** - Histórico de mudanças
- **[SECURITY.md](./docs/SECURITY.md)** - Guia de segurança completo

### 🆕 Documentação DTO v3.0.0

- **[DTO_MIGRATION_COMPLETE.md](./docs/DTO_MIGRATION_COMPLETE.md)** - Relatório completo da migração
- **[SERVICE_INTEGRATION_COMPLETE.md](./docs/SERVICE_INTEGRATION_COMPLETE.md)** - Integração de serviços finalizada
- **[API_UPGRADE_GUIDE.md](./docs/API_UPGRADE_GUIDE.md)** - Guia de upgrade para DTOs
- **[EXAMPLES_IMPLEMENTATION.js](./docs/EXAMPLES_IMPLEMENTATION.js)** - Exemplos práticos de uso

### Arquivos de Referência Técnica

- **[IMPROVEMENTS_ANALYSIS.md](./docs/IMPROVEMENTS_ANALYSIS.md)** - Análise de melhorias implementadas
- **[PROJECT_CLEANUP.md](./docs/PROJECT_CLEANUP.md)** - Limpeza e organização do código

## 🔍 Resolução de Problemas

### Problemas Comuns

#### Backend não inicia

```bash
# Verifique se a porta está livre
netstat -ano | findstr :3001

# Limpe cache do npm
npm cache clean --force
```

#### Erro de autenticação

```bash
# Limpe o localStorage do navegador
localStorage.clear()
```

#### Erro "Invalid Date"

```javascript
// Execute no MongoDB para corrigir documentos sem data
db.sermons.updateMany({}, {$set: {createdAt: new Date()})
db.studies.updateMany({}, {$set: {createdAt: new Date()})
db.books.updateMany({}, {$set: {createdAt: new Date()})
```

#### MongoDB não conecta

- Verifique se o MongoDB está rodando localmente
- Confirme a string de conexão no `.env`
- Para MongoDB Atlas, verifique credenciais e whitelist de IP

## 📊 Status do Projeto

### ✅ Versão 3.1.0 — Cobertura de Testes e Robustez

**Funcionalidades Implementadas:**

- ✅ Sistema completo frontend + backend
- ✅ Arquitetura DTO (Data Transfer Objects) implementada
- ✅ Sistema de validação Joi integrado
- ✅ Respostas API padronizadas com ApiResponseDTO
- ✅ Sistema de paginação unificado com PaginationDTO
- ✅ Autenticação JWT segura com refresh tokens
- ✅ Interface administrativa com paginação avançada
- ✅ Upload de arquivos para múltiplas plataformas
- ✅ Sistema de busca integrado
- ✅ Design responsivo otimizado
- ✅ Logs detalhados e sistema de debug
- ✅ Configuração de segurança implementada
- ✅ Documentação técnica completa
- ✅ **Frontend React 18+** com hooks customizados, contexto global, feedback visual (Toast, Skeleton, Spinner), navegação protegida, integração 2FA e layout responsivo
- ✅ **Cobertura de Testes Automatizados:**
  - Backend: 100% dos módulos (rotas, serviços, middlewares, DTOs e endpoints de health check) testados com Jest e Supertest
  - Frontend: Cobertura de todos os principais componentes (autenticação, rotas protegidas, dashboard, utilitários, layout, feedback/contexto, loading, newsletter, hooks)
  - Testes robustos com @testing-library/react, jest-dom, user-event, mocks de serviços, hooks, timers reais e eliminação de warnings/erros

**Migração DTO v3.0.0 — Concluída 100%:**

- ✅ Backend: Todos os módulos (Books, Studies, Sermons) migrados
- ✅ DTOs Implementados: CreateDTO, UpdateDTO, ListDTO para cada módulo
- ✅ Validação Automática: Middleware dtoValidation.js com Joi
- ✅ Frontend Compatível: Helpers e hooks para integração total
- ✅ Admin Panel: Todas as interfaces administrativas funcionais
- ✅ Busca e Detalhes: Páginas de conteúdo e resultados otimizadas
- ✅ Zero Breaking Changes: Migração transparente sem impacto no usuário

### 🩺 Monitoramento e Health Check

- O backend expõe o endpoint `/health` para monitoramento externo de disponibilidade e dependências (MongoDB, Redis, versão, timestamp).
- Recomenda-se configurar um serviço como **UptimeRobot** ou **StatusCake** apontando para `https://SEU_DOMINIO/health` para alertas automáticos de indisponibilidade.
- Para monitoramento de cache, utilize também `/cache-status`.
- Não é necessário alterar o backend para integração com esses serviços.

#### Exemplo: Configurando UptimeRobot

1. Crie uma conta gratuita em <https://uptimerobot.com/>
2. Clique em "Add New Monitor"
3. Tipo: HTTP(s)
4. Friendly Name: Pastor Portfolio Health
5. URL: `https://SEU_DOMINIO/health`
6. Intervalo: 5 minutos (ou conforme desejado)
7. Salve e ative alertas por e-mail/Telegram/Slack

Se desejar monitorar o cache, repita o processo para `https://SEU_DOMINIO/cache-status`.

### 🧪 Testes Automatizados — Estado Atual

- **Backend:**
  - Cobertura total de rotas, serviços, middlewares, DTOs e integrações
  - Testes de integração com MongoDB e Redis usando mocks e teardown seguro
- **Frontend:**
  - Testes para todos os principais componentes (Login, 2FA, ProtectedRoute, Dashboard, TokenStatus, Header, Footer, Toast, ToastContainer, LoadingSpinner, SkeletonLoader, NewsletterForm, Layout, ContentCard, BibleVerse, BibleSearch, ScrollToTop, StarRating)
  - Testes de hooks customizados (useAuth, useApi)
  - Uso de timers reais para feedback visual, mocks isolados para dependências externas
  - Eliminação de warnings/erros de act(), timers e ambiente
  - Ambiente de testes atualizado para React 18+

### 🐛 Bugs Conhecidos

- Nenhum bug crítico identificado na versão atual
- Sistema totalmente funcional, testado e robusto

### 📋 Roadmap Futuro

- [ ] Sistema de notificações push
- [ ] Cache Redis para performance
- [ ] Backup automático do banco
- [ ] Dashboard de analytics
- [ ] Integração com redes sociais
- [ ] Versionamento de API (v2)
- [ ] WebSockets para updates em tempo real
- [ ] Testes E2E automatizados (Cypress/Playwright)

### 📚 Documentação DTO

**Nova Documentação v3.0.0:**

- **[DTO_MIGRATION.md](./docs/DTO_MIGRATION.md)** - Guia completo da migração DTO
- **[API_DTO_EXAMPLES.md](./docs/API_DTO_EXAMPLES.md)** - Exemplos de uso dos DTOs
- **[VALIDATION_GUIDE.md](./docs/VALIDATION_GUIDE.md)** - Guia de validação Joi

**Principais Benefícios da Migração DTO:**

- ✅ Validação consistente e automática
- ✅ Respostas padronizadas em toda API
- ✅ Melhor performance e payload enxuto
- ✅ Código mais organizado, testável e seguro
- ✅ Zero breaking changes para o frontend

## 🏗️ Arquitetura do Projeto

```
pastor-portfolio/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   │   ├── admin/         # Painel administrativo
│   │   ├── ContentCard/   # Card de conteúdo
│   │   └── ...            # Outros componentes
│   ├── pages/             # Páginas da aplicação
│   ├── config/            # Configurações (API endpoints)
│   ├── utils/             # Utilitários e helpers
│   │   └── apiResponseHelpers.js  # 🆕 Helpers DTO compatibilidade
│   └── hooks/             # Custom hooks
│       └── useApi.js      # 🆕 Hook otimizado para DTOs
├── backend/               # API Node.js
│   ├── dto/              # 🆕 Data Transfer Objects
│   │   ├── BaseDTO.js    # Classe base para DTOs
│   │   ├── ApiResponseDTO.js  # Respostas padronizadas
│   │   ├── PaginationDTO.js   # Sistema de paginação
│   │   ├── sermon/       # DTOs específicos de sermões
│   │   ├── study/        # DTOs específicos de estudos
│   │   └── book/         # DTOs específicos de livros
│   ├── middleware/       # Middlewares (auth, security, validation)
│   │   └── dtoValidation.js  # 🆕 Middleware validação DTO
│   ├── models/           # Modelos MongoDB (Sermon, Study, Book)
│   ├── routes/           # Rotas da API REST (100% DTO)
│   ├── services/         # Serviços de negócio
│   └── utils/            # Utilitários backend
├── public/               # Arquivos estáticos
│   ├── images/           # Imagens do site
│   └── ...               # Favicon, manifest, etc.
├── docs/                 # Documentação técnica
│   └── DTO_MIGRATION.md  # 🆕 Documentação da migração DTO
└── .vscode/              # Configurações VS Code
```

### 🏛️ Arquitetura DTO (v3.0.0)

**Fluxo de Dados:**

```
Cliente → Request → dtoValidation → Controller → Service → Model → Response DTO → Cliente
```

**Principais Componentes:**

- **DTOs de Entrada:** CreateDTO, UpdateDTO para validação
- **DTOs de Saída:** Dados formatados e paginação
- **Middleware:** Validação automática com Joi
- **Helpers Frontend:** Compatibilidade total com respostas DTO

## 🤝 Contribuição

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um **Pull Request**

### Diretrizes de Contribuição

- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use mensagens de commit descritivas

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**🚀 Pastor Portfolio v3.1.0 — Arquitetura DTO, Testes Automatizados e Frontend Moderno**

**Desenvolvido com ❤️ para o ministério do Pastor Giovanni Moreira Guimarães**

*Última atualização: Julho 2025 — Cobertura de testes automatizados, frontend React 18+, integração 2FA, feedback visual, ambiente robusto e performance otimizada*
