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
- **Upload de PDFs:** Suporte para Google Drive, Dropbox e OneDrive
- **Logs Detalhados:** Sistema de debug e monitoramento

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
- **Backend API:** http://localhost:3002
- **Admin:** http://localhost:3000/admin

> **Importante:** O backend agora roda na porta 3002 para evitar conflitos.

## � Últimas Correções e Melhorias

### 🛠️ **Problemas Corrigidos (Versão 2.1.0)**

#### Autenticação e JWT
- ✅ **Erro de Login:** Corrigido problema "Falha no login. Verifique suas credenciais"
- ✅ **Token JWT:** Ajustado campo `id` no token e middleware de autenticação
- ✅ **Usuário Inativo:** Removida verificação de campo `isActive` inexistente

#### Configuração de Portas
- ✅ **Conflito de Portas:** Backend movido da porta 3001 para 3002
- ✅ **URLs Frontend:** Atualizadas todas as chamadas de API para porta 3002
- ✅ **Documentação:** README atualizado com nova configuração

#### Validação de Dados
- ✅ **Upload de PDFs:** Expandida validação para aceitar:
  - Google Drive (`drive.google.com`)
  - Dropbox (`dropbox.com`)
  - OneDrive (`1drv.ms`, `onedrive.live.com`)
- ✅ **Campos de Data:** Corrigido uso de `date` para `createdAt` nos modelos
- ✅ **Erro "Invalid Date":** Solucionado em listas de estudos e livros

#### Sistema de Debug
- ✅ **Logs Detalhados:** Adicionados em rotas de criação e atualização
- ✅ **Testes Automatizados:** Scripts para validação de URLs e criação de conteúdo
- ✅ **Monitoramento:** Logs de debug para facilitar manutenção

### 🧪 **Testes Implementados**
- **test-sermon-creation.js:** Teste de criação de sermão com diferentes URLs
- **test-google-drive-url.js:** Validação específica de URLs do Google Drive
- **Teste de APIs:** Confirmação de funcionamento de todas as rotas protegidas

## 🛠️ Comandos de Desenvolvimento

### Scripts NPM Disponíveis
```bash
# Desenvolvimento
npm run dev                 # Inicia frontend + backend simultaneamente
npm run dev:frontend        # Inicia apenas o frontend (porta 3000)
npm run dev:backend         # Inicia apenas o backend (porta 3002)

# Produção
npm run build               # Build do frontend para produção
npm start                   # Inicia servidor de produção

# Utilitários
npm install                 # Instala todas as dependências
npm test                    # Executa testes automatizados
```

### Scripts de Teste
```bash
# Testar criação de sermão
node test-sermon-creation.js

# Testar validação de URLs do Google Drive
node test-google-drive-url.js

# Testar conexão com banco de dados
node test-db.js
```

### Comandos MongoDB Úteis
```bash
# Conectar ao banco local
mongo pastor-portfolio

# Visualizar coleções
show collections

# Contar documentos
db.sermons.countDocuments()
db.studies.countDocuments()
db.books.countDocuments()
db.users.countDocuments()

# Limpar dados (CUIDADO!)
db.sermons.deleteMany({})
db.studies.deleteMany({})
db.books.deleteMany({})
```

## �📖 Documentação

A documentação completa está disponível em [`docs/README.md`](./docs/README.md), incluindo:

- **Guias de Implementação** - Detalhes técnicos das funcionalidades
- **Histórico de Mudanças** - Log completo de alterações
- **Arquitetura do Sistema** - Visão geral da estrutura

## 🔐 Configuração

### Variáveis de Ambiente (Backend)
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/pastor-portfolio
JWT_SECRET=sua_chave_secreta_muito_segura
NODE_ENV=development
```

> **Atenção:** A porta padrão do backend foi alterada de 3001 para 3002.

### Primeiro Acesso Admin
1. Acesse `/admin`
2. Crie sua conta de administrador
3. Faça login e comece a gerenciar o conteúdo

## 🔍 Resolução de Problemas

### Problemas Comuns e Soluções

#### Backend não inicia
```bash
# Verifique se a porta 3002 está livre
netstat -ano | findstr :3002

# Se ocupada, altere a porta no .env ou finalize o processo
```

#### Erro de autenticação
```bash
# Limpe o localStorage do navegador
localStorage.clear()

# Ou acesse Ferramentas do Desenvolvedor > Application > Local Storage > Clear All
```

#### URLs de PDF não aceitas
- ✅ **Google Drive:** `https://drive.google.com/file/d/ID/view`
- ✅ **Dropbox:** `https://www.dropbox.com/s/ID/file.pdf`
- ✅ **OneDrive:** `https://1drv.ms/b/s!ID`
- ❌ **Não suportado:** URLs diretas de arquivos locais

#### Erro "Invalid Date"
- Verifique se os documentos no MongoDB têm o campo `createdAt`
- Execute uma migração se necessário:
```javascript
// No MongoDB
db.sermons.updateMany({}, {$set: {createdAt: new Date()}})
db.studies.updateMany({}, {$set: {createdAt: new Date()}})
db.books.updateMany({}, {$set: {createdAt: new Date()}})
```

## 📊 Status do Projeto

### ✅ **Versão 2.1.0 - Estável**
- ✅ **Sistema Completo** - Frontend + Backend funcional
- ✅ **Banco de Dados** - MongoDB configurado e otimizado
- ✅ **Autenticação** - Sistema JWT seguro e corrigido
- ✅ **Responsividade** - Design adaptativo em todos os dispositivos
- ✅ **Upload de Arquivos** - Suporte a múltiplas plataformas de armazenamento
- ✅ **Validação de Dados** - Sistema robusto de validação
- ✅ **Logs e Debug** - Monitoramento completo implementado
- ✅ **Testes** - Scripts de teste automatizados
- ✅ **Documentação** - Guides e docs técnicos atualizados
- ✅ **Build Otimizado** - Pronto para produção

### 🐛 **Bugs Conhecidos**
- Nenhum bug crítico identificado na versão atual
- Sistema totalmente funcional e testado

### 📋 **Roadmap Futuro**
- [ ] Sistema de notificações push
- [ ] Cache Redis para melhor performance
- [ ] Backup automático do banco de dados
- [ ] Dashboard de analytics
- [ ] API de integração com redes sociais

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**🚀 Pastor Portfolio v2.1.0 - Sistema Completo e Otimizado**
**Desenvolvido com ❤️ para o ministério do Pastor Giovanni Moreira Guimarães**

*Última atualização: Janeiro 2025 - Todos os problemas de autenticação, validação e configuração foram corrigidos.*
