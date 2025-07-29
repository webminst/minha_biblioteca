"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureToken = generateSecureToken;
exports.verifySecureToken = verifySecureToken;
exports.applySecurityHeaders = applySecurityHeaders;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * Configurações de segurança JWT
 */
const JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    PARTIAL_AUTH_EXPIRY: process.env.JWT_PARTIAL_EXPIRY || '5m',
    ISSUER: process.env.JWT_ISSUER || 'pastor-portfolio-api',
    AUDIENCE: process.env.JWT_AUDIENCE || 'pastor-portfolio-client',
    ALGORITHM: 'HS256',
    SECURITY_HEADERS: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
};
/**
 * Gera um token JWT com configurações de segurança aprimoradas
 */
function generateSecureToken(payload, type = 'access') {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }
    if (secret.length < 32) {
        console.warn('⚠️  JWT_SECRET muito fraco! Use pelo menos 32 caracteres.');
    }
    let expiry;
    switch (type) {
        case 'access':
            expiry = JWT_CONFIG.ACCESS_TOKEN_EXPIRY;
            break;
        case 'refresh':
            expiry = JWT_CONFIG.REFRESH_TOKEN_EXPIRY;
            break;
        case 'partial_auth':
            expiry = JWT_CONFIG.PARTIAL_AUTH_EXPIRY;
            break;
        default:
            throw new Error(`Tipo de token inválido: ${type}`);
    }
    const securePayload = {
        ...payload,
        iss: JWT_CONFIG.ISSUER,
        aud: JWT_CONFIG.AUDIENCE,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto_1.default.randomUUID(),
        type: type
    };
    return jsonwebtoken_1.default.sign(securePayload, secret, {
        expiresIn: expiry,
        algorithm: JWT_CONFIG.ALGORITHM
    });
}
/**
 * Verifica e decodifica um token JWT
 */
function verifySecureToken(token, type = 'access') {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret, {
            algorithms: [JWT_CONFIG.ALGORITHM],
            audience: JWT_CONFIG.AUDIENCE,
            issuer: JWT_CONFIG.ISSUER
        });
        if (decoded.type !== type) {
            throw new Error('Tipo de token inválido');
        }
        return decoded;
    }
    catch (err) {
        throw err;
    }
}
/**
 * Middleware para aplicar headers de segurança
 */
function applySecurityHeaders(req, res, next) {
    Object.entries(JWT_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    next();
}
