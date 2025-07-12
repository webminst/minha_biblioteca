# 🔒 Configuração de Segurança - Variáveis de Ambiente

## ⚠️ IMPORTANTE - SEGURANÇA

Este projeto utiliza variáveis de ambiente para configurações sensíveis. **NUNCA** commite arquivos `.env` com credenciais reais.

## 📁 Estrutura de Arquivos de Ambiente

```
/
├── .env.example                    # Template público (commitado)
├── .env.local.example             # Template frontend (commitado)  
├── .env.local                     # Configuração local frontend (NÃO commitado)
└── backend/
    ├── .env.example               # Template backend (commitado)
    └── .env                       # Configuração local backend (NÃO commitado)
```

## 🚀 Configuração Inicial

### 1. Frontend (.env.local)
```bash
# Copie o arquivo exemplo
cp .env.local.example .env.local

# Configure a URL da API
REACT_APP_API_URL=http://localhost:3002
```

### 2. Backend (.env)
```bash
# Vá para o diretório backend
cd backend

# Copie o arquivo exemplo
cp .env.example .env

# Configure as variáveis:
PORT=3002
MONGODB_URI=sua_connection_string_mongodb
JWT_SECRET=sua_chave_jwt_segura_de_64_caracteres
NODE_ENV=development
```

## 🔑 Gerando JWT_SECRET Seguro

```bash
# Gere uma chave de 64 bytes (128 caracteres hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🛡️ Boas Práticas de Segurança

1. **JWT_SECRET**: Mínimo 64 caracteres, use gerador criptográfico
2. **MongoDB**: Use connection string com credenciais específicas
3. **Produção**: Use variáveis de ambiente do servidor/PaaS
4. **Backup**: Mantenha backup seguro das credenciais de produção
5. **Rotação**: Troque credenciais periodicamente

## 🚨 Recuperação de Credenciais Expostas

Se credenciais foram expostas:

1. **Imediato**: Revogue/altere todas as credenciais expostas
2. **MongoDB**: Altere senha do usuário no MongoDB Atlas
3. **JWT**: Gere novo secret (invalidará sessões ativas)
4. **Git**: Remove histórico se necessário com `git filter-branch`

## 📋 Checklist de Deployment

- [ ] Arquivo `.env` não está no repositório
- [ ] `.gitignore` inclui todos os arquivos sensíveis
- [ ] Credenciais de produção são diferentes das de desenvolvimento
- [ ] JWT_SECRET é forte e único por ambiente
- [ ] Connection strings usam usuários com permissões mínimas

## 🔗 Links Úteis

- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
