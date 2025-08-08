import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BibleVerse from './BibleVerse';

jest.mock('../../services/bibleApiService', () => ({
  fetchVerse: jest.fn(),
  AVAILABLE_TRANSLATIONS: { almeida: 'Almeida', nvi: 'NVI' },
  validateReference: jest.fn(),
}));
import { fetchVerse } from '../../services/bibleApiService';

describe('BibleVerse', () => {
  beforeEach(() => {
    fetchVerse.mockReset();
  });

  it('renderiza loading', async () => {
    fetchVerse.mockImplementation(() => new Promise(() => {}));
    render(<BibleVerse reference='João 3:16' />);
    expect(screen.getByText(/carregando versículo/i)).toBeInTheDocument();
  });

  it('renderiza erro e botão de tentar novamente', async () => {
    fetchVerse.mockRejectedValue(new Error('Não encontrado'));
    render(<BibleVerse reference='João 3:16' />);
    await waitFor(() =>
      expect(screen.getByText(/referência não encontrada/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: /tentar novamente/i }),
    ).toBeInTheDocument();
  });

  it('renderiza manual load se autoLoad for false', () => {
    render(<BibleVerse reference='João 3:16' autoLoad={false} />);
    expect(
      screen.getByText(/clique para carregar o versículo/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /carregar/i }),
    ).toBeInTheDocument();
  });

  it('renderiza versículo e ações', async () => {
    fetchVerse.mockResolvedValue({
      text: 'Porque Deus amou o mundo',
      reference: 'João 3:16',
      translation_name: 'Almeida',
    });
    render(<BibleVerse reference='João 3:16' />);
    await waitFor(() =>
      expect(screen.getByText(/porque deus amou o mundo/i)).toBeInTheDocument(),
    );
    expect(screen.getByText(/joão 3:16/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /atualizar/i }),
    ).toBeInTheDocument();
  });

  it('renderiza seletor de tradução se showTranslationSelector for true', async () => {
    fetchVerse.mockResolvedValue({
      text: 'Texto',
      reference: 'João 3:16',
      translation_name: 'Almeida',
    });
    render(<BibleVerse reference='João 3:16' showTranslationSelector />);
    await waitFor(() =>
      expect(screen.getByLabelText(/tradução/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('option', { name: /almeida/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /nvi/i })).toBeInTheDocument();
  });
});
