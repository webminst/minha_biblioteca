
// Mock axios antes de qualquer importação de módulos que o utilizam
jest.mock('axios');
jest.mock('../hooks/useAuth');
jest.mock('../services/authService');

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TokenStatus from './TokenStatus';
import useAuth from '../hooks/useAuth';
import authService from '../services/authService';

describe('TokenStatus', () => {
    const user = { username: 'testuser', role: 'admin' };
    const baseDate = new Date('2024-01-01T12:00:00Z');
    const originalDateNow = Date.now;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        Date.now = jest.fn(() => baseDate.getTime());
    });

    afterEach(() => {
        jest.useRealTimers();
        Date.now = originalDateNow;
    });

    function setToken({ exp }) {
        // Create a fake JWT: header.payload.signature
        const payload = btoa(JSON.stringify({ exp }));
        authService.getAccessToken.mockReturnValue(`header.${payload}.sig`);
    }

    it('does not render if not authenticated', () => {
        useAuth.mockReturnValue({ isAuthenticated: false, user: null });
        render(<TokenStatus />);
        expect(screen.queryByText(/Status do Token/i)).toBeNull();
    });

    it('renders valid token info', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user });
        // Token expira em 10 minutos
        setToken({ exp: Math.floor((baseDate.getTime() + 10 * 60 * 1000) / 1000) });
        render(<TokenStatus />);
        expect(screen.getByText(/Status do Token/i)).toBeInTheDocument();
        expect(screen.getByText(/testuser \(admin\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Válido por 10 min/i)).toBeInTheDocument();
        expect(screen.getByText(/Expira às:/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Renovar Agora/i })).toBeInTheDocument();
    });

    it('shows warning if token is expiring soon', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user });
        setToken({ exp: Math.floor((baseDate.getTime() + 60 * 1000) / 1000) }); // 1 min
        render(<TokenStatus />);
        expect(screen.getByText(/Expira em 1 min/i)).toBeInTheDocument();
    });

    it('shows expired if token is expired', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user });
        setToken({ exp: Math.floor((baseDate.getTime() - 60 * 1000) / 1000) }); // -1 min
        render(<TokenStatus />);
        expect(screen.getByText(/Token expirado/i)).toBeInTheDocument();
    });

    it('calls refreshToken and updates info on manual refresh', async () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user });
        setToken({ exp: Math.floor((baseDate.getTime() + 10 * 60 * 1000) / 1000) });
        authService.refreshToken.mockResolvedValue();
        render(<TokenStatus />);
        const button = screen.getByRole('button', { name: /Renovar Agora/i });
        await act(async () => {
            fireEvent.click(button);
        });
        expect(authService.refreshToken).toHaveBeenCalled();
    });

    it('updates info every 30 seconds', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user });
        setToken({ exp: Math.floor((baseDate.getTime() + 10 * 60 * 1000) / 1000) });
        render(<TokenStatus />);
        act(() => {
            jest.advanceTimersByTime(30000);
        });
        expect(authService.getAccessToken).toHaveBeenCalledTimes(2); // initial + interval
    });

    it('updates info on tokenRefreshed event', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user });
        setToken({ exp: Math.floor((baseDate.getTime() + 10 * 60 * 1000) / 1000) });
        render(<TokenStatus />);
        act(() => {
            window.dispatchEvent(new Event('tokenRefreshed'));
        });
        expect(authService.getAccessToken).toHaveBeenCalledTimes(2); // initial + event
    });

    it('handles invalid token gracefully', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user });
        authService.getAccessToken.mockReturnValue('invalid.token');
        render(<TokenStatus />);
        expect(screen.queryByText(/Status do Token/i)).toBeNull();
    });
});
