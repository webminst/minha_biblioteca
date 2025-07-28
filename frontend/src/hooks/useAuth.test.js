
// Mock axios ANTES de qualquer import para evitar erro ESM
jest.mock('axios', () => ({
    post: jest.fn(),
    create: () => ({ interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } } }),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
}));

import { render, act, waitFor } from '@testing-library/react';
import React from 'react';
import { useAuth } from './useAuth';
import authService from '../services/authService';

jest.mock('../services/authService');


// Wrapper que apenas executa o hook e expõe via ref/callback, sem repassar props para o DOM
const HookWrapper = React.forwardRef(({ callback }, ref) => {
    const hook = callback();
    React.useImperativeHandle(ref, () => hook, [hook]);
    return <div data-testid="hook-wrapper" />;
});

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('deve inicializar com usuário nulo e loading false', async () => {
        authService.getCurrentUser.mockReturnValue(null);
        const ref = React.createRef();
        render(<HookWrapper callback={useAuth} ref={ref} />);
        await waitFor(() => {
            const hook = ref.current;
            expect(hook.user).toBeNull();
            expect(hook.isLoading).toBe(false);
            expect(hook.isAuthenticated).toBe(false);
        });
    });

    it('deve realizar login e atualizar estado', async () => {
        authService.login.mockResolvedValue({ username: 'usuario', role: 'admin' });
        authService.getCurrentUser.mockReturnValue({ username: 'usuario', role: 'admin' });
        let hookResult;
        function TestComponent() {
            hookResult = useAuth();
            return null;
        }
        render(<TestComponent />);
        await act(async () => {
            await hookResult.login('usuario', 'senha');
        });
        expect(hookResult.user).toEqual({ username: 'usuario', role: 'admin' });
        expect(hookResult.isAuthenticated).toBe(true);
        expect(hookResult.isLoading).toBe(false);
    });

    it('deve realizar logout e limpar usuário', () => {
        authService.getCurrentUser.mockReturnValue(null);
        let hookResult;
        function TestComponent() {
            hookResult = useAuth();
            return null;
        }
        render(<TestComponent />);
        act(() => {
            hookResult.logout();
        });
        expect(hookResult.user).toBeNull();
        expect(hookResult.isAuthenticated).toBe(false);
    });
});
