// EXEMPLO: Componente React para Setup 2FA
// frontend/src/components/TwoFactorSetup.js

import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import './TwoFactorSetup.css';

const TwoFactorSetup = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado do setup
    const [setupData, setSetupData] = useState({
        qrCode: '',
        manualEntryKey: '',
        backupCodes: []
    });

    // Estado da verificação
    const [verificationCode, setVerificationCode] = useState('');
    const [secret, setSecret] = useState('');

    // Estado final
    const [isComplete, setIsComplete] = useState(false);

    /**
     * Inicia o setup do 2FA
     */
    const initializeSetup = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await authService.axios.post('/api/auth/2fa/setup');

            if (response.data.success) {
                setSetupData(response.data.data);
                setSecret(response.data.data.manualEntryKey);
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao inicializar 2FA');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Verifica código e ativa 2FA
     */
    const verifyAndEnable = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Código deve ter 6 dígitos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await authService.axios.post('/api/auth/2fa/enable', {
                secret: secret,
                verificationCode: verificationCode
            });

            if (response.data.success) {
                setSetupData(prev => ({
                    ...prev,
                    backupCodes: response.data.data.backupCodes
                }));
                setStep(3);
                setIsComplete(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Código inválido');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Finaliza o setup
     */
    const completeSetup = () => {
        if (onComplete) {
            onComplete(true);
        }
    };

    /**
     * Cancela o setup
     */
    const cancelSetup = () => {
        if (onComplete) {
            onComplete(false);
        }
    };

    return (
        <div className="two-factor-setup">
            <div className="setup-container">

                {/* Cabeçalho */}
                <div className="setup-header">
                    <h2>🔐 Configurar Autenticação de Dois Fatores</h2>
                    <div className="setup-steps">
                        <span className={step >= 1 ? 'step active' : 'step'}>1</span>
                        <span className={step >= 2 ? 'step active' : 'step'}>2</span>
                        <span className={step >= 3 ? 'step active' : 'step'}>3</span>
                    </div>
                </div>

                {/* Conteúdo baseado no passo */}
                {step === 1 && (
                    <div className="setup-step">
                        <h3>Bem-vindo ao 2FA</h3>
                        <p>
                            A autenticação de dois fatores adiciona uma camada extra de segurança
                            à sua conta. Você precisará de um aplicativo autenticador como:
                        </p>

                        <div className="app-suggestions">
                            <div className="app-item">
                                <span className="app-icon">📱</span>
                                <span>Google Authenticator</span>
                            </div>
                            <div className="app-item">
                                <span className="app-icon">🔐</span>
                                <span>Authy</span>
                            </div>
                            <div className="app-item">
                                <span className="app-icon">🛡️</span>
                                <span>Microsoft Authenticator</span>
                            </div>
                        </div>

                        <div className="setup-actions">
                            <button
                                onClick={initializeSetup}
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading ? 'Gerando...' : 'Começar Setup'}
                            </button>
                            <button onClick={cancelSetup} className="btn btn-secondary">
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="setup-step">
                        <h3>Escaneie o QR Code</h3>

                        <div className="qr-section">
                            {setupData.qrCode && (
                                <div className="qr-code">
                                    <img src={setupData.qrCode} alt="QR Code 2FA" />
                                </div>
                            )}

                            <div className="manual-entry">
                                <p>Ou insira manualmente:</p>
                                <code className="manual-key">{setupData.manualEntryKey}</code>
                            </div>
                        </div>

                        <div className="verification-section">
                            <h4>Digite o código do seu app:</h4>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                className="verification-input"
                                maxLength="6"
                            />

                            <div className="setup-actions">
                                <button
                                    onClick={verifyAndEnable}
                                    disabled={loading || verificationCode.length !== 6}
                                    className="btn btn-primary"
                                >
                                    {loading ? 'Verificando...' : 'Verificar e Ativar'}
                                </button>
                                <button onClick={() => setStep(1)} className="btn btn-secondary">
                                    Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="setup-step">
                        <div className="success-message">
                            <span className="success-icon">✅</span>
                            <h3>2FA Ativado com Sucesso!</h3>
                        </div>

                        <div className="backup-codes-section">
                            <h4>⚠️ Códigos de Recuperação</h4>
                            <p>
                                Guarde estes códigos em local seguro. Eles podem ser usados
                                para acessar sua conta se você perder o dispositivo:
                            </p>

                            <div className="backup-codes">
                                {setupData.backupCodes.map((code, index) => (
                                    <code key={index} className="backup-code">{code}</code>
                                ))}
                            </div>

                            <div className="backup-warning">
                                <span className="warning-icon">⚠️</span>
                                <span>Cada código só pode ser usado uma vez</span>
                            </div>
                        </div>

                        <div className="setup-actions">
                            <button onClick={completeSetup} className="btn btn-primary">
                                Finalizar Setup
                            </button>
                        </div>
                    </div>
                )}

                {/* Mensagem de erro */}
                {error && (
                    <div className="error-message">
                        <span className="error-icon">❌</span>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwoFactorSetup;

/* 
// frontend/src/components/TwoFactorSetup.css

.two-factor-setup {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.setup-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 30px;
}

.setup-header {
  text-align: center;
  margin-bottom: 30px;
}

.setup-header h2 {
  color: #333;
  margin-bottom: 20px;
}

.setup-steps {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.step {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
  transition: all 0.3s ease;
}

.step.active {
  background: #007bff;
  color: white;
}

.setup-step {
  text-align: center;
}

.app-suggestions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
}

.app-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.qr-section {
  margin: 20px 0;
}

.qr-code img {
  max-width: 200px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.manual-entry {
  margin-top: 20px;
}

.manual-key {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  word-break: break-all;
}

.verification-input {
  width: 150px;
  padding: 15px;
  font-size: 18px;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 5px;
  margin: 20px 0;
  letter-spacing: 5px;
}

.setup-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.success-message {
  margin-bottom: 30px;
}

.success-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 15px;
}

.backup-codes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 20px 0;
}

.backup-code {
  background: #f8f9fa;
  padding: 8px;
  border-radius: 3px;
  font-family: monospace;
  border: 1px solid #ddd;
}

.backup-warning {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff3cd;
  padding: 10px;
  border-radius: 5px;
  color: #856404;
  margin-top: 15px;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
*/
