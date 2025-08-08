import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BibleSearch from './BibleSearch';

jest.mock('../../services/bibleApiService', () => ({
  fetchVerse: jest.fn(),
  validateReference: jest.fn(),
  fetchRandomVerse: jest.fn(),
  AVAILABLE_TRANSLATIONS: { almeida: 'Almeida', nvi: 'NVI' },
}));
jest.mock('../BibleVerse/BibleVerse', () => props => (
  <div data-testid='bible-verse'>{props.reference}</div>
));

import {
  validateReference,
  fetchRandomVerse,
} from '../../services/bibleApiService';

describe('BibleSearch', () => {
  beforeEach(() => {
    validateReference.mockReset();
    fetchRandomVerse.mockReset();
  });

  it('renderiza campos principais e dicas', () => {
    render(<BibleSearch />);
    expect(screen.getByText(/buscar versículos bíblicos/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ex: joão 3:16/i)).toBeInTheDocument();
    expect(screen.getByText(/dicas de uso/i)).toBeInTheDocument();
  });

  it('mostra sugestões populares ao focar no input', () => {
    render(<BibleSearch />);
    fireEvent.focus(screen.getByPlaceholderText(/ex: joão 3:16/i));
    expect(screen.getByText(/sugestões populares/i)).toBeInTheDocument();
  });

  it('busca referência válida e exibe BibleVerse', async () => {
    validateReference.mockResolvedValue(true);
    render(<BibleSearch />);
    fireEvent.change(screen.getByPlaceholderText(/ex: joão 3:16/i), {
      target: { value: 'João 3:16' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));
    await waitFor(() =>
      expect(screen.getByTestId('bible-verse')).toHaveTextContent('João 3:16'),
    );
  });

  it('alerta se referência inválida', async () => {
    window.alert = jest.fn();
    validateReference.mockResolvedValue(false);
    render(<BibleSearch />);
    fireEvent.change(screen.getByPlaceholderText(/ex: joão 3:16/i), {
      target: { value: 'Foo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringMatching(/não encontrada/i),
      ),
    );
  });

  it('busca versículo aleatório e exibe BibleVerse', async () => {
    fetchRandomVerse.mockResolvedValue({ reference: 'Salmos 23:1' });
    render(<BibleSearch />);
    fireEvent.click(
      screen.getByRole('button', { name: /versículo aleatório/i }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('bible-verse')).toHaveTextContent('Salmos 23:1'),
    );
  });
});
