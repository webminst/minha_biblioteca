# 📝 Convenções de Código - Pastor Portfolio

## 🎯 Objetivo

Este documento estabelece as convenções de código padronizadas para o projeto Pastor Portfolio, garantindo consistência, legibilidade e manutenibilidade.

---

## 📁 ESTRUTURA DE ARQUIVOS

### Backend

```
backend/
├── config/           # Configurações centralizadas
├── controllers/      # Controladores (se implementar)
├── dto/             # Data Transfer Objects
├── middleware/      # Middlewares
├── models/          # Modelos do MongoDB
├── repositories/    # Camada de acesso a dados (se implementar)
├── routes/          # Rotas da API
├── services/        # Lógica de negócio
├── utils/           # Utilitários
└── __tests__/       # Testes
```

### Frontend

```
frontend/src/
├── components/      # Componentes React
├── config/          # Configurações
├── hooks/           # Custom hooks
├── pages/           # Páginas/rotas
├── services/        # Serviços de API
├── utils/           # Utilitários
└── __tests__/       # Testes
```

---

## 🏷️ NOMENCLATURA

### Arquivos e Diretórios

#### Backend

- **Arquivos**: `camelCase.js`
- **Diretórios**: `camelCase`
- **Modelos**: `PascalCase.js` (ex: `Sermon.js`)
- **Serviços**: `PascalCase.js` (ex: `SermonService.js`)
- **Middlewares**: `camelCase.js` (ex: `authMiddleware.js`)
- **Rotas**: `camelCase.js` (ex: `sermons.js`)

#### Frontend

- **Componentes**: `PascalCase.js` (ex: `SermonCard.js`)
- **Hooks**: `camelCase.js` (ex: `useApi.js`)
- **Páginas**: `PascalCase.js` (ex: `Sermons.js`)
- **Serviços**: `camelCase.js` (ex: `sermonService.js`)
- **Utilitários**: `camelCase.js` (ex: `formatDate.js`)

### Variáveis e Funções

#### JavaScript/TypeScript

```javascript
// ✅ CORRETO
const userName = 'john';
const isAuthenticated = true;
const MAX_RETRY_ATTEMPTS = 3;

function getUserById(id) {
  return userService.findById(id);
}

const handleSubmit = (event) => {
  // lógica
};

// ❌ INCORRETO
const user_name = 'john';
const IsAuthenticated = true;
const maxRetryAttempts = 3;

function GetUserById(id) {
  return userService.findById(id);
}
```

#### React Components

```javascript
// ✅ CORRETO
const SermonCard = ({ sermon, onEdit }) => {
  return <div>{sermon.title}</div>;
};

const useSermonData = (id) => {
  // lógica do hook
};

// ❌ INCORRETO
const sermonCard = ({ sermon, onEdit }) => {
  return <div>{sermon.title}</div>;
};
```

---

## 📝 FORMATTAÇÃO

### Indentação

- **Espaços**: 2 espaços (não tabs)
- **Máxima largura**: 80 caracteres
- **Quebra de linha**: Unix (LF)

### Aspas

```javascript
// ✅ CORRETO
const message = 'Hello world';
const template = `Hello ${name}`;

// ❌ INCORRETO
const message = "Hello world";
```

### Ponto e Vírgula

```javascript
// ✅ CORRETO
const name = 'John';
const age = 30;

function greet() {
  return 'Hello';
}

// ❌ INCORRETO
const name = 'John'
const age = 30

function greet() {
  return 'Hello'
}
```

### Vírgulas

```javascript
// ✅ CORRETO
const user = {
  name: 'John',
  age: 30,
  email: 'john@example.com',
};

const fruits = [
  'apple',
  'banana',
  'orange',
];

// ❌ INCORRETO
const user = {
  name: 'John',
  age: 30,
  email: 'john@example.com'
};

const fruits = [
  'apple',
  'banana',
  'orange'
];
```

---

## 🔧 ESTRUTURA DE CÓDIGO

### Imports/Requires

```javascript
// ✅ CORRETO - Ordem de imports
// 1. Bibliotecas externas
import React from 'react';
import axios from 'axios';

// 2. Bibliotecas internas/relativas
import { API_ENDPOINTS } from '../config/api';

// 3. Componentes locais
import SermonCard from './SermonCard';

// 4. Estilos
import './SermonList.css';

// ❌ INCORRETO
import './SermonList.css';
import SermonCard from './SermonCard';
import React from 'react';
```

### Estrutura de Funções

```javascript
// ✅ CORRETO
async function createSermon(sermonData, userId) {
  try {
    // 1. Validação
    if (!sermonData.title) {
      throw new Error('Título é obrigatório');
    }

    // 2. Processamento
    const sermon = new Sermon({
      ...sermonData,
      createdBy: userId,
      createdAt: new Date(),
    });

    // 3. Persistência
    const savedSermon = await sermon.save();

    // 4. Retorno
    return savedSermon;
  } catch (error) {
    // 5. Tratamento de erro
    throw new AppError(error.message, 400);
  }
}
```

### Estrutura de Componentes React

```javascript
// ✅ CORRETO
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const SermonList = ({ sermons, onSermonClick }) => {
  // 1. Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Effects
  useEffect(() => {
    // lógica
  }, []);

  // 3. Handlers
  const handleSermonClick = (sermon) => {
    onSermonClick(sermon);
  };

  // 4. Renderização condicional
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // 5. Renderização principal
  return (
    <div className="sermon-list">
      {sermons.map((sermon) => (
        <SermonCard
          key={sermon.id}
          sermon={sermon}
          onClick={handleSermonClick}
        />
      ))}
    </div>
  );
};

// 6. PropTypes
SermonList.propTypes = {
  sermons: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSermonClick: PropTypes.func.isRequired,
};

export default SermonList;
```

