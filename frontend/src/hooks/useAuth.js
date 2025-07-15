// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

/**
 * Hook customizado para gerenciar autenticação com refresh automático
 */
export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /**
     * Atualiza estado do usuário
     */
    const updateUserState = useCallback(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);
        setIsLoading(false);
    }, []);

    /**
     * Realiza login
     */
    const login = async (username, password) => {
        setIsLoading(true);
        try {
            const userData = await authService.login(username, password);
            updateUserState();
            return userData;
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    /**
     * Realiza logout
     */
    const logout = useCallback(() => {
        authService.logout();
        updateUserState();
    }, [updateUserState]);

    /**
     * Força refresh do token
     */
    const refreshToken = async () => {
        try {
            await authService.refreshToken();
            updateUserState();
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            logout();
        }
    };

    /**
     * Verifica se o usuário tem uma role específica
     */
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);

    /**
     * Verifica se o usuário é admin
     */
    const isAdmin = useCallback(() => {
        return hasRole('admin');
    }, [hasRole]);

    // Configurar listeners para eventos de autenticação
    useEffect(() => {
        // Estado inicial
        updateUserState();

        // Listeners para eventos customizados
        const handleLogin = () => updateUserState();
        const handleLogout = () => updateUserState();
        const handleTokenRefresh = () => updateUserState();

        window.addEventListener('userLoggedIn', handleLogin);
        window.addEventListener('userLoggedOut', handleLogout);
        window.addEventListener('tokenRefreshed', handleTokenRefresh);

        // Cleanup
        return () => {
            window.removeEventListener('userLoggedIn', handleLogin);
            window.removeEventListener('userLoggedOut', handleLogout);
            window.removeEventListener('tokenRefreshed', handleTokenRefresh);
        };
    }, [updateUserState]);

    return {
        // Estado
        user,
        isLoading,
        isAuthenticated,

        // Ações
        login,
        logout,
        refreshToken,

        // Utilitários
        hasRole,
        isAdmin,

        // Serviços
        authService
    };
};

export default useAuth;
