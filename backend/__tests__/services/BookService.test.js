
jest.mock('../../models/Book');
const Book = require('../../models/Book');
const BookService = require('../../services/BookService');

describe('BookService', () => {
    describe('findAll', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it('deve retornar um objeto paginado mesmo sem filtros', async () => {
            const mockBooks = [{ title: 'Livro 1' }, { title: 'Livro 2' }];
            // Mock encadeado para Book.find().sort().skip().limit().select()
            const mockSelect = jest.fn().mockResolvedValue(mockBooks);
            const mockLimit = jest.fn(() => ({ select: mockSelect }));
            const mockSkip = jest.fn(() => ({ limit: mockLimit, select: mockSelect }));
            const mockSort = jest.fn(() => ({ skip: mockSkip, limit: mockLimit, select: mockSelect }));
            Book.find.mockImplementation(() => ({ sort: mockSort, skip: mockSkip, limit: mockLimit, select: mockSelect }));
            Book.countDocuments.mockResolvedValue(2);

            const service = new BookService();
            const result = await service.findAll();
            expect(result.books).toHaveLength(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.total).toBe(2);
        });
    });
});
