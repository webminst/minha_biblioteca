// src/components/TokenStatus.js
import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';

/**
 * Componente para mostrar status do token e permitir refresh manual
 */
function TokenStatus() {
    const { user, isAuthenticated } = useAuth();
    const [tokenInfo, setTokenInfo] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const updateTokenInfo = () => {
        if (!isAuthenticated) {
            setTokenInfo(null);
            return;
        }

        try {
            const token = authService.getAccessToken();
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expirationTime = payload.exp * 1000;
                const currentTime = Date.now();
                const timeUntilExpiry = expirationTime - currentTime;
                const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));

                setTokenInfo({
                    expiresAt: new Date(expirationTime),
                    minutesUntilExpiry,
                    isExpiringSoon: minutesUntilExpiry <= 2,
                    isExpired: timeUntilExpiry <= 0
                });
            }
        } catch (error) {
            console.error('Erro ao analisar token:', error);
            setTokenInfo(null);
        }
    };

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            await authService.refreshToken();
            updateTokenInfo();
        } catch (error) {
            console.error('Erro ao renovar token manualmente:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        updateTokenInfo();

        // Atualiza a cada 30 segundos
        const interval = setInterval(updateTokenInfo, 30000);

        // Listener para refresh automático
        const handleTokenRefresh = () => updateTokenInfo();
        window.addEventListener('tokenRefreshed', handleTokenRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('tokenRefreshed', handleTokenRefresh);
        };
    }, [isAuthenticated]);

    if (!isAuthenticated || !tokenInfo) {
        return null;
    }

    return (
        <div className="token-status" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: tokenInfo.isExpired ? '#ff4444' : tokenInfo.isExpiringSoon ? '#ffaa00' : '#44ff44',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            maxWidth: '300px'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                🔐 Status do Token
            </div>

            <div style={{ marginBottom: '5px' }}>
                Usuário: {user?.username} ({user?.role})
            </div>

            <div style={{ marginBottom: '5px' }}>
                {tokenInfo.isExpired ? (
                    '❌ Token expirado'
                ) : tokenInfo.isExpiringSoon ? (
                    `⚠️ Expira em ${tokenInfo.minutesUntilExpiry} min`
                ) : (
                    `✅ Válido por ${tokenInfo.minutesUntilExpiry} min`
                )}
            </div>

            <div style={{ fontSize: '10px', marginBottom: '8px' }}>
                Expira às: {tokenInfo.expiresAt.toLocaleTimeString()}
            </div>

            <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: isRefreshing ? 'not-allowed' : 'pointer'
                }}
            >
                {isRefreshing ? '🔄 Renovando...' : '🔄 Renovar Agora'}
            </button>
        </div>
    );
}

export default TokenStatus;
