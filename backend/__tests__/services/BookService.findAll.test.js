jest.mock('../../models/Book');
const Book = require('../../models/Book');
const BookService = require('../../services/BookService');

describe('BookService', () => {
    afterEach(() => jest.clearAllMocks());

    it('deve retornar todos os livros', async () => {
        const mockBooks = [{ title: 'Livro 1' }, { title: 'Livro 2' }];
        // Mock encadeável para simular Mongoose Query
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockBooks)
        };
        Book.find.mockReturnValue(mockQuery);
        Book.countDocuments.mockResolvedValue(mockBooks.length);
        const service = new BookService();
        const result = await service.findAll();
        expect(result.books).toEqual(mockBooks);
        expect(Book.find).toHaveBeenCalled();
        expect(result.pagination.total).toBe(mockBooks.length);
    });
});
