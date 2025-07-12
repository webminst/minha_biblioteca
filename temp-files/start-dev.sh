#!/bin/bash

# Script para iniciar o ambiente de desenvolvimento
# Executa o backend e frontend simultaneamente

echo "🚀 Iniciando Pastor Portfolio em modo desenvolvimento..."

# Verifica se o MongoDB está rodando
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB não está rodando. Inicie o MongoDB primeiro."
    exit 1
fi

# Instala dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

# Verifica se existe .env no backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Arquivo .env não encontrado no backend."
    echo "📋 Copie o arquivo .env.example para .env e configure as variáveis."
    exit 1
fi

# Inicia os serviços
echo "🎯 Iniciando backend na porta 3001..."
echo "🌐 Iniciando frontend na porta 3000..."
echo "📱 Acesse: http://localhost:3000"
echo "🔧 API: http://localhost:3001"
echo "⚡ Admin: http://localhost:3000/admin"

# Executa ambos os serviços
npm run dev
