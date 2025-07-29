// Gerador de JWT_SECRET seguro
// Este script gera uma chave JWT segura usando criptografia forte

import crypto from 'crypto';

/**
 * Gera uma chave JWT_SECRET criptograficamente segura
 * @param length Comprimento em bytes (padrão: 64)
 * @returns Chave JWT_SECRET em hexadecimal
 */
export function generateSecureJWTSecret(length: number = 64): string {
    // Gera bytes aleatórios criptograficamente seguros
    const randomBytes = crypto.randomBytes(length);
    // Converte para string hexadecimal
    const jwtSecret = randomBytes.toString('hex');
    return jwtSecret;
}

/**
 * Valida se uma chave JWT_SECRET é suficientemente segura
 * @param secret Chave a ser validada
 * @returns Resultado da validação
 */
export function validateJWTSecretStrength(secret: string): {
    valid: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
} {
    if (!secret) {
        return {
            valid: false,
            score: 0,
            issues: ['JWT_SECRET não definido'],
            recommendations: ['Defina uma chave JWT_SECRET']
        };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Verifica comprimento mínimo
    if (secret.length < 32) {
        issues.push(`Muito curto (${secret.length} caracteres)`);
        recommendations.push('Use pelo menos 32 caracteres');
    } else if (secret.length >= 64) {
        score += 30; // Boa
    } else {
        score += 15; // Aceitável
    }

    // Verifica se não é um padrão comum
    const commonWeakSecrets = [
        'secret',
        'jwt_secret',
        'sua_chave_secreta',
        'sua_chave_secreta_muito_segura',
        'sua_chave_secreta_muito_segura_aqui',
        'mysecret',
        'password',
        '123456',
        'default'
    ];
    if (commonWeakSecrets.includes(secret)) {
        issues.push('Chave muito comum/fraca');
        recommendations.push('Use uma chave aleatória e forte');
    } else {
        score += 20;
    }

    // Verifica diversidade de caracteres
    const hasUpper = /[A-Z]/.test(secret);
    const hasLower = /[a-z]/.test(secret);
    const hasNumber = /[0-9]/.test(secret);
    const hasSymbol = /[^A-Za-z0-9]/.test(secret);
    if (hasUpper) score += 10;
    if (hasLower) score += 10;
    if (hasNumber) score += 10;
    if (hasSymbol) score += 10;

    const valid = score >= 50 && issues.length === 0;
    return { valid, score, issues, recommendations };
}
