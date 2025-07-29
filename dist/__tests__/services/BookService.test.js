"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Força uso do mock global de AuditService definido em __mocks__
require("../../services/AuditService");
const Book_1 = __importDefault(require("../../models/Book"));
const BookService_1 = __importDefault(require("../../services/BookService"));
jest.mock('../../models/Book');
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
            Book_1.default.find.mockImplementation(() => ({ sort: mockSort, skip: mockSkip, limit: mockLimit, select: mockSelect }));
            Book_1.default.countDocuments.mockResolvedValue(2);
            const service = new BookService_1.default();
            const result = await service.findAll();
            expect(result.books).toHaveLength(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.total).toBe(2);
        });
    });
});
