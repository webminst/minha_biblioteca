// test-audit.js
const axios = require('axios');

async function testAuditSystem() {
    try {
        console.log('Testando sistema de auditoria...\n');

        // 1. Teste de health check
        console.log('1️⃣ Testando health check...');
        const healthResponse = await axios.get('http://localhost:3001/api/audit/health', {
            headers: {
                'Authorization': 'Bearer test' // Só para testar a rota
            }
        }).catch(error => {
            console.log('   ❌ Health Check Error:', error.response?.status, error.response?.data?.message);
            return { data: null, status: error.response?.status };
        });

        if (healthResponse?.data) {
            console.log('   ✅ Health Check OK:', healthResponse.data.success);
        }

        // 2. Teste de config
        console.log('\n2️⃣ Testando configuração...');
        const configResponse = await axios.get('http://localhost:3001/api/audit/config', {
            headers: {
                'Authorization': 'Bearer test'
            }
        }).catch(error => {
            console.log('   ❌ Config Error:', error.response?.status, error.response?.data?.message);
            return { data: null };
        });

        if (configResponse?.data) {
            console.log('   ✅ Config OK:', configResponse.data.success);
        }

        // 3. Teste Redis direto
        console.log('\n3️⃣ Testando Redis diretamente...');
        const { isRedisConnected } = require('./backend/config/redis');
        const redisStatus = isRedisConnected();
        console.log('   Redis Status:', redisStatus ? '✅ Conectado' : '❌ Desconectado');

        console.log('\nResumo dos testes:');
        console.log('   Health:', healthResponse?.data ? '✅' : '❌');
        console.log('   Config:', configResponse?.data ? '✅' : '❌');
        console.log('   Redis:', redisStatus ? '✅' : '❌');

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

testAuditSystem();
