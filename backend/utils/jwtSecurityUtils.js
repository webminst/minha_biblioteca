// Gerador de JWT_SECRET seguro
// Este script gera uma chave JWT segura usando criptografia forte

const crypto = require('crypto');

/**
 * Gera uma chave JWT_SECRET criptograficamente segura
 * @param {number} length - Comprimento em bytes (padrão: 64)
 * @returns {string} Chave JWT_SECRET em hexadecimal
 */
function generateSecureJWTSecret(length = 64) {
    // Gera bytes aleatórios criptograficamente seguros
    const randomBytes = crypto.randomBytes(length);

    // Converte para string hexadecimal
    const jwtSecret = randomBytes.toString('hex');

    return jwtSecret;
}

/**
 * Valida se uma chave JWT_SECRET é suficientemente segura
 * @param {string} secret - Chave a ser validada
 * @returns {Object} Resultado da validação
 */
function validateJWTSecretStrength(secret) {
    if (!secret) {
        return {
            valid: false,
            score: 0,
            issues: ['JWT_SECRET não definido'],
            recommendations: ['Defina uma chave JWT_SECRET']
        };
    }

    const issues = [];
    const recommendations = [];
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

    if (commonWeakSecrets.some(weak => secret.toLowerCase().includes(weak.toLowerCase()))) {
        issues.push('Contém padrões comuns ou palavras conhecidas');
        recommendations.push('Use uma chave gerada aleatoriamente');
    } else {
        score += 20;
    }

    // Verifica entropia (variedade de caracteres)
    const uniqueChars = new Set(secret).size;
    const entropyRatio = uniqueChars / secret.length;

    if (entropyRatio < 0.3) {
        issues.push('Baixa entropia (poucos caracteres únicos)');
        recommendations.push('Use uma chave com maior variedade de caracteres');
    } else if (entropyRatio >= 0.6) {
        score += 25; // Excelente
    } else {
        score += 15; // Boa
    }

    // Verifica se parece ser hexadecimal (boa prática)
    const isHex = /^[a-fA-F0-9]+$/.test(secret);
    if (isHex && secret.length >= 32) {
        score += 15;
    }

    // Verifica variedade de tipos de caracteres
    const hasLower = /[a-z]/.test(secret);
    const hasUpper = /[A-Z]/.test(secret);
    const hasNumbers = /[0-9]/.test(secret);
    const hasSpecial = /[^a-zA-Z0-9]/.test(secret);

    const typeCount = [hasLower, hasUpper, hasNumbers, hasSpecial].filter(Boolean).length;
    score += typeCount * 2.5;

    let level = 'FRACO';
    if (score >= 80) level = 'EXCELENTE';
    else if (score >= 60) level = 'BOM';
    else if (score >= 40) level = 'ACEITÁVEL';

    return {
        valid: score >= 40,
        score,
        level,
        issues,
        recommendations,
        details: {
            length: secret.length,
            uniqueChars,
            entropyRatio: Math.round(entropyRatio * 100) / 100,
            isHex,
            characterTypes: { hasLower, hasUpper, hasNumbers, hasSpecial }
        }
    };
}

/**
 * Função principal para gerar e exibir informações sobre JWT_SECRET
 */
function main() {
    console.log('🔐 Gerador de JWT_SECRET Seguro\n');

    // Gera uma nova chave segura
    const newSecret = generateSecureJWTSecret(64);

    console.log('✅ Nova chave JWT_SECRET gerada:');
    console.log(`JWT_SECRET=${newSecret}\n`);

    // Valida a chave gerada
    const validation = validateJWTSecretStrength(newSecret);
    console.log('📊 Análise de Segurança da Nova Chave:');
    console.log(`Nível: ${validation.level} (${validation.score}/100)`);
    console.log(`Comprimento: ${validation.details.length} caracteres`);
    console.log(`Entropia: ${validation.details.entropyRatio}`);
    console.log(`Caracteres únicos: ${validation.details.uniqueChars}\n`);

    // Se houver chave atual, compara
    const currentSecret = process.env.JWT_SECRET;
    if (currentSecret) {
        console.log('🔍 Análise da Chave Atual:');
        const currentValidation = validateJWTSecretStrength(currentSecret);
        console.log(`Nível: ${currentValidation.level} (${currentValidation.score}/100)`);

        if (currentValidation.issues.length > 0) {
            console.log('⚠️  Problemas identificados:');
            currentValidation.issues.forEach(issue => console.log(`   - ${issue}`));
        }

        if (currentValidation.recommendations.length > 0) {
            console.log('💡 Recomendações:');
            currentValidation.recommendations.forEach(rec => console.log(`   - ${rec}`));
        }
    }

    console.log('\n📝 Para usar a nova chave:');
    console.log('1. Copie a chave gerada acima');
    console.log('2. Atualize seu arquivo .env');
    console.log('3. Reinicie o servidor backend');
    console.log('4. ⚠️  IMPORTANTE: Todos os usuários precisarão fazer login novamente');
}

// Executa apenas se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    generateSecureJWTSecret,
    validateJWTSecretStrength
};
