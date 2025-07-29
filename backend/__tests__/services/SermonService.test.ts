import Sermon from '../../models/Sermon';
import SermonService from '../../services/SermonService';

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
        (Sermon.find as jest.Mock).mockReturnValue(mockQuery);
        (Sermon.countDocuments as jest.Mock).mockResolvedValue(mockSermons.length);
        const result = await SermonService.findAll();
        expect(result.sermons).toEqual(mockSermons);
        expect(Sermon.find).toHaveBeenCalled();
        expect(result.pagination.total).toBe(mockSermons.length);
    });

    it('deve retornar sermão por ID', async () => {
        const mockSermon = { _id: 'abc', title: 'Sermão' };
        (Sermon.findById as jest.Mock).mockResolvedValue(mockSermon);
        const result = await SermonService.findById('abc');
        expect(result).toEqual(mockSermon);
        expect(Sermon.findById).toHaveBeenCalledWith('abc');
    });

    it('deve lançar erro se sermão não encontrado', async () => {
        (Sermon.findById as jest.Mock).mockResolvedValue(null);
        await expect(SermonService.findById('notfound')).rejects.toThrow();
    });
});
