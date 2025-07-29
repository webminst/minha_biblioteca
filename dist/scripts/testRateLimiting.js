#!/usr/bin/env ts-node
"use strict";
// scripts/testRateLimiting.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3001';
/**
 * Script para testar o Rate Limiting implementado
 */
class RateLimitTester {
    constructor() {
        this.baseURL = BASE_URL;
        this.results = [];
    }
    async testLoginRateLimit() {
        console.log('🧪 Testando Rate Limiting de Login...\n');
        const invalidCredentials = {
            username: 'teste_rate_limit',
            password: 'senha_errada'
        };
        for (let i = 1; i <= 12; i++) {
            try {
                const startTime = Date.now();
                const response = await axios_1.default.post(`${this.baseURL}/api/auth/login`, invalidCredentials, {
                    timeout: 10000,
                    validateStatus: () => true // Aceita qualquer status
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
                }
                else {
                    console.log('  ✅ Tentativa permitida');
                }
            }
            catch (error) {
                console.error(`Erro na tentativa ${i}:`, error.message);
            }
        }
    }
}
(async () => {
    const tester = new RateLimitTester();
    await tester.testLoginRateLimit();
    process.exit(0);
})();
