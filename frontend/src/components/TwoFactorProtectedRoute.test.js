import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TwoFactorProtectedRoute from './TwoFactorProtectedRoute';
import { Navigate } from 'react-router-dom';

// Mock do authService
jest.mock('../services/authService', () => ({
    isAuthenticated: jest.fn(),
    needsTwoFactorVerification: jest.fn(),
    getAccessToken: jest.fn(),
    verifyTwoFactor: jest.fn(),
    logout: jest.fn(),
}));

// Mock do TwoFactorLogin
jest.mock('./index', () => ({
    TwoFactorLogin: ({ email, onSubmit, onCancel, loading, error }) => (
        <div>
            <span>2FA para {email}</span>
            <button onClick={() => onSubmit({ code: '123456', isBackupCode: false })}>Verificar</button>
            <button onClick={onCancel}>Cancelar</button>
            {loading && <span>Carregando...</span>}
            {error && <span>{error}</span>}
        </div>
    )
}));

describe('TwoFactorProtectedRoute', () => {
    const authService = require('../services/authService');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('redireciona para login se não autenticado', async () => {
        authService.isAuthenticated.mockReturnValue(false);
        const { container } = render(
            <MemoryRouter>
                <TwoFactorProtectedRoute>Privado</TwoFactorProtectedRoute>
            </MemoryRouter>
        );
        // Não deve renderizar children nem tela de carregamento
        expect(container).toBeEmptyDOMElement();
    });

    it('renderiza children se autenticado e não precisa 2FA', async () => {
        authService.isAuthenticated.mockReturnValue(true);
        authService.needsTwoFactorVerification.mockReturnValue(false);
        render(<TwoFactorProtectedRoute>Privado</TwoFactorProtectedRoute>);
        await waitFor(() => {
            expect(screen.getByText(/privado/i)).toBeInTheDocument();
        });
    });

    it('renderiza tela de 2FA se autenticado e precisa 2FA', async () => {
        authService.isAuthenticated.mockReturnValue(true);
        authService.needsTwoFactorVerification.mockReturnValue(true);
        authService.getAccessToken.mockReturnValue(
            'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ email: 'teste@exemplo.com' })) + '.assinatura'
        );
        render(<TwoFactorProtectedRoute>Privado</TwoFactorProtectedRoute>);
        await waitFor(() => {
            expect(screen.getByText(/2fa para teste@exemplo.com/i)).toBeInTheDocument();
        });
    });

    it('chama onSubmit e remove 2FA ao sucesso', async () => {
        authService.isAuthenticated.mockReturnValue(true);
        authService.needsTwoFactorVerification.mockReturnValue(true);
        authService.getAccessToken.mockReturnValue(
            'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ email: 'teste@exemplo.com' })) + '.assinatura'
        );
        authService.verifyTwoFactor.mockResolvedValue();
        await act(async () => {
            render(<TwoFactorProtectedRoute>Privado</TwoFactorProtectedRoute>);
        });
        await waitFor(() => {
            expect(screen.getByText(/2fa para teste@exemplo.com/i)).toBeInTheDocument();
        });
        await act(async () => {
            screen.getByText('Verificar').click();
        });
        await waitFor(() => {
            expect(authService.verifyTwoFactor).toHaveBeenCalledWith('123456', false);
        });
    });

    it('chama onCancel e faz logout', async () => {
        authService.isAuthenticated.mockReturnValue(true);
        authService.needsTwoFactorVerification.mockReturnValue(true);
        authService.getAccessToken.mockReturnValue(
            'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ email: 'teste@exemplo.com' })) + '.assinatura'
        );
        await act(async () => {
            render(<TwoFactorProtectedRoute>Privado</TwoFactorProtectedRoute>);
        });
        await waitFor(() => {
            expect(screen.getByText(/2fa para teste@exemplo.com/i)).toBeInTheDocument();
        });
        await act(async () => {
            screen.getByText('Cancelar').click();
        });
        expect(authService.logout).toHaveBeenCalled();
    });
});
