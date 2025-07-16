# 🚀 Guia de Implementação 2FA - Passo a Passo

## 📋 Pré-requisitos

Antes de começar, certifique-se de que o projeto está funcionando corretamente com:
- ✅ Sistema de autenticação atual funcionando
- ✅ MongoDB conectado
- ✅ Redis funcionando (para rate limiting)
- ✅ Variáveis de ambiente configuradas

---

## 🔧 Passo 1: Instalação de Dependências

### Backend Dependencies:
```bash
cd backend
npm install speakeasy qrcode
```

### Verificar Instalação:
```bash
npm list speakeasy qrcode
```

---

## 🗄️ Passo 2: Atualização do Model User

### 2.1 Backup do Model Atual
```bash
cp models/User.js models/User.js.backup
```

### 2.2 Adicionar Campos 2FA
Editar `backend/models/User.js` e adicionar após o campo `role`:

```javascript
// Adicionar após linha ~20 (depois do campo role)
twoFactorAuth: {
  enabled: {
    type: Boolean,
    default: false
  },
  secret: {
    type: String,
    default: null
  },
  backupCodes: [{
    code: {
      type: String,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: {
      type: Date,
      default: null
    }
  }],
  setupAt: {
    type: Date,
    default: null
  },
  lastVerified: {
    type: Date,
    default: null
  }
},
```

### 2.3 Adicionar Métodos Helper
Adicionar antes do `module.exports`:

```javascript
// Métodos para 2FA
UserSchema.methods.isTwoFactorEnabled = function() {
  return this.twoFactorAuth.enabled;
};

UserSchema.methods.getBackupCodesCount = function() {
  return this.twoFactorAuth.backupCodes.filter(code => !code.used).length;
};
```

---

## 🔨 Passo 3: Criar Serviço 2FA

### 3.1 Criar Diretório e Arquivo
```bash
mkdir -p backend/services
touch backend/services/TwoFactorService.js
```

### 3.2 Implementar TwoFactorService
Copiar conteúdo do arquivo `docs/EXAMPLES_2FA_SERVICE.js` para `backend/services/TwoFactorService.js`

---

## 🛣️ Passo 4: Criar Rotas 2FA

### 4.1 Criar Arquivo de Rotas
```bash
touch backend/routes/auth2fa.js
```

### 4.2 Implementar Rotas
Copiar conteúdo do arquivo `docs/EXAMPLES_2FA_ROUTES.js` para `backend/routes/auth2fa.js`

### 4.3 Registrar Rotas no Server
Editar `backend/server.js` e adicionar:

```javascript
// Adicionar após outras rotas de auth
const auth2faRoutes = require('./routes/auth2fa');
app.use('/api/auth/2fa', auth2faRoutes);
```

---

## 🔄 Passo 5: Modificar Login Existente

### 5.1 Backup da Rota de Login
```bash
cp routes/auth.js routes/auth.js.backup
```

### 5.2 Modificar Lógica de Login
Na função de login em `routes/auth.js`, adicionar após verificação de senha:

```javascript
// Importar no topo do arquivo
const twoFactorService = require('../services/TwoFactorService');

// Adicionar após verificação de senha (~linha 110)
// ========== LÓGICA 2FA ==========
if (user.twoFactorAuth.enabled) {
  if (!req.body.twoFactorCode) {
    const tempToken = generateSecureToken(
      { id: user._id, role: user.role }, 
      'partial_auth'
    );

    return res.json({
      success: false,
      requiresTwoFactor: true,
      tempToken: tempToken,
      message: 'Código 2FA necessário',
      expiresIn: '5m'
    });
  }

  const is2FAValid = await twoFactorService.verifyLogin(user, req.body.twoFactorCode);
  if (!is2FAValid) {
    return res.status(401).json({
      success: false,
      message: 'Código 2FA inválido'
    });
  }
}
```

---

## 🔧 Passo 6: Atualizar JWT Security

### 6.1 Adicionar Novo Tipo de Token
Em `middleware/jwtSecurity.js`, atualizar `JWT_CONFIG`:

```javascript
const JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    PARTIAL_AUTH_EXPIRY: process.env.JWT_PARTIAL_EXPIRY || '5m', // NOVO
    // ... resto da configuração
};
```

### 6.2 Atualizar Função generateSecureToken
Adicionar case para 'partial_auth':

