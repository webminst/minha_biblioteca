#!/usr/bin/env node
// scripts/testRateLimitingReal.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_IP = '203.0.113.1'; // IP de teste da RFC

/**
 * Script para testar o Rate Limiting com IP simulado
 */
class RealRateLimitTester {
    constructor() {
        this.baseURL = BASE_URL;
        this.testIP = TEST_IP;
        this.results = [];
    }

    async resetRateLimit() {
        try {
            console.log(`🔄 Resetando rate limiting para IP ${this.testIP}...`);

            const response = await axios.delete(`${this.baseURL}/api/test/reset-rate-limit/${this.testIP}`, {
                validateStatus: () => true
            });

            if (response.status === 200) {
                console.log(`✅ Rate limiting resetado. Chaves removidas: ${response.data.removedKeys}`);
            } else {
                console.log(`⚠️ Erro ao resetar: ${response.data.message}`);
            }
            console.log('');
        } catch (error) {
            console.error('Erro ao resetar:', error.message);
        }
    }

    async checkAttempts() {
        try {
            const response = await axios.get(`${this.baseURL}/api/test/check-attempts/${this.testIP}`, {
                validateStatus: () => true
            });

            if (response.status === 200) {
                const data = response.data;
                console.log(`📊 Status do IP ${this.testIP}:`);
                console.log(`  Login attempts: ${data.attempts.login}`);
                console.log(`  Auth attempts: ${data.attempts.auth}`);
                console.log(`  Bloqueado: ${data.blocked ? 'SIM' : 'NÃO'}`);

                if (data.blocked) {
                    console.log(`  Motivo: ${data.blocked.reason}`);
                    console.log(`  Bloqueado em: ${new Date(data.blocked.blockedAt)}`);
                }
                console.log('');

                return data;
            }
        } catch (error) {
            console.error('Erro ao verificar tentativas:', error.message);
        }

        return null;
    }

    async testRateLimit() {
        console.log('🧪 TESTANDO RATE LIMITING COM IP SIMULADO\n');
        console.log('=' * 50);

        // Reset inicial
        await this.resetRateLimit();

        // Verifica status inicial
        await this.checkAttempts();

        console.log(`🎯 Testando login com IP simulado: ${this.testIP}\n`);

        const invalidCredentials = {
            username: 'teste_rate_limit',
            password: 'senha_errada'
        };

        for (let i = 1; i <= 15; i++) {
            try {
                const startTime = Date.now();

                console.log(`Tentativa ${i}:`);

                const response = await axios.post(
                    `${this.baseURL}/api/test/simulate-login/${this.testIP}`,
                    invalidCredentials,
                    {
                        timeout: 10000,
                        validateStatus: () => true
                    }
                );

                const duration = Date.now() - startTime;

                this.results.push({
                    attempt: i,
                    status: response.status,
                    duration,
                    message: response.data.message,
                    attemptsRemaining: response.data.attemptsRemaining,
                    retryAfter: response.data.retryAfter,
                    rateLimitInfo: response.data.rateLimitInfo
                });

                console.log(`  Status: ${response.status}`);
                console.log(`  Duração: ${duration}ms`);
                console.log(`  Mensagem: ${response.data.message}`);

                if (response.data.rateLimitInfo) {
                    console.log(`  Tentativas restantes: ${response.data.rateLimitInfo.attemptsRemaining}`);
                    console.log(`  Tentativas atuais: ${response.data.rateLimitInfo.attempts}`);
                }

                if (response.data.retryAfter) {
                    console.log(`  Retry após: ${response.data.retryAfter}s`);
                }

                if (response.status === 429) {
                    console.log('  🚨 RATE LIMIT ATIVADO!');

                    // Verifica status após bloqueio
                    console.log('\n  📊 Status após bloqueio:');
                    await this.checkAttempts();
                    break;
                } else {
                    console.log('  ✅ Tentativa permitida');
                }

                console.log('');

                // Pequeno delay entre tentativas
                await this.sleep(200);

            } catch (error) {
                console.error(`  ❌ Erro na tentativa ${i}:`, error.message);
                break;
            }
        }

        this.printSummary();
    }

    printSummary() {
        console.log('\n📊 RESUMO DOS TESTES\n');
        console.log('Rate Limiting com IP Simulado:');

        const allowedAttempts = this.results.filter(r => r.status !== 429).length;
        const blockedAttempts = this.results.filter(r => r.status === 429).length;

        console.log(`  ✅ Tentativas permitidas: ${allowedAttempts}`);
        console.log(`  🚨 Tentativas bloqueadas: ${blockedAttempts}`);

        if (blockedAttempts > 0) {
            const firstBlock = this.results.find(r => r.status === 429);
            console.log(`  🎯 Bloqueado na tentativa: ${firstBlock.attempt}`);
            console.log('  ✅ Rate Limiting funcionando corretamente!');
        } else {
            console.log('  ⚠️  Rate Limiting pode não estar ativo');
        }

        // Mostra configuração detectada
        const lastResult = this.results[this.results.length - 1];
        if (lastResult && lastResult.rateLimitInfo) {
            console.log(`\n🔧 Configuração detectada:`);
            console.log(`  Máximo de tentativas: ${lastResult.rateLimitInfo.maxAttempts}`);
            console.log(`  Tipo: ${lastResult.rateLimitInfo.type}`);
        }

        console.log('\n🎉 Testes concluídos!');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Executa os testes se chamado diretamente
if (require.main === module) {
    const tester = new RealRateLimitTester();
    tester.testRateLimit().catch(console.error);
}

module.exports = RealRateLimitTester;
