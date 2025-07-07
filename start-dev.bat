@echo off
REM Script para iniciar o ambiente de desenvolvimento no Windows
REM Executa o backend e frontend simultaneamente

echo 🚀 Iniciando Pastor Portfolio em modo desenvolvimento...

REM Verifica se existe node_modules
if not exist "node_modules" (
    echo 📦 Instalando dependências do frontend...
    call npm install
)

if not exist "backend\node_modules" (
    echo 📦 Instalando dependências do backend...
    cd backend
    call npm install
    cd ..
)

REM Verifica se existe .env no backend
if not exist "backend\.env" (
    echo ⚠️  Arquivo .env não encontrado no backend.
    echo 📋 Copie o arquivo .env.example para .env e configure as variáveis.
    pause
    exit /b 1
)

REM Inicia os serviços
echo 🎯 Iniciando backend na porta 3001...
echo 🌐 Iniciando frontend na porta 3000...
echo 📱 Acesse: http://localhost:3000
echo 🔧 API: http://localhost:3001
echo ⚡ Admin: http://localhost:3000/admin

REM Executa ambos os serviços
call npm run dev
