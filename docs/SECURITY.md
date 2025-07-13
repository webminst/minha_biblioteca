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

# Configure as variáveis necessárias
REACT_APP_API_URL=http://localhost:3001
REACT_APP_PIX_KEY=sua_chave_pix_aqui
REACT_APP_BANK_NAME=Nome_do_Banco
REACT_APP_ACCOUNT_HOLDER=Nome_do_Titular
```

### 2. Backend (.env)
```bash
# Vá para o diretório backend
cd backend

# Copie o arquivo exemplo
cp .env.example .env

# Configure as variáveis:
PORT=3001
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
- [ ] Informações PIX configuradas via variáveis de ambiente
- [ ] Nenhuma informação sensível hardcodada no código

## ✅ Correções de Segurança Implementadas

### Item 4 - Credenciais Expostas (RESOLVIDO)
- ✅ Chave PIX removida do código fonte
- ✅ Informações financeiras movidas para variáveis de ambiente
- ✅ Interface adaptável baseada na configuração
- ✅ Validação automática em desenvolvimento

### Arquivos Afetados:
- `src/pages/SupportPage.js` - Implementação segura
- `src/utils/securityValidator.js` - Validação automática
- `.env.example` / `.env.local.example` - Configuração documentada

### Item 3 - JWT_SECRET Fraco (RESOLVIDO)
- ✅ JWT_SECRET fortalecido (131 caracteres criptográficos)
- ✅ Sistema de refresh tokens implementado
- ✅ Access tokens com expiração curta (15 minutos)
- ✅ Rate limiting para login (5 tentativas/15min)
- ✅ Headers de segurança aplicados globalmente
- ✅ Validação automática de configuração
- ✅ Proteção contra replay attacks (JTI único)

### Arquivos de Segurança JWT:
- `backend/utils/jwtSecurityUtils.js` - Gerador e validador de chaves
- `backend/middleware/jwtSecurity.js` - Sistema JWT aprimorado
- `backend/routes/auth.js` - Autenticação com refresh tokens
- `backend/middleware/authMiddleware.js` - Middleware seguro

## 🔗 Links Úteis

- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
