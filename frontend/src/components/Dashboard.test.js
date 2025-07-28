import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock do Link do react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>
}));

// Mock do fetch global
const mockFetch = jest.fn();
beforeAll(() => {
    global.fetch = (...args) => mockFetch(...args) || { json: async () => ({}) };
});
afterAll(() => {
    global.fetch = undefined;
});

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renderiza nome do usuário e role', () => {
        render(<Dashboard user={{ username: 'admin', role: 'ADMIN' }} />);
        expect(screen.getByText(/bem-vindo/i)).toHaveTextContent('admin');
        expect(screen.getByText(/bem-vindo/i)).toHaveTextContent('ADMIN');
    });

    it('exibe loading enquanto busca contadores', () => {
        mockFetch.mockReturnValue(new Promise(() => { })); // nunca resolve
        render(<Dashboard user={{ username: 'admin', role: 'ADMIN' }} />);
        expect(screen.getAllByText(/carregando/i).length).toBeGreaterThan(0);
    });

    it('exibe contadores após fetch', async () => {
        mockFetch
            .mockResolvedValueOnce({ json: async () => ({ count: 2 }) })
            .mockResolvedValueOnce({ json: async () => ({ count: 3 }) })
            .mockResolvedValueOnce({ json: async () => ({ count: 4 }) });
        render(<Dashboard user={{ username: 'admin', role: 'ADMIN' }} />);
        await waitFor(() => {
            expect(screen.getByText('2 sermãoes cadastrados')).toBeInTheDocument();
            expect(screen.getByText('3 estudos cadastrados')).toBeInTheDocument();
            expect(screen.getByText('4 livros cadastrados')).toBeInTheDocument();
            expect(screen.getByText(/total de itens cadastrados/i)).toHaveTextContent('9');
        });
    });

    it('exibe links de navegação e segurança', () => {
        render(<Dashboard user={{ username: 'admin', role: 'ADMIN' }} />);
        expect(screen.getByText(/gerenciar sermões/i)).toBeInTheDocument();
        expect(screen.getByText(/gerenciar estudos/i)).toBeInTheDocument();
        expect(screen.getByText(/gerenciar livros/i)).toBeInTheDocument();
        expect(screen.getByText(/auditoria/i)).toBeInTheDocument();
        expect(screen.getByText(/configurar 2fa/i)).toBeInTheDocument();
        expect(screen.getByText(/gerenciar 2fa/i)).toBeInTheDocument();
    });
});
