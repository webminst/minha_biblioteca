// frontend/src/components/TwoFactorSetup.js
import { useState, useEffect } from 'react';
import authService from '../services/authService';
import './TwoFactorSetup.css';

const TwoFactorSetup = ({ user, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado do setup
  const [setupData, setSetupData] = useState({
    qrCode: '',
    manualEntryKey: '',
    backupCodes: [],
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
        secret,
        verificationCode,
      });

      if (response.data.success) {
        setSetupData(prev => ({
          ...prev,
          backupCodes: response.data.data.backupCodes,
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
    if (onCancel) {
      onCancel();
    }
  };

  /**
   * Copia códigos de backup para área de transferência
   */
  const copyBackupCodes = () => {
    const codesText = setupData.backupCodes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      alert('Códigos copiados para a área de transferência!');
    });
  };

  return (
    <div className='two-factor-setup'>
      <div className='setup-container'>
        {/* Cabeçalho */}
        <div className='setup-header'>
          <h2>🔐 Configurar Autenticação de Dois Fatores</h2>
          <div className='setup-steps'>
            <span className={step >= 1 ? 'step active' : 'step'}>1</span>
            <div className='step-line'></div>
            <span className={step >= 2 ? 'step active' : 'step'}>2</span>
            <div className='step-line'></div>
            <span className={step >= 3 ? 'step active' : 'step'}>3</span>
          </div>
          <div className='step-labels'>
            <span>Início</span>
            <span>Configurar</span>
            <span>Concluído</span>
          </div>
        </div>

        {/* Conteúdo baseado no passo */}
        {step === 1 && (
          <div className='setup-step'>
            <div className='step-icon'>📱</div>
            <h3>Bem-vindo ao 2FA</h3>
            <p className='step-description'>
              A autenticação de dois fatores adiciona uma camada extra de
              segurança à sua conta. Você precisará de um aplicativo
              autenticador instalado no seu dispositivo móvel.
            </p>

            <div className='app-suggestions'>
              <h4>📲 Apps Recomendados:</h4>
              <div className='apps-grid'>
                <div className='app-item'>
                  <span className='app-icon'>📱</span>
                  <div>
                    <strong>Google Authenticator</strong>
                    <small>Gratuito - iOS e Android</small>
                  </div>
                </div>
                <div className='app-item'>
                  <span className='app-icon'>🔐</span>
                  <div>
                    <strong>Authy</strong>
                    <small>Gratuito - Backup na nuvem</small>
                  </div>
                </div>
                <div className='app-item'>
                  <span className='app-icon'>🛡️</span>
                  <div>
                    <strong>Microsoft Authenticator</strong>
                    <small>Gratuito - Integração Microsoft</small>
                  </div>
                </div>
              </div>
            </div>

            <div className='setup-actions'>
              <button
                onClick={initializeSetup}
                disabled={loading}
                className='btn btn-primary'
              >
                {loading ? 'Gerando...' : 'Começar Configuração'}
              </button>
              <button onClick={cancelSetup} className='btn btn-secondary'>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='setup-step'>
            <div className='step-icon'>📷</div>
            <h3>Escaneie o QR Code</h3>
            <p className='step-description'>
              Abra seu app autenticador e escaneie o código QR abaixo, ou insira
              a chave manualmente.
            </p>

            <div className='qr-section'>
              {setupData.qrCode && (
                <div className='qr-code-container'>
                  <img
                    src={setupData.qrCode}
                    alt='QR Code 2FA'
                    className='qr-code'
                  />
                </div>
              )}

              <div className='manual-entry'>
                <details>
                  <summary>Ou insira manualmente:</summary>
                  <div className='manual-key-container'>
                    <code className='manual-key'>
                      {setupData.manualEntryKey}
                    </code>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(setupData.manualEntryKey)
                      }
                      className='btn-copy'
                      title='Copiar chave'
                    >
                      📋
                    </button>
                  </div>
                </details>
              </div>
            </div>

            <div className='verification-section'>
              <h4>Digite o código do seu app:</h4>
              <div className='verification-input-container'>
                <input
                  type='text'
                  value={verificationCode}
                  onChange={e =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                  }
                  placeholder='123456'
                  className='verification-input'
                  maxLength='6'
                />
                <small>Código de 6 dígitos gerado pelo app</small>
              </div>

              <div className='setup-actions'>
                <button
                  onClick={verifyAndEnable}
                  disabled={loading || verificationCode.length !== 6}
                  className='btn btn-primary'
                >
                  {loading ? 'Verificando...' : 'Verificar e Ativar'}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className='btn btn-secondary'
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='setup-step'>
            <div className='success-animation'>
              <div className='success-icon'>✅</div>
              <h3>2FA Ativado com Sucesso!</h3>
              <p className='success-message'>
                Sua conta agora está protegida com autenticação de dois fatores.
              </p>
            </div>

            <div className='backup-codes-section'>
              <div className='warning-header'>
                <span className='warning-icon'>⚠️</span>
                <h4>Códigos de Recuperação Importantes</h4>
              </div>

              <p className='backup-description'>
                <strong>Guarde estes códigos em local seguro!</strong> Eles
                podem ser usados para acessar sua conta se você perder o
                dispositivo móvel.
              </p>

              <div className='backup-codes-container'>
                <div className='backup-codes'>
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className='backup-code-item'>
                      <code>{code}</code>
                    </div>
                  ))}
                </div>

                <button onClick={copyBackupCodes} className='btn-copy-codes'>
                  📋 Copiar Todos os Códigos
                </button>
              </div>

              <div className='backup-warnings'>
                <div className='warning-item'>
                  <span className='warning-icon'>⚠️</span>
                  <span>Cada código só pode ser usado uma vez</span>
                </div>
                <div className='warning-item'>
                  <span className='warning-icon'>🔒</span>
                  <span>Mantenha-os em local seguro e privado</span>
                </div>
                <div className='warning-item'>
                  <span className='warning-icon'>💾</span>
                  <span>Imprima ou salve em gerenciador de senhas</span>
                </div>
              </div>
            </div>

            <div className='setup-actions'>
              <button
                onClick={completeSetup}
                className='btn btn-primary btn-large'
              >
                Finalizar Configuração
              </button>
            </div>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className='error-message'>
            <span className='error-icon'>❌</span>
            <span>{error}</span>
            <button onClick={() => setError('')} className='error-close'>
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetup;
