#!/usr/bin/env node
// scripts/testSimple.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSimpleRateLimit() {
    console.log('🧪 TESTE SIMPLES DE RATE LIMITING\n');

    try {
        // Primeiro, vamos testar com um IP simulado
        console.log('📡 Testando endpoint de simulação...');

        const testData = {
            username: 'test',
            password: 'wrong',
            fakeIp: '203.0.113.1'
        };

        console.log('🎯 Fazendo 12 tentativas de login com IP simulado...\n');

        for (let i = 1; i <= 12; i++) {
            try {
                const startTime = Date.now();

                const response = await axios.post(`${BASE_URL}/api/test/simulate-login`, testData, {
                    timeout: 10000,
                    validateStatus: () => true
                });

                const duration = Date.now() - startTime;

                console.log(`Tentativa ${i}:`);
                console.log(`  Status: ${response.status}`);
                console.log(`  Duração: ${duration}ms`);
                console.log(`  Mensagem: ${response.data.message || 'N/A'}`);

                if (response.data.rateLimitInfo) {
                    console.log(`  Rate Limit Info: ${JSON.stringify(response.data.rateLimitInfo)}`);
                }

                if (response.status === 429) {
                    console.log('  🚨 RATE LIMIT ATIVADO!\n');

                    // Verifica status
                    console.log('📊 Verificando status após bloqueio...');
                    const statusResponse = await axios.get(`${BASE_URL}/api/test/check-attempts?ip=203.0.113.1`, {
                        validateStatus: () => true
                    });

                    if (statusResponse.status === 200) {
                        console.log(`Status: ${JSON.stringify(statusResponse.data, null, 2)}`);
                    }

                    break;
                } else {
                    console.log('  ✅ Tentativa permitida');
                }

                console.log('');

                // Pequeno delay
                await new Promise(resolve => setTimeout(resolve, 300));

            } catch (error) {
                console.error(`  ❌ Erro na tentativa ${i}:`, error.message);
                break;
            }
        }

        console.log('\n🎉 Teste concluído!');

    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

// Executa o teste
testSimpleRateLimit();
