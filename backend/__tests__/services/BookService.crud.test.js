jest.mock('../../models/Book', () => jest.fn());
const Book = require('../../models/Book');
// Adiciona métodos estáticos mockados ao construtor Book
Book.findOne = jest.fn();
Book.findById = jest.fn();
Book.findByIdAndUpdate = jest.fn();
Book.findByIdAndDelete = jest.fn();
const BookService = require('../../services/BookService');
const { AppError } = require('../../middleware/errorHandler');

describe('BookService - Métodos de criação, atualização e deleção', () => {
  afterEach(() => jest.clearAllMocks());

  it('deve criar um novo livro', async () => {
    const mockBookData = { title: 'Novo Livro', author: 'Autor' };
    const mockUserId = 'user123';
    Book.findOne.mockResolvedValue(null); // Não existe duplicado
    const mockSave = jest.fn().mockResolvedValue({ ...mockBookData, _id: 'id123', createdBy: mockUserId });
    Book.mockImplementation(() => ({ save: mockSave }));
    const service = new BookService();
    const result = await service.create(mockBookData, mockUserId);
    expect(result.title).toBe('Novo Livro');
    expect(result.author).toBe('Autor');
    expect(result.createdBy).toBe(mockUserId);
    expect(mockSave).toHaveBeenCalled();
  });

  it('deve lançar erro ao criar livro duplicado', async () => {
    const mockBookData = { title: 'Duplicado', author: 'Autor' };
    const mockUserId = 'user123';
    Book.findOne.mockResolvedValue({ title: 'Duplicado', author: 'Autor' });
    const service = new BookService();
    await expect(service.create(mockBookData, mockUserId)).rejects.toThrow(AppError);
  });

  it('deve atualizar um livro existente', async () => {
    const mockId = 'id123';
    const mockUserId = 'user123';
    const mockBook = { _id: mockId, title: 'Antigo', author: 'Autor' };
    Book.findById.mockResolvedValue(mockBook);
    Book.findOne.mockResolvedValue(null); // Não existe duplicado
    Book.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockBook, title: 'Atualizado', updatedBy: mockUserId });
    const service = new BookService();
    const result = await service.update(mockId, { title: 'Atualizado' }, mockUserId);
    expect(result.title).toBe('Atualizado');
    expect(result.updatedBy).toBe(mockUserId);
  });

  it('deve lançar erro ao atualizar livro inexistente', async () => {
    Book.findById.mockResolvedValue(null);
    const service = new BookService();
    await expect(service.update('notfound', { title: 'Novo' }, 'user123')).rejects.toThrow(AppError);
  });

  it('deve deletar um livro existente', async () => {
    const mockId = 'id123';
    const mockBook = { _id: mockId, title: 'Livro', author: 'Autor' };
    Book.findByIdAndDelete = jest.fn().mockResolvedValue(mockBook);
    const service = new BookService();
    const result = await service.delete(mockId);
    expect(result.success).toBe(true);
    expect(result.data.id).toBe(mockId);
  });

  it('deve lançar erro ao deletar livro inexistente', async () => {
    Book.findByIdAndDelete = jest.fn().mockResolvedValue(null);
    const service = new BookService();
    await expect(service.delete('notfound')).rejects.toThrow(AppError);
  });
});
