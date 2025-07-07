# Pastor Portfolio

> Site de portfólio ministerial com sistema de gestão de conteúdo dinâmico

Este é um site desenvolvido em React + Node.js para apresentar o ministério do Pastor Giovanni Moreira Guimarães, com sistema completo de administração de conteúdo usando MongoDB.

## ✨ Funcionalidades

### 🏠 **Frontend**
- **Página Inicial:** Exibição dinâmica dos últimos sermões, estudos e livros
- **Sermões, Estudos e Livros:** Listagem com filtros, paginação e ordenação
- **Busca Avançada:** Pesquisa integrada em todo o conteúdo
- **Sistema Responsivo:** Layout adaptado para todos os dispositivos
- **Agenda:** Integração com Google Calendar
- **Contato & Newsletter:** Formulários funcionais

### 🎛️ **Painel Administrativo**
- **Dashboard:** Visão geral do sistema
- **CRUD Completo:** Criar, editar, visualizar e deletar conteúdo
- **Ordenação Flexível:** Por data, título, autor/referência
- **Autenticação Segura:** Sistema de login com JWT
- **Interface Intuitiva:** Painel admin responsivo e amigável

### 🔧 **Sistema Backend**
- **API RESTful:** Endpoints organizados e documentados
- **Banco de Dados:** MongoDB com Mongoose ODM
- **Autenticação:** JWT + bcrypt para segurança
- **Middlewares:** Validação e tratamento de erros

## 🚀 Tecnologias

### Frontend
- **React** 19.1.0 - Framework principal
- **React Router DOM** 7.5.3 - Roteamento
- **Axios** 1.10.0 - Requisições HTTP
- **FontAwesome** 6.7.2 - Ícones
- **React Markdown** 10.1.0 - Renderização de markdown

### Backend
- **Node.js** + **Express** 5.1.0 - Servidor web
- **MongoDB** + **Mongoose** 8.16.0 - Banco de dados
- **JWT** 9.0.2 - Autenticação
- **bcryptjs** 3.0.2 - Criptografia
- **CORS** 2.8.5 - Controle de acesso

## 🏗️ Arquitetura

```
pastor-portfolio/
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   └── assets/            # Imagens e recursos
├── backend/               # API Node.js
│   ├── models/           # Modelos MongoDB
│   ├── routes/           # Rotas da API
│   ├── controllers/      # Lógica de negócio
│   └── middleware/       # Middlewares
├── public/               # Arquivos estáticos
└── docs/                 # Documentação técnica
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- MongoDB instalado ou MongoDB Atlas
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/pastor-portfolio.git
cd pastor-portfolio
```

### 2. Configure o Backend
```bash
# Instale as dependências do backend
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações MongoDB

# Inicie o servidor backend
npm run dev
```

### 3. Configure o Frontend
```bash
# Volte para a raiz e instale dependências
cd ..
npm install

# Inicie o servidor de desenvolvimento
npm start
```

### 4. Acesse o Sistema
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Admin:** http://localhost:3000/admin

## 📖 Documentação

A documentação completa está disponível em [`docs/README.md`](./docs/README.md), incluindo:

- **Guias de Implementação** - Detalhes técnicos das funcionalidades
- **Histórico de Mudanças** - Log completo de alterações
- **Arquitetura do Sistema** - Visão geral da estrutura

## 🔐 Configuração

### Variáveis de Ambiente (Backend)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/pastor-portfolio
JWT_SECRET=sua_chave_secreta_muito_segura
NODE_ENV=development
```

### Primeiro Acesso Admin
1. Acesse `/admin`
2. Crie sua conta de administrador
3. Faça login e comece a gerenciar o conteúdo

## 📊 Status do Projeto

- ✅ **Sistema Completo** - Frontend + Backend funcional
- ✅ **Banco de Dados** - MongoDB configurado
- ✅ **Autenticação** - Sistema seguro implementado
- ✅ **Responsividade** - Design adaptativo
- ✅ **Documentação** - Guides e docs técnicos
- ✅ **Build Otimizado** - Pronto para produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para o ministério do Pastor Giovanni Moreira Guimarães**
