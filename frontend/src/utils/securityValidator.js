// Validador de configuração de segurança
// Este arquivo pode ser usado para verificar se todas as variáveis de ambiente estão configuradas

/**
 * Verifica se as variáveis de ambiente de segurança estão configuradas
 * @returns {Object} Status da configuração
 */
export const validateSecurityConfig = () => {
    const config = {
        api: {
            configured: !!process.env.REACT_APP_API_URL,
            value: process.env.REACT_APP_API_URL || 'Não configurado',
            status: process.env.REACT_APP_API_URL ? '✅' : '❌'
        },
        pix: {
            configured: !!process.env.REACT_APP_PIX_KEY &&
                process.env.REACT_APP_PIX_KEY !== 'sua_chave_pix_aqui',
            value: process.env.REACT_APP_PIX_KEY ? 'Configurado (oculto por segurança)' : 'Não configurado',
            status: (process.env.REACT_APP_PIX_KEY && process.env.REACT_APP_PIX_KEY !== 'sua_chave_pix_aqui') ? '✅' : '⚠️'
        },
        bank: {
            configured: !!process.env.REACT_APP_BANK_NAME,
            value: process.env.REACT_APP_BANK_NAME || 'Padrão: Caixa Econômica Federal',
            status: process.env.REACT_APP_BANK_NAME ? '✅' : '⚠️'
        },
        accountHolder: {
            configured: !!process.env.REACT_APP_ACCOUNT_HOLDER,
            value: process.env.REACT_APP_ACCOUNT_HOLDER || 'Padrão: Pastor',
            status: process.env.REACT_APP_ACCOUNT_HOLDER ? '✅' : '⚠️'
        }
    };

    const allCriticalConfigured = config.api.configured && config.pix.configured;

    return {
        config,
        allCriticalConfigured,
        summary: {
            total: Object.keys(config).length,
            configured: Object.values(config).filter(item => item.configured).length,
            critical: ['api', 'pix'],
            optional: ['bank', 'accountHolder']
        }
    };
};

/**
 * Exibe no console o status da configuração (apenas em desenvolvimento)
 */
export const logSecurityStatus = () => {
    if (process.env.NODE_ENV !== 'development') return;

    const validation = validateSecurityConfig();

    console.group('🔐 Status da Configuração de Segurança');
    console.log('API URL:', validation.config.api.status, validation.config.api.value);
    console.log('PIX Key:', validation.config.pix.status, validation.config.pix.value);
    console.log('Bank Name:', validation.config.bank.status, validation.config.bank.value);
    console.log('Account Holder:', validation.config.accountHolder.status, validation.config.accountHolder.value);
    console.log('Status Geral:', validation.allCriticalConfigured ? '✅ Configuração crítica completa' : '❌ Configuração crítica incompleta');
    console.groupEnd();
};

// Auto-executa em desenvolvimento
if (process.env.NODE_ENV === 'development') {
    logSecurityStatus();
}
