import { useState, useEffect } from 'react';
import authService from '../services/authService';
import './TwoFactorManagement.css';

const TwoFactorManagement = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDisable, setShowConfirmDisable] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.getTwoFactorStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status 2FA:', error);
      setError('Erro ao carregar informações de segurança');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await authService.disableTwoFactor();

      setSuccess('Autenticação de dois fatores desabilitada com sucesso!');
      setShowConfirmDisable(false);

      // Recarregar status
      await loadStatus();
    } catch (error) {
      console.error('Erro ao desabilitar 2FA:', error);
      setError(
        error.response?.data?.message ||
          'Erro ao desabilitar autenticação de dois fatores',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      const response = await authService.regenerateBackupCodes();

      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
      setSuccess('Novos códigos de backup gerados com sucesso!');

      // Recarregar status para atualizar a contagem
      await loadStatus();
    } catch (error) {
      console.error('Erro ao regenerar códigos:', error);
      setError(
        error.response?.data?.message || 'Erro ao gerar novos códigos de backup',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard
      .writeText(codesText)
      .then(() => {
        setSuccess('Códigos copiados para a área de transferência!');
      })
      .catch(() => {
        setError('Erro ao copiar códigos');
      });
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className='two-factor-management'>
        <div className='management-container'>
          <div className='loading-state'>
            <div className='loading-spinner large'></div>
            <p>Carregando informações de segurança...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='two-factor-management'>
      <div className='management-container'>
        <div className='management-header'>
          <h2>🔐 Autenticação de Dois Fatores</h2>
          <p className='header-subtitle'>
            Gerencie suas configurações de segurança
          </p>
        </div>

        {error && (
          <div className='message error-message'>
            <span className='message-icon'>⚠️</span>
            <span className='message-text'>{error}</span>
            <button
              className='message-close'
              onClick={clearMessages}
              type='button'
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className='message success-message'>
            <span className='message-icon'>✅</span>
            <span className='message-text'>{success}</span>
            <button
              className='message-close'
              onClick={clearMessages}
              type='button'
            >
              ×
            </button>
          </div>
        )}

        {status && (
          <div className='status-section'>
            <div className='status-card'>
              <div className='status-header'>
                <div className='status-icon'>
                  {status.enabled ? '🛡️' : '🔓'}
                </div>
                <div className='status-info'>
                  <h3>Status Atual</h3>
                  <p
                    className={`status-badge ${status.enabled ? 'enabled' : 'disabled'}`}
                  >
                    {status.enabled ? 'Ativado' : 'Desativado'}
                  </p>
                </div>
              </div>

              {status.enabled && (
                <div className='status-details'>
                  <div className='detail-item'>
                    <span className='detail-label'>Configurado em:</span>
                    <span className='detail-value'>
                      {new Date(status.enabledAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {status.backupCodesRemaining !== undefined && (
                    <div className='detail-item'>
                      <span className='detail-label'>
                        Códigos de backup restantes:
                      </span>
                      <span
                        className={`detail-value ${status.backupCodesRemaining <= 2 ? 'warning' : ''}`}
                      >
                        {status.backupCodesRemaining} de 10
                      </span>
                    </div>
                  )}

                  {status.lastUsed && (
                    <div className='detail-item'>
                      <span className='detail-label'>Último uso:</span>
                      <span className='detail-value'>
                        {new Date(status.lastUsed).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {status?.enabled && (
          <div className='actions-section'>
            <div className='action-card'>
              <div className='action-header'>
                <h4>🔑 Códigos de Backup</h4>
                <p>Gere novos códigos de backup para emergências</p>
              </div>

              {status.backupCodesRemaining <= 2 && (
                <div className='warning-notice'>
                  <span className='warning-icon'>⚠️</span>
                  <span>
                    Poucos códigos de backup restantes! Recomendamos gerar novos
                    códigos.
                  </span>
                </div>
              )}

              <button
                onClick={handleRegenerateBackupCodes}
                disabled={actionLoading}
                className='btn btn-primary'
              >
                {actionLoading ? (
                  <>
                    <span className='loading-spinner'></span>
                    Gerando...
                  </>
                ) : (
                  'Gerar Novos Códigos'
                )}
              </button>
            </div>

            <div className='action-card danger'>
              <div className='action-header'>
                <h4>🚨 Zona de Perigo</h4>
                <p>
                  Desabilitar a autenticação de dois fatores reduzirá a
                  segurança da sua conta
                </p>
              </div>

              <button
                onClick={() => setShowConfirmDisable(true)}
                disabled={actionLoading}
                className='btn btn-danger'
              >
                Desabilitar 2FA
              </button>
            </div>
          </div>
        )}

        {!status?.enabled && (
          <div className='disabled-state'>
            <div className='disabled-icon'>🔓</div>
            <h3>Autenticação de Dois Fatores Desabilitada</h3>
            <p>
              Sua conta não está protegida por autenticação de dois fatores.
              Recomendamos ativar este recurso para maior segurança.
            </p>
            <button
              className='btn btn-primary btn-large'
              onClick={() => (window.location.href = '/setup-2fa')}
            >
              🛡️ Ativar Autenticação de Dois Fatores
            </button>
          </div>
        )}

        {/* Modal de confirmação para desabilitar */}
        {showConfirmDisable && (
          <div className='modal-overlay'>
            <div className='modal confirm-modal'>
              <div className='modal-header'>
                <h3>⚠️ Confirmar Desabilitação</h3>
              </div>

              <div className='modal-body'>
                <p>
                  <strong>
                    Tem certeza que deseja desabilitar a autenticação de dois
                    fatores?
                  </strong>
                </p>
                <p>
                  Esta ação reduzirá significativamente a segurança da sua
                  conta. Você poderá reativar a qualquer momento.
                </p>

                <div className='warning-box'>
                  <span className='warning-icon'>🚨</span>
                  <span>
                    Todos os códigos de backup atuais serão invalidados
                  </span>
                </div>
              </div>

              <div className='modal-actions'>
                <button
                  onClick={() => setShowConfirmDisable(false)}
                  className='btn btn-secondary'
                  disabled={actionLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisable2FA}
                  className='btn btn-danger'
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className='loading-spinner'></span>
                      Desabilitando...
                    </>
                  ) : (
                    'Sim, Desabilitar'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de códigos de backup */}
        {showBackupCodes && backupCodes.length > 0 && (
          <div className='modal-overlay'>
            <div className='modal backup-codes-modal'>
              <div className='modal-header'>
                <h3>🔑 Novos Códigos de Backup</h3>
              </div>

              <div className='modal-body'>
                <div className='backup-warning'>
                  <span className='warning-icon'>⚠️</span>
                  <div>
                    <strong>Importante:</strong>
                    <ul>
                      <li>Salve estes códigos em local seguro</li>
                      <li>Cada código pode ser usado apenas uma vez</li>
                      <li>Os códigos anteriores foram invalidados</li>
                    </ul>
                  </div>
                </div>

                <div className='backup-codes-display'>
                  <div className='codes-grid'>
                    {backupCodes.map((code, index) => (
                      <div key={index} className='backup-code-item'>
                        <code>{code}</code>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={copyBackupCodes}
                    className='btn btn-primary btn-copy-codes'
                  >
                    📋 Copiar Todos os Códigos
                  </button>
                </div>
              </div>

              <div className='modal-actions'>
                <button
                  onClick={() => {
                    setShowBackupCodes(false);
                    setBackupCodes([]);
                  }}
                  className='btn btn-primary'
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dicas de segurança */}
        <div className='security-tips'>
          <h4>💡 Dicas de Segurança</h4>
          <div className='tips-grid'>
            <div className='tip-item'>
              <span className='tip-icon'>📱</span>
              <div>
                <strong>Use um aplicativo confiável</strong>
                <p>Google Authenticator, Microsoft Authenticator ou Authy</p>
              </div>
            </div>

            <div className='tip-item'>
              <span className='tip-icon'>💾</span>
              <div>
                <strong>Salve os códigos de backup</strong>
                <p>Mantenha-os em local seguro e offline</p>
              </div>
            </div>

            <div className='tip-item'>
              <span className='tip-icon'>🕒</span>
              <div>
                <strong>Sincronize o relógio</strong>
                <p>Mantenha a data/hora do dispositivo atualizada</p>
              </div>
            </div>

            <div className='tip-item'>
              <span className='tip-icon'>🔒</span>
              <div>
                <strong>Nunca compartilhe códigos</strong>
                <p>Códigos são pessoais e intransferíveis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorManagement;
