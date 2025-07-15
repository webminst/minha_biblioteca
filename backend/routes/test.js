// routes/test.js
const express = require('express');
const router = express.Router();
const { loginRateLimit, recordAttemptMiddleware } = require('../middleware/rateLimiter');

/**
 * Endpoint de teste para simular rate limiting
 * Força um IP externo para demonstrar o funcionamento
 */
router.post('/simulate-login', (req, res, next) => {
    // Simula um IP externo para teste
    const fakeIp = req.body.fakeIp || '203.0.113.1'; // IP de teste da RFC

    // Sobrescreve o IP para teste
    req.ip = fakeIp;
    req.connection = { remoteAddress: fakeIp };

    console.log(`🧪 Simulando login de IP: ${fakeIp}`);
    next();
}, loginRateLimit, async (req, res) => {
    try {
        // Registra tentativa manualmente
        const recordAttempt = recordAttemptMiddleware('LOGIN');
        await new Promise((resolve) => recordAttempt(req, res, resolve));

        const { username, password } = req.body;

        // Simula sempre credencial inválida para teste
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username e senha são obrigatórios'
            });
        }

        // Sempre retorna credencial inválida para forçar o rate limiting
        res.status(401).json({
            success: false,
            message: 'Credenciais inválidas (simulação)',
            attemptsRemaining: req.rateLimitInfo?.attemptsRemaining || 0,
            testIP: req.ip,
            rateLimitInfo: req.rateLimitInfo
        });

    } catch (error) {
        console.error('Erro no teste de login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

/**
 * Endpoint para resetar rate limiting de um IP
 */
router.delete('/reset-rate-limit', async (req, res) => {
    try {
        const { redis, isRedisConnected } = require('../config/redis');
        const ip = req.body.ip || '203.0.113.1';

        if (!isRedisConnected()) {
            return res.status(503).json({
                success: false,
                message: 'Redis não disponível'
            });
        }

        // Remove todas as chaves relacionadas ao IP
        const keys = await redis.keys(`*${ip}*`);
        if (keys.length > 0) {
            await redis.del(...keys);
        }

        res.json({
            success: true,
            message: `Rate limiting resetado para IP ${ip}`,
            removedKeys: keys.length
        });

    } catch (error) {
        console.error('Erro ao resetar rate limiting:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao resetar rate limiting'
        });
    }
});

/**
 * Endpoint para verificar tentativas de um IP
 */
router.get('/check-attempts', async (req, res) => {
    try {
        const { redis, isRedisConnected } = require('../config/redis');
        const ip = req.query.ip || '203.0.113.1';

        if (!isRedisConnected()) {
            return res.status(503).json({
                success: false,
                message: 'Redis não disponível'
            });
        }

        const loginKey = `rate_limit:login:${ip}`;
        const authKey = `rate_limit:auth:${ip}`;
        const blockedKey = `rate_limit:blocked:${ip}`;

        const [loginAttempts, authAttempts, blockedInfo] = await Promise.all([
            redis.get(loginKey),
            redis.get(authKey),
            redis.get(blockedKey)
        ]);

        res.json({
            success: true,
            ip,
            attempts: {
                login: parseInt(loginAttempts) || 0,
                auth: parseInt(authAttempts) || 0
            },
            blocked: blockedInfo ? JSON.parse(blockedInfo) : null,
            keys: {
                loginKey: !!loginAttempts,
                authKey: !!authAttempts,
                blockedKey: !!blockedInfo
            }
        });

    } catch (error) {
        console.error('Erro ao verificar tentativas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar tentativas'
        });
    }
});

module.exports = router;
