# Configuração de Portas do Projeto

## Padronização de Portas

### ✅ **Configuração Atual (Corrigida)**

| Serviço | Porta | Descrição |
|---------|--------|-----------|
| **Frontend (React)** | `3000` | Aplicação React (padrão react-scripts) |
| **Backend (Express)** | `3001` | API REST do servidor |

### 📝 **Detalhes Técnicos**

#### Frontend React
- **Porta**: 3000 (padrão do react-scripts)
- **Configuração**: Automática, não precisa de variável PORT
- **Acesso**: http://localhost:3000
- **Variável importante**: `REACT_APP_API_URL=http://localhost:3001`

#### Backend Express
- **Porta**: 3001 (configurada via backend/.env)
- **Configuração**: `PORT=3001` no arquivo `backend/.env`
- **Acesso**: http://localhost:3001
- **API**: http://localhost:3001/api/*

### 🚀 **Como Executar**

```bash
# Executar tudo junto (recomendado)
npm run dev

# Ou executar separadamente:
npm run dev:frontend  # React na porta 3000
npm run dev:backend   # Express na porta 3001
```

### ⚠️ **Observações Importantes**

1. **Frontend se conecta ao Backend**: O React na porta 3000 faz requisições para a API na porta 3001
2. **Variável REACT_APP_API_URL**: É crucial para que o frontend saiba onde encontrar a API
3. **Ambiente de Produção**: As portas podem ser diferentes e configuradas via variáveis de ambiente

### 🔧 **Resolução de Problemas**

- **Erro de conexão**: Verifique se `REACT_APP_API_URL` aponta para a porta correta do backend
- **Porta ocupada**: O sistema escolherá automaticamente a próxima porta disponível
- **CORS**: Já está configurado no backend para aceitar requisições do frontend

### 📋 **Histórico de Mudanças**

- **Antes**: Backend na porta 3002, configuração inconsistente
- **Depois**: Backend na porta 3001, configuração padronizada e documentada