---

## 🧪 TESTES

### Estrutura de Testes

```javascript
// ✅ CORRETO
describe('SermonService', () => {
  describe('findAll', () => {
    it('deve retornar lista paginada de sermões', async () => {
      // Arrange
      const options = { page: 1, limit: 10 };
      
      // Act
      const result = await SermonService.findAll(options);
      
      // Assert
      expect(result.sermons).toBeDefined();
      expect(result.pagination).toBeDefined();
    });

    it('deve filtrar por série quando especificado', async () => {
      // Arrange
      const options = { series: 'Evangelho' };
      
      // Act
      const result = await SermonService.findAll(options);
      
      // Assert
      expect(result.sermons).toHaveLength(5);
      expect(result.sermons[0].series).toBe('Evangelho');
    });
  });
});
```

### Nomenclatura de Testes

- **Describe**: Nome da classe/função testada
- **It**: Comportamento específico sendo testado
- **Should**: Para casos de teste específicos

---

## 📚 COMENTÁRIOS

### JSDoc para Funções

```javascript
/**
 * Busca todos os sermões com paginação e filtros
 * @param {Object} options - Opções de busca
 * @param {number} [options.page=1] - Número da página
 * @param {number} [options.limit=10] - Itens por página
 * @param {string} [options.search] - Termo de busca
 * @returns {Promise<Object>} Resultado paginado
 * @throws {AppError} Quando há erro na busca
 */
async function findAll(options = {}) {
  // implementação
}
```

### Comentários Inline

```javascript
// ✅ CORRETO
// Calcula a média das avaliações
const average = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

// Valida se o usuário tem permissão
if (!user.roles.includes('admin')) {
  throw new AppError('Acesso negado', 403);
}

// ❌ INCORRETO
// faz a média
const average = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

// verifica permissão
if (!user.roles.includes('admin')) {
  throw new AppError('Acesso negado', 403);
}
```

---

## 🔒 SEGURANÇA

### Validação de Entrada

```javascript
// ✅ CORRETO
const { error, value } = CreateSermonDTO.validate(req.body);
if (error) {
  throw new AppError('Dados inválidos', 400);
}

// ❌ INCORRETO
const sermonData = req.body; // Sem validação
```

### Sanitização

```javascript
// ✅ CORRETO
const sanitizedContent = sanitizeHtml(content, {
  allowedTags: ['p', 'strong', 'em'],
});

// ❌ INCORRETO
const content = req.body.content; // Sem sanitização
```

---

## 📊 PERFORMANCE

### Otimizações React

```javascript
// ✅ CORRETO
const SermonCard = React.memo(({ sermon, onClick }) => {
  return <div onClick={() => onClick(sermon)}>{sermon.title}</div>;
});

// ❌ INCORRETO
const SermonCard = ({ sermon, onClick }) => {
  return <div onClick={() => onClick(sermon)}>{sermon.title}</div>;
};
```

### Queries Otimizadas

```javascript
// ✅ CORRETO
const sermons = await Sermon.find(filters)
  .select('title bibleReference series date')
  .sort({ date: -1 })
  .limit(10);

// ❌ INCORRETO
const sermons = await Sermon.find(filters); // Busca todos os campos
```

---

## 🚀 DEPLOY E AMBIENTES

### Variáveis de Ambiente

```bash
# ✅ CORRETO
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/pastor-portfolio
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379

# ❌ INCORRETO
NODE_ENV=prod
DB_URL=mongodb://localhost:27017/pastor-portfolio
SECRET=your-secret-key
```

### Configuração por Ambiente

```javascript
// ✅ CORRETO
const config = {
  development: {
    logLevel: 'debug',
    corsOrigin: 'http://localhost:3000',
  },
  production: {
    logLevel: 'error',
    corsOrigin: 'https://pastor-portfolio.com',
  },
};

// ❌ INCORRETO
const logLevel = 'debug'; // Hardcoded
```

---

## 📋 CHECKLIST DE QUALIDADE

### Antes do Commit

- [ ] Código segue as convenções de nomenclatura
- [ ] Formatação aplicada (Prettier)
- [ ] Linting passa sem erros (ESLint)
- [ ] Testes passam
- [ ] Documentação atualizada (se necessário)
- [ ] Variáveis de ambiente configuradas
- [ ] Segurança verificada

### Antes do Deploy

- [ ] Build de produção bem-sucedido
- [ ] Testes de integração passam
- [ ] Performance testada
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Backup configurado

---

## 🛠️ FERRAMENTAS

### Desenvolvimento

- **ESLint**: Linting de código
- **Prettier**: Formatação automática
- **Husky**: Git hooks
- **Commitizen**: Padronização de commits

### Comandos Úteis

```bash
# Backend
npm run lint          # Verificar linting
npm run lint:fix      # Corrigir linting
npm run format        # Formatar código
npm run quality       # Executar todos os checks

# Frontend
npm run lint          # Verificar linting
npm run lint:fix      # Corrigir linting
npm run format        # Formatar código
npm run test          # Executar testes
```

---

## 📞 SUPORTE

Para dúvidas sobre as convenções:

1. Consulte este documento
2. Verifique exemplos no código
3. Abra uma issue no repositório
4. Consulte a documentação das ferramentas

---

*Última atualização: ${new Date().toLocaleDateString('pt-BR')}*
