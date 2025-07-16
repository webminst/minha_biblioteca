import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';
import { TwoFactorLogin } from './index';

/**
 * Componente de proteção de rotas com suporte a 2FA
 * Verifica autenticação e estado de 2FA antes de permitir acesso
 */
const TwoFactorProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [twoFactorError, setTwoFactorError] = useState('');
    const [verificationLoading, setVerificationLoading] = useState(false);

    useEffect(() => {
        checkAuthenticationState();
    }, []);

    const checkAuthenticationState = async () => {
        try {
            // Verifica se está autenticado
            if (!authService.isAuthenticated()) {
                setLoading(false);
                return;
            }

            // Verifica se precisa de 2FA
            if (authService.needsTwoFactorVerification()) {
                setNeedsTwoFactor(true);

                // Tenta obter email do token parcial
                try {
                    const token = authService.getAccessToken();
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUserEmail(payload.email || payload.username || 'Usuário');
                } catch (error) {
                    console.error('Erro ao extrair email do token:', error);
                    setUserEmail('Usuário');
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Erro ao verificar estado de autenticação:', error);
            setLoading(false);
        }
    };

    const handleTwoFactorSubmit = async (verificationData) => {
        try {
            setVerificationLoading(true);
            setTwoFactorError('');

            await authService.verifyTwoFactor(
                verificationData.code,
                verificationData.isBackupCode
            );

            // Sucesso - remove necessidade de 2FA
            setNeedsTwoFactor(false);

        } catch (error) {
            console.error('Erro na verificação 2FA:', error);
            setTwoFactorError(
                error.response?.data?.message ||
                'Código inválido. Tente novamente.'
            );
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleTwoFactorCancel = () => {
        authService.logout();
        setNeedsTwoFactor(false);
        setTwoFactorError('');
    };

    // Estado de carregamento
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #2196F3',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '20px', color: '#666' }}>
                    Verificando autenticação...
                </p>
            </div>
        );
    }

    // Não autenticado - redireciona para login
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Precisa de verificação 2FA
    if (needsTwoFactor) {
        return (
            <TwoFactorLogin
                email={userEmail}
                onSubmit={handleTwoFactorSubmit}
                onCancel={handleTwoFactorCancel}
                loading={verificationLoading}
                error={twoFactorError}
            />
        );
    }

    // Autenticado e verificado - renderiza children
    return children;
};

export default TwoFactorProtectedRoute;
