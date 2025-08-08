import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StarRating from './StarRating';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
});

// Mock global fetch
const mockFetch = jest.fn();

describe('StarRating', () => {
  const bookId = 'abc123';
  const apiBase = '/api/books';

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    localStorage.clear();

    // Configura o mock do fetch para retornar uma Promise resolvida por padrão
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ average: null, total: 0 }),
      }),
    );
  });

  afterAll(() => {
    // Restaura o fetch original após todos os testes
    delete global.fetch;
  });

  it('renderiza estrelas e texto padrão', async () => {
    // Renderiza o componente dentro de act
    await act(async () => {
      render(<StarRating bookId={bookId} apiBase={apiBase} />);
    });

    // Verifica se as 5 estrelas foram renderizadas
    const stars = await screen.findAllByRole('button');
    expect(stars).toHaveLength(5);

    // Verifica o texto de nenhuma avaliação
    const ratingText = await screen.findByTestId('rating-text');
    expect(ratingText).toHaveTextContent('Seja o primeiro a avaliar (0)');
  });

  it('exibe média e total de avaliações', async () => {
    const average = 4.5;
    const total = 10;

    // Configura o mock para retornar a média e total fornecidos
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ average, total }),
    });

    // Renderiza o componente dentro de act
    await act(async () => {
      render(<StarRating bookId={bookId} apiBase={apiBase} />);
    });

    // Verifica se a média e o total são exibidos corretamente
    const ratingText = await screen.findByTestId('rating-text');
    expect(ratingText).toHaveTextContent('4.5/5 (10)');
  });

  it('permite avaliar quando não avaliado anteriormente', async () => {
    // Configura o mock para a chamada inicial
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ average: 4, total: 5 }),
      }),
    );

    // Primeiro renderiza o componente
    await act(async () => {
      render(<StarRating bookId={bookId} apiBase={apiBase} />);
    });

    // Configura o mock para a chamada de avaliação
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ average: 4.5, total: 6 }),
      }),
    );

    // Clica na quinta estrela
    const fifthStar = screen.getAllByRole('button')[4];
    await act(async () => {
      fireEvent.click(fifthStar);
    });

    // Verifica se o fetch foi chamado corretamente
    expect(mockFetch).toHaveBeenCalledWith(
      `${apiBase}/${bookId}/rate`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Object),
        body: expect.any(String),
      }),
    );
  });

  it('não permite avaliar novamente quando já avaliado', async () => {
    // Configura o mock para simular que já existe uma avaliação
    const userRatings = { [bookId]: 5 };
    localStorage.setItem('userRatings', JSON.stringify(userRatings));

    // Configura o mock para a chamada inicial
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ average: 5, total: 1 }),
      }),
    );

    // Renderiza o componente
    await act(async () => {
      render(<StarRating bookId={bookId} apiBase={apiBase} />);
    });

    // Tenta clicar em uma estrela
    const thirdStar = screen.getAllByRole('button')[2];
    fireEvent.click(thirdStar);

    // Verifica que o fetch não foi chamado novamente
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('exibe erro quando a avaliação falha', async () => {
    // Configura o mock para a chamada inicial
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ average: 3, total: 2 }),
      }),
    );

    // Primeiro renderiza o componente
    await act(async () => {
      render(<StarRating bookId={bookId} apiBase={apiBase} />);
    });

    // Configura o mock para a chamada de avaliação com erro
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Erro ao registrar avaliação' }),
      }),
    );

    // Clica na terceira estrela
    const thirdStar = screen.getAllByRole('button')[2];
    await act(async () => {
      fireEvent.click(thirdStar);
    });

    // Verifica se a mensagem de erro é exibida
    const errorMessage = await screen.findByTestId('error-message');
    expect(errorMessage).toHaveTextContent('Erro ao registrar avaliação');
  });

  it('deve renderizar o componente sem erros com props mínimas', async () => {
    // Configura o mock para retornar uma resposta de sucesso
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        average: 4.5,
        total: 10,
      }),
    });

    // Renderiza o componente com props mínimas
    await act(async () => {
      render(<StarRating bookId="test-id" />);
    });

    // Verifica se o container do componente foi renderizado
    const container = screen.getByTestId('star-rating');
    expect(container).toBeInTheDocument();

    // Verifica se o fetch foi chamado com os parâmetros corretos
    expect(mockFetch).toHaveBeenCalledWith('/api/books/test-id/ratings');
  });
});
