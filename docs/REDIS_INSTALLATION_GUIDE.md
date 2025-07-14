# 🚀 Guia Completo: Instalação Redis no Windows

## ✅ **Arquivo redis.js corrigido!**

O arquivo `backend/config/redis.js` foi corrigido e está pronto para usar.

---

## 📋 **Opções de Instalação Redis no Windows**

### **🥇 Opção 1: Memurai (Recomendada para Windows)**

**Memurai** é uma versão do Redis otimizada para Windows, totalmente compatível.

#### **📥 Download e Instalação:**
1. Acesse: https://www.memurai.com/
2. Baixe a versão **Developer** (gratuita)
3. Execute o instalador
4. Redis estará disponível como serviço Windows

#### **🚀 Iniciar Memurai:**
```powershell
# Iniciar serviço
Start-Service Memurai

# Verificar se está rodando
Get-Service Memurai
```

---

### **🥈 Opção 2: Redis MSI (Microsoft Archive)**

#### **📥 Download:**
1. Acesse: https://github.com/microsoftarchive/redis/releases
2. Baixe: `Redis-x64-3.0.504.msi`
3. Execute o instalador

#### **🚀 Iniciar Redis:**
```powershell
# Navegar para diretório do Redis
cd "C:\Program Files\Redis"

# Iniciar servidor
.\redis-server.exe
```

---

### **🥉 Opção 3: Redis via WSL2 (Se quiser usar WSL)**

Se você quiser usar WSL2 (que você já tem instalado):

#### **📥 Instalar Ubuntu no WSL:**
```powershell
# No PowerShell como Admin
wsl --install -d Ubuntu
```

#### **📥 Instalar Redis no Ubuntu:**
```bash
# Dentro do Ubuntu WSL
sudo apt update
sudo apt install redis-server

# Iniciar Redis
sudo service redis-server start

# Testar
redis-cli ping
```

---

### **🎯 Opção 4: Docker Desktop (Se tiver Docker)**

#### **📥 Instalar Docker Desktop:**
1. Baixe: https://www.docker.com/products/docker-desktop
2. Instale e reinicie o PC

#### **🚀 Executar Redis via Docker:**
```powershell
# Executar Redis em container
docker run --name redis-pastor -p 6379:6379 -d redis:latest

# Verificar se está rodando
docker ps

# Parar container
docker stop redis-pastor

# Iniciar novamente
docker start redis-pastor
```

---

## 🎯 **Recomendação: Use Memurai**

**Por que Memurai é a melhor opção:**
- ✅ **Nativo Windows** - Melhor performance
- ✅ **Instalação simples** - MSI installer
- ✅ **Serviço Windows** - Inicia automaticamente
- ✅ **100% compatível** com Redis
- ✅ **Suporte profissional**

---

## 🚀 **Instalação Rápida: Memurai**

### **Passo 1: Download**
```
https://www.memurai.com/get-memurai
```

### **Passo 2: Instalar**
- Execute o `.msi`
- Aceite configurações padrão
- Confirme instalação

### **Passo 3: Verificar**
```powershell
# Verificar se o serviço está rodando
Get-Service Memurai

# Se não estiver, iniciar
Start-Service Memurai
```

### **Passo 4: Testar Conexão**
```powershell
# Instalar redis-cli (opcional)
# Ou usar telnet para testar
telnet localhost 6379
```

---

## 🔧 **Configuração no Projeto**

Após instalar Redis/Memurai, o projeto já está configurado:

### **✅ Variáveis de Ambiente (.env):**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_ENABLED=true
```

### **✅ Testar a Aplicação:**
```bash
# Iniciar aplicação
npm run dev

# Testar endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/books
```

---

## 📊 **Verificar se Está Funcionando**

### **1. Status da Aplicação:**
```
GET http://localhost:3001/health
```
**Resposta esperada:**
```json
{
  "status": "ok",
  "services": {
    "mongodb": "connected",
    "redis": {
      "connected": true,
      "error": null
    }
  }
}
```

### **2. Headers de Cache:**
```
GET http://localhost:3001/api/books
```
**Headers esperados:**
```
X-Cache: MISS  (primeira requisição)
X-Cache: HIT   (segunda requisição)
```

### **3. Logs do Servidor:**
```
✅ Conectado ao MongoDB!
🔗 Conectando ao Redis...
✅ Redis conectado com sucesso!
📍 Host: localhost:6379
🗄️  Database: 0
🚀 Todas as conexões estabelecidas!
```

---

## ❓ **Solução de Problemas**

### **Redis não conecta:**
```javascript
// Logs esperados se Redis não estiver rodando:
⚠️ Redis não conectado, usando fallback
❌ Erro na conexão Redis: connect ECONNREFUSED 127.0.0.1:6379
```

**Solução:**
1. Verificar se Redis/Memurai está rodando
2. Verificar porta 6379
3. Aplicação continuará funcionando sem cache

### **Porta 6379 ocupada:**
```env
# Alterar porta no .env
REDIS_PORT=6380
```

---

## 🎉 **Próximos Passos**

1. **Instalar Memurai** (recomendado)
2. **Iniciar aplicação** com `npm run dev`
3. **Testar cache** acessando `/api/books` duas vezes
4. **Monitorar performance** via headers X-Cache

**📞 Precisa de ajuda?** Escolha uma opção e me avise se encontrar algum problema!
