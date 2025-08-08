// Teste para o componente StarRating
import { render, screen, waitFor } from '@testing-library/react';
import StarRating from '../StarRating';

// Mock do localStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock do fetch global
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Sobrescreve o localStorage global
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('StarRating - Teste Simples', () => {
  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    localStorageMock.clear();
    mockFetch.mockClear();
  });

  it('deve renderizar o componente sem erros', async () => {
    // Configura o mock do fetch para retornar uma resposta de sucesso
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        average: 4.5,
        total: 10,
      }),
    });

    // Renderiza o componente com props mínimas
    render(<StarRating bookId='test-id' />);

    // Verifica se o container do componente foi renderizado
    const container = screen.getByTestId('star-rating');
    expect(container).toBeInTheDocument();

    // Verifica se o fetch foi chamado com os parâmetros corretos
    expect(mockFetch).toHaveBeenCalledWith('/api/books/test-id/ratings');

    // Aguarda a resolução das chamadas assíncronas
    await waitFor(() => {
      // Verifica se o texto de classificação é exibido
      const ratingText = screen.getByTestId('rating-text');
      expect(ratingText).toHaveTextContent('4.5/5');
    });
  });
});
