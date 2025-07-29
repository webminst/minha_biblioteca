"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Study_1 = __importDefault(require("../../models/Study"));
const StudyService_1 = __importDefault(require("../../services/StudyService"));
jest.mock('../../models/Study');
describe('StudyService', () => {
    afterEach(() => jest.clearAllMocks());
    it('deve retornar todos os estudos', async () => {
        const mockStudies = [{ title: 'Estudo 1' }, { title: 'Estudo 2' }];
        // Mock encadeável para simular Mongoose Query
        const mockQuery = {
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockStudies)
        };
        Study_1.default.find.mockReturnValue(mockQuery);
        Study_1.default.countDocuments.mockResolvedValue(mockStudies.length);
        const result = await StudyService_1.default.findAll();
        expect(result.studies).toEqual(mockStudies);
        expect(Study_1.default.find).toHaveBeenCalled();
        expect(result.pagination.total).toBe(mockStudies.length);
    });
});
