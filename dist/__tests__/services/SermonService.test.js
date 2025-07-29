"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sermon_1 = __importDefault(require("../../models/Sermon"));
const SermonService_1 = __importDefault(require("../../services/SermonService"));
jest.mock('../../models/Sermon');
describe('SermonService', () => {
    afterEach(() => jest.clearAllMocks());
    it('deve retornar todos os sermões', async () => {
        const mockSermons = [{ title: 'Sermão 1' }, { title: 'Sermão 2' }];
        // Mock encadeável para simular Mongoose Query
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockSermons)
        };
        Sermon_1.default.find.mockReturnValue(mockQuery);
        Sermon_1.default.countDocuments.mockResolvedValue(mockSermons.length);
        const result = await SermonService_1.default.findAll();
        expect(result.sermons).toEqual(mockSermons);
        expect(Sermon_1.default.find).toHaveBeenCalled();
        expect(result.pagination.total).toBe(mockSermons.length);
    });
    it('deve retornar sermão por ID', async () => {
        const mockSermon = { _id: 'abc', title: 'Sermão' };
        Sermon_1.default.findById.mockResolvedValue(mockSermon);
        const result = await SermonService_1.default.findById('abc');
        expect(result).toEqual(mockSermon);
        expect(Sermon_1.default.findById).toHaveBeenCalledWith('abc');
    });
    it('deve lançar erro se sermão não encontrado', async () => {
        Sermon_1.default.findById.mockResolvedValue(null);
        await expect(SermonService_1.default.findById('notfound')).rejects.toThrow();
    });
});
