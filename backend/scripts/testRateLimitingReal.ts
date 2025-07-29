#!/usr/bin/env ts-node
// scripts/testRateLimitingReal.ts

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const TEST_IP = '203.0.113.1'; // IP de teste da RFC

/**
 * Script para testar o Rate Limiting com IP simulado
 */
class RealRateLimitTester {
    baseURL: string;
    testIP: string;
    results: any[];

    constructor() {
        this.baseURL = BASE_URL;
        this.testIP = TEST_IP;
        this.results = [];
    }

    async resetRateLimit(): Promise<void> {
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
        } catch (error: any) {
            console.error('Erro ao resetar:', error.message);
        }
    }

    async checkAttempts(): Promise<any> {
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
        } catch (error: any) {
            console.error('Erro ao verificar tentativas:', error.message);
        }
    }

    async testLoginRateLimit(): Promise<void> {
        console.log('🧪 Testando Rate Limiting de Login com IP simulado...\n');

        const invalidCredentials = {
            username: 'teste_rate_limit',
            password: 'senha_errada',
            fakeIp: this.testIP
        };

        for (let i = 1; i <= 12; i++) {
            try {
                const startTime = Date.now();

                const response = await axios.post(`${this.baseURL}/api/test/simulate-login`, invalidCredentials, {
                    timeout: 10000,
                    validateStatus: () => true
                });

                const duration = Date.now() - startTime;

                this.results.push({
                    attempt: i,
                    status: response.status,
                    duration,
                    message: response.data.message,
                    attemptsRemaining: response.data.attemptsRemaining,
                    retryAfter: response.data.retryAfter
                });

                console.log(`Tentativa ${i}:`);
                console.log(`  Status: ${response.status}`);
                console.log(`  Duração: ${duration}ms`);
                console.log(`  Mensagem: ${response.data.message}`);

                if (response.data.attemptsRemaining !== undefined) {
                    console.log(`  Tentativas restantes: ${response.data.attemptsRemaining}`);
                }

                if (response.data.retryAfter) {
                    console.log(`  Retry após: ${response.data.retryAfter}s`);
                }

                if (response.status === 429) {
                    console.log('  🚨 RATE LIMIT ATIVADO!\n');
                    break;
                } else {
                    console.log('  ✅ Tentativa permitida');
                }
            } catch (error: any) {
                console.error(`Erro na tentativa ${i}:`, error.message);
            }
        }
    }
}

(async () => {
    const tester = new RealRateLimitTester();
    await tester.resetRateLimit();
    await tester.checkAttempts();
    await tester.testLoginRateLimit();
    await tester.checkAttempts();
    process.exit(0);
})();
