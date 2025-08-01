// Testes unitários para o método findById do BookService
jest.mock('../../models/Book');
const Book = require('../../models/Book');
const BookService = require('../../services/BookService');

describe('BookService - findById', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o livro quando encontrado', async () => {
    const mockBook = { _id: '123', title: 'Livro Teste' };
    Book.findById.mockResolvedValue(mockBook);
    const service = new BookService();
    const result = await service.findById('123');
    expect(result).toEqual(mockBook);
    expect(Book.findById).toHaveBeenCalledWith('123');
  });

  it('deve lançar erro quando livro não encontrado', async () => {
    Book.findById.mockResolvedValue(null);
    const service = new BookService();
    await expect(service.findById('notfound')).rejects.toThrow('Livro não encontrado');
  });
});
