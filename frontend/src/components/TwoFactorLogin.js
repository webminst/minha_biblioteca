import React, { useState, useEffect } from 'react';
import './TwoFactorLogin.css';

const TwoFactorLogin = ({
    onSubmit,
    email,
    loading = false,
    error = null,
    onCancel,
    onBackupCodeMode = null,
    isBackupCodeMode = false
}) => {
    const [code, setCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(isBackupCodeMode);
    const [countdown, setCountdown] = useState(0);

    // Countdown para reenvio (se necessário no futuro)
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Auto-submit quando código de 6 dígitos for inserido
    useEffect(() => {
        if (!useBackupCode && code.length === 6 && /^\d{6}$/.test(code)) {
            handleSubmit();
        }
    }, [code, useBackupCode]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!code.trim()) return;

        // Validações
        if (!useBackupCode && !/^\d{6}$/.test(code)) {
            return;
        }

        if (useBackupCode && !/^[A-Z0-9]{8}$/.test(code.toUpperCase())) {
            return;
        }

        onSubmit({
            code: code.toUpperCase(),
            isBackupCode: useBackupCode
        });
    };

    const handleCodeChange = (e) => {
        let value = e.target.value;

        if (useBackupCode) {
            // Para códigos de backup: apenas letras e números, máximo 8 caracteres
            value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        } else {
            // Para código TOTP: apenas números, máximo 6 dígitos
            value = value.replace(/\D/g, '').slice(0, 6);
        }

        setCode(value);
    };

    const toggleCodeMode = () => {
        setCode('');
        setUseBackupCode(!useBackupCode);
        if (onBackupCodeMode) {
            onBackupCodeMode(!useBackupCode);
        }
    };

    const handleCancel = () => {
        setCode('');
        if (onCancel) onCancel();
    };

    return (
        <div className="two-factor-login">
            <div className="login-container">
                <div className="login-header">
                    <div className="security-icon">🔐</div>
                    <h2>Verificação de Dois Fatores</h2>
                    <p className="login-subtitle">
                        Para manter sua conta segura, precisamos verificar sua identidade
                    </p>
                </div>

                <div className="user-info">
                    <div className="user-email">
                        <span className="email-icon">👤</span>
                        <span className="email-text">{email}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="verification-form">
                    <div className="code-mode-selector">
                        <div className="mode-tabs">
                            <button
                                type="button"
                                className={`mode-tab ${!useBackupCode ? 'active' : ''}`}
                                onClick={() => !useBackupCode || toggleCodeMode()}
                                disabled={loading}
                            >
                                <span className="tab-icon">📱</span>
                                Aplicativo Autenticador
                            </button>
                            <button
                                type="button"
                                className={`mode-tab ${useBackupCode ? 'active' : ''}`}
                                onClick={() => useBackupCode || toggleCodeMode()}
                                disabled={loading}
                            >
                                <span className="tab-icon">🔑</span>
                                Código de Backup
                            </button>
                        </div>
                    </div>

                    <div className="verification-section">
                        {!useBackupCode ? (
                            <div className="totp-section">
                                <div className="instruction">
                                    <p>
                                        <strong>Digite o código de 6 dígitos</strong> do seu aplicativo autenticador
                                    </p>
                                    <div className="app-examples">
                                        <span>Google Authenticator</span>
                                        <span>•</span>
                                        <span>Microsoft Authenticator</span>
                                        <span>•</span>
                                        <span>Authy</span>
                                    </div>
                                </div>

                                <div className="code-input-container">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={code}
                                        onChange={handleCodeChange}
                                        placeholder="000000"
                                        className="verification-input totp-input"
                                        maxLength={6}
                                        disabled={loading}
                                        autoFocus
                                        autoComplete="one-time-code"
                                    />
                                    <div className="input-helper">
                                        <small>O código será validado automaticamente</small>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="backup-section">
                                <div className="instruction">
                                    <p>
                                        <strong>Digite um dos códigos de backup</strong> que você salvou durante a configuração
                                    </p>
                                    <div className="backup-warning">
                                        ⚠️ Cada código de backup pode ser usado apenas uma vez
                                    </div>
                                </div>

                                <div className="code-input-container">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={handleCodeChange}
                                        placeholder="XXXXXXXX"
                                        className="verification-input backup-input"
                                        maxLength={8}
                                        disabled={loading}
                                        autoFocus
                                        autoComplete="off"
                                    />
                                    <div className="input-helper">
                                        <small>Código de 8 caracteres (letras e números)</small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                loading ||
                                !code.trim() ||
                                (!useBackupCode && code.length !== 6) ||
                                (useBackupCode && code.length !== 8)
                            }
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Verificando...
                                </>
                            ) : (
                                'Verificar'
                            )}
                        </button>
                    </div>
                </form>

                <div className="help-section">
                    <details className="help-details">
                        <summary>Precisa de ajuda?</summary>
                        <div className="help-content">
                            <div className="help-item">
                                <strong>Não consigo acessar meu aplicativo autenticador</strong>
                                <p>Use um dos códigos de backup que você salvou durante a configuração.</p>
                            </div>
                            <div className="help-item">
                                <strong>Perdi meus códigos de backup</strong>
                                <p>Entre em contato com o administrador do sistema para redefinir sua autenticação de dois fatores.</p>
                            </div>
                            <div className="help-item">
                                <strong>O código não funciona</strong>
                                <p>Verifique se o relógio do seu dispositivo está sincronizado. Os códigos TOTP são sensíveis ao tempo.</p>
                            </div>
                        </div>
                    </details>
                </div>

                <div className="security-notice">
                    <div className="notice-icon">🛡️</div>
                    <p>
                        Sua conta está protegida por autenticação de dois fatores.
                        Nunca compartilhe seus códigos com outras pessoas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorLogin;
