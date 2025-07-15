// audit-test.js
/**
 * Script de Teste do Sistema de Auditoria
 * Verifica todos os componentes e fornece relatório completo
 */

const axios = require('axios');
const { redis } = require('./backend/config/redis');
const auditService = require('./backend/services/AuditService');

async function testAuditSystem() {
    console.log('🔍 VERIFICAÇÃO COMPLETA DO SISTEMA DE AUDITORIA');
    console.log('================================================\n');

    // 1. Teste de Conexão Redis
    console.log('1. 📡 TESTE DE CONEXÃO REDIS');
    try {
        const redisStatus = await redis.ping();
        console.log(`   ✅ Redis Status: ${redisStatus}`);

        const auditKeys = await redis.keys('audit:*');
        console.log(`   ✅ Total de chaves audit: ${auditKeys.length}`);

        if (auditKeys.length > 0) {
            console.log(`   📋 Primeiras 5 chaves: ${auditKeys.slice(0, 5).join(', ')}`);
        }
    } catch (error) {
        console.log(`   ❌ Erro Redis: ${error.message}`);
    }

    // 2. Teste Timeline
    console.log('\n2. 📈 TESTE TIMELINE');
    try {
        const timelineCount = await redis.zcard('audit:timeline');
        console.log(`   ✅ Total logs na timeline: ${timelineCount}`);

        if (timelineCount > 0) {
            const recentLogs = await redis.zrevrange('audit:timeline', 0, 4);
            console.log(`   📋 Logs recentes: ${recentLogs.join(', ')}`);
        }
    } catch (error) {
        console.log(`   ❌ Erro Timeline: ${error.message}`);
    }

    // 3. Teste de Serviços
    console.log('\n3. ⚙️ TESTE DOS SERVIÇOS');
    try {
        const stats24h = await auditService.getStats(24);
        console.log(`   ✅ Stats 24h - Total Logs: ${stats24h.totalLogs}`);
        console.log(`   📊 Ações: ${Object.keys(stats24h.byAction || {}).length} tipos`);
        console.log(`   👥 Usuários: ${Object.keys(stats24h.byUser || {}).length} ativos`);

        const criticalLogs = await auditService.getCriticalLogs(5);
        console.log(`   🚨 Logs críticos: ${criticalLogs.length}`);
    } catch (error) {
        console.log(`   ❌ Erro Serviços: ${error.message}`);
    }

    // 4. Teste de Log Individual
    console.log('\n4. 💾 TESTE DE SALVAMENTO');
    try {
        const testLog = {
            traceId: `test-${Date.now()}`,
            timestamp: Date.now(),
            user: {
                id: 'test-user-id',
                username: 'test-user',
                role: 'admin'
            },
            action: {
                type: 'TEST',
                resource: 'audit-verification',
                resourceId: 'test-resource',
                criticality: 'normal',
                endpoint: '/api/test',
                method: 'POST'
            },
            request: {
                method: 'POST',
                url: '/api/test',
                ip: '127.0.0.1',
                userAgent: 'Audit Test Script'
            },
            response: {
                status: 200,
                success: true
            },
            metadata: {
                logId: `test-log-${Date.now()}`,
                duration: 100,
                environment: 'test'
            }
        };

        await auditService.save(testLog);
        console.log(`   ✅ Log teste salvo com sucesso: ${testLog.metadata.logId}`);
    } catch (error) {
        console.log(`   ❌ Erro ao salvar log: ${error.message}`);
    }

    // 5. Verificação final
    console.log('\n5. 🔍 VERIFICAÇÃO FINAL');
    try {
        const finalCount = await redis.keys('audit:*');
        const timelineCount = await redis.zcard('audit:timeline');

        console.log(`   📊 Total final de chaves: ${finalCount.length}`);
        console.log(`   📈 Timeline final: ${timelineCount} logs`);

        // Amostra de um log
        if (finalCount.length > 0) {
            const sampleKey = finalCount.find(key => !key.endsWith('timeline'));
            if (sampleKey) {
                const sampleLog = await redis.get(sampleKey);
                const logData = JSON.parse(sampleLog);
                console.log(`   📋 Log exemplo:`);
                console.log(`      - ID: ${logData.metadata?.logId}`);
                console.log(`      - Ação: ${logData.action?.type}`);
                console.log(`      - Usuário: ${logData.user?.username}`);
                console.log(`      - Timestamp: ${new Date(logData.timestamp).toLocaleString()}`);
            }
        }
    } catch (error) {
        console.log(`   ❌ Erro verificação final: ${error.message}`);
    }

    console.log('\n================================================');
    console.log('✅ VERIFICAÇÃO COMPLETA FINALIZADA');
    console.log('================================================\n');
}

// Executa o teste
testAuditSystem()
    .then(() => {
        console.log('Teste concluído com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Erro durante o teste:', error);
        process.exit(1);
    });
