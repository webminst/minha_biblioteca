import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BibleSearchSimple from './BibleSearchSimple';

jest.mock('../../services/bibleApiService', () => ({
    fetchVerse: jest.fn(),
    fetchRandomVerse: jest.fn(),
    AVAILABLE_TRANSLATIONS: { ara: 'ARA', nvi: 'NVI' }
}));
import { fetchVerse, fetchRandomVerse } from '../../services/bibleApiService';

describe('BibleSearchSimple', () => {
    beforeEach(() => {
        fetchVerse.mockReset();
        fetchRandomVerse.mockReset();
    });

    it('renderiza campos principais e dicas', () => {
        render(<BibleSearchSimple />);
        expect(screen.getByText(/busca bíblica/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/joão 3:16/i)).toBeInTheDocument();
        expect(screen.getByText(/dicas de uso/i)).toBeInTheDocument();
    });

    it('busca versículo e exibe resultado', async () => {
        fetchVerse.mockResolvedValue({ reference: 'João 3:16', text: 'Porque Deus amou o mundo' });
        render(<BibleSearchSimple />);
        fireEvent.change(screen.getByPlaceholderText(/joão 3:16/i), { target: { value: 'João 3:16' } });
        fireEvent.click(screen.getByRole('button', { name: /buscar/i }));
        // Garante que o texto do versículo está presente dentro do container correto
        await waitFor(() => {
            const result = screen.getByText(/porque deus amou o mundo/i, { selector: '.verse-text' });
            expect(result).toBeInTheDocument();
            // O h3 do resultado deve conter a referência
            const header = screen.getByRole('heading', { level: 3 });
            expect(header).toHaveTextContent('João 3:16');
        });
    });

    it('exibe mensagem de erro ao falhar busca', async () => {
        fetchVerse.mockRejectedValue(new Error('Não encontrado'));
        render(<BibleSearchSimple />);
        fireEvent.change(screen.getByPlaceholderText(/joão 3:16/i), { target: { value: 'João 3:16' } });
        fireEvent.click(screen.getByRole('button', { name: /buscar/i }));
        await waitFor(() => expect(screen.getByText(/não encontrado/i)).toBeInTheDocument());
    });

    it('busca versículo aleatório e exibe resultado', async () => {
        fetchRandomVerse.mockResolvedValue({ reference: 'Salmos 23:1', text: 'O Senhor é meu pastor' });
        render(<BibleSearchSimple />);
        fireEvent.click(screen.getByRole('button', { name: /versículo aleatório/i }));
        await waitFor(() => {
            const header = screen.getByRole('heading', { level: 3 });
            expect(header).toHaveTextContent('Salmos 23:1');
            const result = screen.getByText(/o senhor é meu pastor/i, { selector: '.verse-text' });
            expect(result).toBeInTheDocument();
        });
    });
});
