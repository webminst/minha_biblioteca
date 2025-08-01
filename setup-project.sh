#!/bin/bash

# Script de Setup do Projeto Pastor Portfolio
# Este script configura o ambiente de desenvolvimento com todas as ferramentas necessárias

set -e

echo "🚀 Iniciando setup do projeto Pastor Portfolio..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js não encontrado. Por favor, instale o Node.js versão 16 ou superior."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js versão 16 ou superior é necessária. Versão atual: $(node -v)"
        exit 1
    fi
    
    print_message "Node.js $(node -v) encontrado"
}

# Verificar se npm está instalado
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm não encontrado. Por favor, instale o npm."
        exit 1
    fi
    
    print_message "npm $(npm -v) encontrado"
}

# Instalar dependências do backend
setup_backend() {
    print_info "Configurando backend..."
    
    cd backend
    
    # Instalar dependências
    print_info "Instalando dependências do backend..."
    npm install
    
    # Verificar se as dependências foram instaladas corretamente
    if [ ! -d "node_modules" ]; then
        print_error "Falha ao instalar dependências do backend"
        exit 1
    fi
    
    print_message "Dependências do backend instaladas"
    
    # Executar linting para verificar qualidade do código
    print_info "Verificando qualidade do código (backend)..."
    if npm run lint &> /dev/null; then
        print_message "Linting do backend passou"
    else
        print_warning "Linting do backend encontrou problemas. Execute 'npm run lint:fix' para corrigir."
    fi
    
    cd ..
}

# Instalar dependências do frontend
setup_frontend() {
    print_info "Configurando frontend..."
    
    cd frontend
    
    # Instalar dependências
    print_info "Instalando dependências do frontend..."
    npm install
    
    # Verificar se as dependências foram instaladas corretamente
    if [ ! -d "node_modules" ]; then
        print_error "Falha ao instalar dependências do frontend"
        exit 1
    fi
    
    print_message "Dependências do frontend instaladas"
    
    # Executar linting para verificar qualidade do código
    print_info "Verificando qualidade do código (frontend)..."
    if npm run lint &> /dev/null; then
        print_message "Linting do frontend passou"
    else
        print_warning "Linting do frontend encontrou problemas. Execute 'npm run lint:fix' para corrigir."
    fi
    
    cd ..
}

# Configurar variáveis de ambiente
setup_env() {
    print_info "Configurando variáveis de ambiente..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Configurações do Servidor
NODE_ENV=development
PORT=3001

# Configurações do Banco de Dados
MONGODB_URI=mongodb://localhost:27017/pastor-portfolio

# Configurações de Autenticação
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Configurações do Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Configurações de Segurança
CORS_ORIGIN=http://localhost:3000

# Configurações de Auditoria
AUDIT_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_RETENTION_DAYS=90

# Configurações de Logs
LOG_LEVEL=debug

# Configurações de 2FA
TWO_FACTOR_ISSUER=Pastor Portfolio

# Configurações do Swagger
SWAGGER_ENABLED=true
EOF
        print_message "Arquivo .env do backend criado"
    else
        print_warning "Arquivo .env do backend já existe"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# Configurações da API
REACT_APP_API_URL=http://localhost:3001/api

# Configurações de Desenvolvimento
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# Configurações de Analytics (opcional)
REACT_APP_GA_TRACKING_ID=

# Configurações de Recaptcha (opcional)
REACT_APP_RECAPTCHA_SITE_KEY=
EOF
        print_message "Arquivo .env do frontend criado"
    else
        print_warning "Arquivo .env do frontend já existe"
    fi
}

# Verificar se MongoDB está rodando
check_mongodb() {
    print_info "Verificando conexão com MongoDB..."
    
    if command -v mongosh &> /dev/null; then
        if mongosh --eval "db.runCommand('ping')" &> /dev/null; then
            print_message "MongoDB está rodando"
        else
            print_warning "MongoDB não está rodando. Inicie o MongoDB antes de executar o projeto."
        fi
    else
        print_warning "MongoDB não encontrado. Certifique-se de que o MongoDB está instalado e rodando."
    fi
}

# Verificar se Redis está rodando
check_redis() {
    print_info "Verificando conexão com Redis..."
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping &> /dev/null; then
            print_message "Redis está rodando"
        else
            print_warning "Redis não está rodando. Inicie o Redis antes de executar o projeto."
        fi
    else
        print_warning "Redis não encontrado. Certifique-se de que o Redis está instalado e rodando."
    fi
}

# Executar testes
run_tests() {
    print_info "Executando testes..."
    
    # Testes do backend
    cd backend
    print_info "Executando testes do backend..."
    if npm test &> /dev/null; then
        print_message "Testes do backend passaram"
    else
        print_warning "Alguns testes do backend falharam"
    fi
    cd ..
    
    # Testes do frontend
    cd frontend
    print_info "Executando testes do frontend..."
    if npm test -- --watchAll=false &> /dev/null; then
        print_message "Testes do frontend passaram"
    else
        print_warning "Alguns testes do frontend falharam"
    fi
    cd ..
}

# Mostrar próximos passos
show_next_steps() {
    echo ""
    echo "🎉 Setup concluído com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo ""
    echo "1. Configure o MongoDB e Redis:"
    echo "   - MongoDB: mongod"
    echo "   - Redis: redis-server"
    echo ""
    echo "2. Inicie o backend:"
    echo "   cd backend && npm run dev"
    echo ""
    echo "3. Inicie o frontend (em outro terminal):"
    echo "   cd frontend && npm start"
    echo ""
    echo "4. Acesse a aplicação:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:3001"
    echo "   - Documentação: http://localhost:3001/api-docs"
    echo ""
    echo "5. Comandos úteis:"
    echo "   - Backend linting: cd backend && npm run lint:fix"
    echo "   - Frontend linting: cd frontend && npm run lint:fix"
    echo "   - Executar testes: npm test (em cada diretório)"
    echo ""
    echo "📚 Documentação:"
    echo "   - Convenções de código: CONVENCOES_CODIGO.md"
    echo "   - Avaliação do projeto: AVALIACAO_COMPLETA_PROJETO.md"
    echo ""
}

# Função principal
main() {
    echo "=========================================="
    echo "   SETUP DO PROJETO PASTOR PORTFOLIO"
    echo "=========================================="
    echo ""
    
    # Verificações iniciais
    check_node
    check_npm
    
    # Setup do projeto
    setup_backend
    setup_frontend
    setup_env
    
    # Verificações de serviços
    check_mongodb
    check_redis
    
    # Executar testes
    run_tests
    
    # Mostrar próximos passos
    show_next_steps
}

# Executar função principal
main "$@" 