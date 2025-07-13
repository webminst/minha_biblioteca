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
| **Axios** | 1.10.0 | Cliente HTTP |
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
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Admin Dashboard:** http://localhost:3000/admin/dashboard

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
# Testar criação de conteúdo
node backend/test-sermon-creation.js
node backend/test-google-drive-url.js

# Verificar conexão com banco
node backend/test-db.js
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

### ✅ Versão 2.3.1 - Estável

**Funcionalidades Implementadas:**
- ✅ Sistema completo frontend + backend
- ✅ Autenticação JWT segura com refresh tokens
- ✅ Interface administrativa com paginação avançada
- ✅ Upload de arquivos para múltiplas plataformas
- ✅ Sistema de busca integrado
- ✅ Design responsivo otimizado
- ✅ Logs detalhados e sistema de debug
- ✅ Configuração de segurança implementada
- ✅ Documentação técnica completa

**Últimas Correções (v2.3.1):**
- ✅ **Navegação Admin:** Botão "Voltar" direciona corretamente para dashboard
- ✅ **Layout Horizontal:** Três botões alinhados lado a lado no dashboard
- ✅ **Cores Unificadas:** Paleta consistente em toda interface administrativa
- ✅ **Bug da Referência:** Corrigido campo vazio na lista de estudos
- ✅ **Contadores Dinâmicos:** Dashboard exibe quantidades em tempo real

### 🐛 Bugs Conhecidos
- Nenhum bug crítico identificado na versão atual
- Sistema totalmente funcional e testado

### 📋 Roadmap Futuro
- [ ] Sistema de notificações push
- [ ] Cache Redis para performance
- [ ] Backup automático do banco
- [ ] Dashboard de analytics
- [ ] Integração com redes sociais

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
│   └── utils/             # Utilitários e helpers
├── backend/               # API Node.js
│   ├── models/           # Modelos MongoDB (Sermon, Study, Book)
│   ├── routes/           # Rotas da API REST
│   ├── middleware/       # Middlewares (auth, security)
│   └── utils/            # Utilitários backend
├── public/               # Arquivos estáticos
│   ├── images/           # Imagens do site
│   └── ...               # Favicon, manifest, etc.
├── docs/                 # Documentação técnica
└── .vscode/              # Configurações VS Code
```

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

**🚀 Pastor Portfolio v2.3.1 - Dashboard Otimizado com Layout Horizontal**

**Desenvolvido com ❤️ para o ministério do Pastor Giovanni Moreira Guimarães**

*Última atualização: Janeiro 2025 - Sistema completo, seguro e otimizado para produção*