```javascript
// Na função generateSecureToken, atualizar switch
switch (type) {
    case 'access':
        expiry = JWT_CONFIG.ACCESS_TOKEN_EXPIRY;
        break;
    case 'refresh':
        expiry = JWT_CONFIG.REFRESH_TOKEN_EXPIRY;
        break;
    case 'partial_auth': // NOVO
        expiry = JWT_CONFIG.PARTIAL_AUTH_EXPIRY;
        break;
    default:
        throw new Error(`Tipo de token inválido: ${type}`);
}
```

---

## 🌍 Passo 7: Configurar Variáveis de Ambiente

### 7.1 Adicionar ao .env
```bash
# 2FA Configuration
ENABLE_2FA=true
TOTP_ISSUER=Pastor-Portfolio
TOTP_WINDOW=1
BACKUP_CODES_COUNT=10
JWT_PARTIAL_EXPIRY=5m
```

### 7.2 Atualizar .env.example
```bash
echo "
# 2FA Configuration
ENABLE_2FA=true
TOTP_ISSUER=Pastor-Portfolio
TOTP_WINDOW=1
BACKUP_CODES_COUNT=10
JWT_PARTIAL_EXPIRY=5m" >> backend/.env.example
```

---

## 🧪 Passo 8: Testes Básicos

### 8.1 Testar Serviço 2FA
```bash
cd backend
node -e "
const twoFactorService = require('./services/TwoFactorService');
console.log('✅ TwoFactorService carregado com sucesso');
"
```

### 8.2 Testar Rotas (com servidor rodando)
```bash
# Testar status 2FA (requer autenticação)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth/2fa/status
```

### 8.3 Verificar Logs
Verificar se não há erros no console do servidor.

---

## 🎨 Passo 9: Interface Frontend (Opcional)

### 9.1 Componente Setup 2FA
Criar `frontend/src/components/TwoFactorSetup.js`:

```javascript
import React, { useState } from 'react';

const TwoFactorSetup = () => {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  // Implementar lógica do componente
  
  return (
    <div className="two-factor-setup">
      {/* Interface para setup 2FA */}
    </div>
  );
};

export default TwoFactorSetup;
```

### 9.2 Modificar Login Component
Adicionar campo para código 2FA quando `requiresTwoFactor: true`.

---

## ✅ Passo 10: Validação Final

### 10.1 Checklist de Verificação
- [ ] Dependências instaladas sem erro
- [ ] Model User atualizado
- [ ] Serviço 2FA funcional
- [ ] Rotas 2FA registradas
- [ ] Login modificado corretamente
- [ ] JWT Security atualizado
- [ ] Variáveis de ambiente configuradas
- [ ] Testes básicos passando
- [ ] Logs sem erros

### 10.2 Teste Completo do Fluxo
1. **Setup 2FA:**
   ```bash
   POST /api/auth/2fa/setup
   Authorization: Bearer <token>
   ```

2. **Ativar 2FA:**
   ```bash
   POST /api/auth/2fa/enable
   Authorization: Bearer <token>
   Body: { "secret": "...", "verificationCode": "123456" }
   ```

3. **Login com 2FA:**
   ```bash
   POST /api/auth/login
   Body: { "username": "admin", "password": "senha", "twoFactorCode": "123456" }
   ```

---

## 🚨 Solução de Problemas

### Erro: "speakeasy not found"
```bash
cd backend && npm install speakeasy qrcode
```

### Erro: "Cannot read property 'twoFactorAuth'"
Verificar se o User Model foi atualizado corretamente e o servidor reiniciado.

### Erro: "JWT_SECRET não configurado"
Verificar se as variáveis de ambiente estão sendo carregadas.

### QR Code não aparece
Verificar se a rota `/setup` está retornando os dados corretos.

---

## 📖 Próximos Passos

1. **Implementar interface frontend completa**
2. **Adicionar testes automatizados**
3. **Configurar dispositivos confiáveis**
4. **Implementar logs de auditoria específicos para 2FA**
5. **Criar documentação para usuários finais**

---

## 🔗 Recursos e Referências

- [Speakeasy Documentation](https://github.com/speakeasyjs/speakeasy)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)
- [Authy](https://authy.com/)

---

*Guia criado em: 16/07/2025*
*Versão: 1.0*
*Status: Pronto para implementação*
