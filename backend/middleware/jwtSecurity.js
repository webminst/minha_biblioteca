// Middleware de segurança JWT aprimorado
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Configurações de segurança JWT
 */
const JWT_CONFIG = {
    // Expiração padrão dos tokens
    ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',  // 15 minutos
    REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d', // 7 dias

    // Issuer e audience para validação adicional
    ISSUER: process.env.JWT_ISSUER || 'pastor-portfolio-api',
    AUDIENCE: process.env.JWT_AUDIENCE || 'pastor-portfolio-client',

    // Algoritmo de assinatura
    ALGORITHM: 'HS256',

    // Headers de segurança
    SECURITY_HEADERS: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
};

/**
 * Gera um token JWT com configurações de segurança aprimoradas
 * @param {Object} payload - Dados do usuário
 * @param {string} type - Tipo do token ('access' ou 'refresh')
 * @returns {string} Token JWT
 */
function generateSecureToken(payload, type = 'access') {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }

    // Validação da força da chave
    if (secret.length < 32) {
        console.warn('⚠️  JWT_SECRET muito fraco! Use pelo menos 32 caracteres.');
    }

    const expiry = type === 'refresh' ? JWT_CONFIG.REFRESH_TOKEN_EXPIRY : JWT_CONFIG.ACCESS_TOKEN_EXPIRY;

    // Adiciona informações de segurança ao payload
    const securePayload = {
        ...payload,
        iss: JWT_CONFIG.ISSUER,        // Issuer
        aud: JWT_CONFIG.AUDIENCE,      // Audience
        iat: Math.floor(Date.now() / 1000), // Issued at
        jti: crypto.randomUUID(),      // JWT ID (previne replay attacks)
        type: type                     // Tipo do token
    };

    return jwt.sign(
        securePayload,
        secret,
        {
            expiresIn: expiry,
            algorithm: JWT_CONFIG.ALGORITHM
        }
    );
}

/**
 * Verifica um token JWT com validações de segurança aprimoradas
 * @param {string} token - Token a ser verificado
 * @param {string} expectedType - Tipo esperado do token
 * @returns {Object} Payload decodificado
 */
function verifySecureToken(token, expectedType = 'access') {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }

    try {
        const decoded = jwt.verify(token, secret, {
            algorithms: [JWT_CONFIG.ALGORITHM],
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE
        });

        // Verifica o tipo do token
        if (decoded.type !== expectedType) {
            throw new Error(`Tipo de token inválido. Esperado: ${expectedType}, Recebido: ${decoded.type}`);
        }

        return decoded;
    } catch (error) {
        // Log detalhado para debugging (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            console.error('🔒 Erro na verificação JWT:', {
                error: error.message,
                tokenPreview: token.substring(0, 20) + '...',
                expectedType
            });
        }

        throw error;
    }
}

/**
 * Middleware para aplicar headers de segurança
 */
function applySecurityHeaders(req, res, next) {
    // Aplica headers de segurança
    Object.entries(JWT_CONFIG.SECURITY_HEADERS).forEach(([header, value]) => {
        res.setHeader(header, value);
    });

    next();
}

/**
 * DEPRECIADO: Rate limiting básico movido para rateLimiter.js
 * Mantido para compatibilidade temporária
 */
function authRateLimit(req, res, next) {
    console.warn('⚠️ authRateLimit depreciado. Use o novo sistema em rateLimiter.js');
    next();
}

/**
 * Valida a configuração de segurança JWT
 */
function validateJWTConfig() {
    const issues = [];
    const warnings = [];

    // Verifica JWT_SECRET
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        issues.push('JWT_SECRET não configurado');
    } else if (secret.length < 32) {
        issues.push(`JWT_SECRET muito fraco (${secret.length} caracteres)`);
    } else if (secret.length < 64) {
        warnings.push(`JWT_SECRET poderia ser mais forte (${secret.length} caracteres, recomendado: 64+)`);
    }

    // Verifica configurações de expiração
    const accessExpiry = process.env.JWT_ACCESS_EXPIRY;
    if (accessExpiry && !accessExpiry.match(/^\d+[smhd]$/)) {
        warnings.push('JWT_ACCESS_EXPIRY tem formato inválido');
    }

    return {
        valid: issues.length === 0,
        issues,
        warnings,
        config: {
            secretLength: secret ? secret.length : 0,
            accessExpiry: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
            refreshExpiry: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
            algorithm: JWT_CONFIG.ALGORITHM
        }
    };
}

/**
 * Inicialização e validação automática
 */
function initializeJWTSecurity() {
    const validation = validateJWTConfig();

    if (process.env.NODE_ENV !== 'production') {
        console.log('🔐 Configuração JWT Security:');
        console.log(`   Algoritmo: ${JWT_CONFIG.ALGORITHM}`);
        console.log(`   Access Token: ${JWT_CONFIG.ACCESS_TOKEN_EXPIRY}`);
        console.log(`   Refresh Token: ${JWT_CONFIG.REFRESH_TOKEN_EXPIRY}`);
        console.log(`   Secret Length: ${validation.config.secretLength} chars`);

        if (validation.warnings.length > 0) {
            console.warn('⚠️  Avisos de segurança:');
            validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
        }

        if (validation.issues.length > 0) {
            console.error('❌ Problemas críticos:');
            validation.issues.forEach(issue => console.error(`   - ${issue}`));
        }
    }

    return validation;
}

// Inicializa automaticamente
if (process.env.NODE_ENV !== 'test') {
    initializeJWTSecurity();
}

module.exports = {
    generateSecureToken,
    verifySecureToken,
    applySecurityHeaders,
    authRateLimit,
    validateJWTConfig,
    initializeJWTSecurity,
    JWT_CONFIG
};
