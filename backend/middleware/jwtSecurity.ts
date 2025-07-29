import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

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
export function generateSecureToken(payload: any, type: string = 'access'): string {
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
        jti: crypto.randomUUID(),
        type: type
    };
    return jwt.sign(
        securePayload,
        secret,
        {
            expiresIn: expiry,
            algorithm: JWT_CONFIG.ALGORITHM as jwt.Algorithm
        }
    );
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifySecureToken(token: string, type: string = 'access'): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET não configurado');
    }
    try {
        const decoded = jwt.verify(token, secret, {
            algorithms: [JWT_CONFIG.ALGORITHM as jwt.Algorithm],
            audience: JWT_CONFIG.AUDIENCE,
            issuer: JWT_CONFIG.ISSUER
        });
        if ((decoded as any).type !== type) {
            throw new Error('Tipo de token inválido');
        }
        return decoded;
    } catch (err) {
        throw err;
    }
}

/**
 * Middleware para aplicar headers de segurança
 */
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction) {
    Object.entries(JWT_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value as string);
    });
    next();
}
