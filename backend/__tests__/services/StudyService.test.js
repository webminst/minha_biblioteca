jest.mock('../../models/Study');
const Study = require('../../models/Study');
const StudyService = require('../../services/StudyService');

describe('StudyService', () => {
  afterEach(() => jest.clearAllMocks());

  it('deve retornar todos os estudos', async () => {
    const mockStudies = [{ title: 'Estudo 1' }, { title: 'Estudo 2' }];
    // Mock encadeável para simular Mongoose Query
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(mockStudies),
    };
    Study.find.mockReturnValue(mockQuery);
    Study.countDocuments.mockResolvedValue(mockStudies.length);
    const result = await StudyService.findAll();
    expect(result.studies).toEqual(mockStudies);
    expect(Study.find).toHaveBeenCalled();
    expect(result.pagination.total).toBe(mockStudies.length);
  });
});
