import { render, screen } from '@testing-library/react';
import StarRating from '../components/StarRating';

describe('StarRating - Teste Simplificado', () => {
  // Mock do fetch global
  const mockFetch = jest.fn();

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  afterAll(() => {
    delete global.fetch;
  });

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Configura o mock do fetch para retornar uma Promise resolvida por padrão
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ average: null, total: 0 }),
    });
  });

  it('deve renderizar o componente sem erros', async () => {
    // Renderiza o componente
    const { container } = render(<StarRating bookId="test-id" />);

    // Verifica se o container do componente foi renderizado
    expect(container).toBeInTheDocument();

    // Verifica se o fetch foi chamado com os parâmetros corretos
    expect(mockFetch).toHaveBeenCalledWith('/api/books/test-id/ratings');
  });
});
