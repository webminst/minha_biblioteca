#!/usr/bin/env node
// scripts/testRateLimiting.js

const axios = require('axios');

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
      password: 'senha_errada',
    };

    for (let i = 1; i <= 12; i++) {
      try {
        const startTime = Date.now();

        const response = await axios.post(`${this.baseURL}/api/auth/login`, invalidCredentials, {
          timeout: 10000,
          validateStatus: () => true, // Aceita qualquer status
        });

        const duration = Date.now() - startTime;

        this.results.push({
          attempt: i,
          status: response.status,
          duration,
          message: response.data.message,
          attemptsRemaining: response.data.attemptsRemaining,
          retryAfter: response.data.retryAfter,
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
          console.log('  ✅ Tentativa permitida\n');
        }

        // Pequeno delay entre tentativas
        await this.sleep(500);

      } catch (error) {
        console.error(`Erro na tentativa ${i}:`, error.message);
        break;
      }
    }
  }

  async testSecurityEndpoints() {
    console.log('🔍 Testando endpoints de segurança...\n');

    const endpoints = [
      '/api/security/status',
      '/api/security/metrics',
      '/api/security/blocked-ips',
      '/api/security/report?hours=1',
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testando: ${endpoint}`);

        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          timeout: 5000,
          validateStatus: () => true,
        });

        console.log(`  Status: ${response.status}`);

        if (response.status === 200 && response.data.success) {
          console.log('  ✅ Endpoint funcionando');

          // Mostra dados específicos
          if (endpoint.includes('status')) {
            console.log(`  Profile: ${response.data.data.activeProfile}`);
            console.log(`  Redis: ${response.data.data.redisConnected ? 'Conectado' : 'Desconectado'}`);
          } else if (endpoint.includes('metrics')) {
            console.log(`  IPs bloqueados: ${response.data.data.realTime.blockedIPsCount}`);
            console.log(`  Tentativas ativas: ${response.data.data.realTime.activeLoginAttempts}`);
          } else if (endpoint.includes('blocked-ips')) {
            console.log(`  Total de IPs bloqueados: ${response.data.data.count}`);
          }
        } else {
          console.log('  ❌ Endpoint com problema');
        }

      } catch (error) {
        console.log(`  ❌ Erro: ${error.message}`);
      }

      console.log('');
    }
  }

  async testHealthEndpoint() {
    console.log('💓 Testando endpoint de saúde...\n');

    try {
      const response = await axios.get(`${this.baseURL}/health`);

      console.log(`Status: ${response.status}`);
      console.log(`MongoDB: ${response.data.services.mongodb}`);
      console.log(`Redis: ${response.data.services.redis.connected ? 'Conectado' : 'Desconectado'}`);
      console.log(`Versão: ${response.data.version}`);
      console.log('✅ Sistema saudável\n');

    } catch (error) {
      console.error('❌ Erro no health check:', error.message);
    }
  }

  async runAllTests() {
    console.log('🧪 INICIANDO TESTES DE RATE LIMITING\n');
    console.log('=' * 50);

    // Testa saúde do sistema
    await this.testHealthEndpoint();

    // Testa endpoints de segurança
    await this.testSecurityEndpoints();

    // Testa rate limiting de login
    await this.testLoginRateLimit();

    // Resumo final
    this.printSummary();
  }

  printSummary() {
    console.log('📊 RESUMO DOS TESTES\n');
    console.log('Rate Limiting de Login:');

    const allowedAttempts = this.results.filter(r => r.status !== 429).length;
    const blockedAttempts = this.results.filter(r => r.status === 429).length;

    console.log(`  ✅ Tentativas permitidas: ${allowedAttempts}`);
    console.log(`  🚨 Tentativas bloqueadas: ${blockedAttempts}`);

    if (blockedAttempts > 0) {
      console.log('  ✅ Rate Limiting funcionando corretamente!');
    } else {
      console.log('  ⚠️  Rate Limiting pode não estar ativo');
    }

    console.log('\n🎉 Testes concluídos!');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executa os testes se chamado diretamente
if (require.main === module) {
  const tester = new RateLimitTester();
  tester.runAllTests().catch(console.error);
}

module.exports = RateLimitTester;
