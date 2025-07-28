import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StarRating from './StarRating';

// Mock global fetch
beforeEach(() => {
    global.fetch = jest.fn();
});
afterEach(() => {
    jest.resetAllMocks();
});

describe('StarRating', () => {
    const bookId = 'abc123';
    const apiBase = '/api/books';

    it('renderiza estrelas e texto padrão', async () => {
        fetch.mockResolvedValueOnce({ json: async () => ({ average: null, total: 0 }) });
        render(<StarRating bookId={bookId} />);
        expect(screen.getAllByText('★')).toHaveLength(5);
        await waitFor(() => expect(screen.getByText(/sem avaliações/i)).toBeInTheDocument());
    });

    it('exibe média e total de avaliações', async () => {
        fetch.mockResolvedValueOnce({ json: async () => ({ average: 4.5, total: 10 }) });
        render(<StarRating bookId={bookId} />);
        await waitFor(() => {
            // Busca o texto completo, considerando possíveis espaços
            expect(screen.getByText(/4.5\s*\/\s*5\s*\(10\)/i)).toBeInTheDocument();
        });
    });

    it('permite avaliar se autenticado', async () => {
        fetch
            .mockResolvedValueOnce({ json: async () => ({ average: 4, total: 5 }) }) // inicial
            .mockResolvedValueOnce({ ok: true }) // rate
            .mockResolvedValueOnce({ json: async () => ({ average: 5, total: 6 }) }); // update
        render(<StarRating bookId={bookId} userToken="token" />);
        await waitFor(() => expect(screen.getByText(/4 \/ 5/i)).toBeInTheDocument());
        fireEvent.click(screen.getAllByText('★')[4]); // 5 estrelas
        await waitFor(() => expect(screen.getByText(/5 \/ 5/i)).toBeInTheDocument());
    });

    it('exibe erro ao falhar avaliação', async () => {
        fetch
            .mockResolvedValueOnce({ json: async () => ({ average: 3, total: 2 }) }) // inicial
            .mockResolvedValueOnce({ ok: false }); // rate
        render(<StarRating bookId={bookId} userToken="token" />);
        await waitFor(() => expect(screen.getByText(/3 \/ 5/i)).toBeInTheDocument());
        fireEvent.click(screen.getAllByText('★')[2]); // 3 estrelas
        await waitFor(() => expect(screen.getByText(/erro ao registrar avaliação/i)).toBeInTheDocument());
    });
});
