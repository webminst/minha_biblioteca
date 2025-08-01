const SermonRepository = require('../../repositories/SermonRepository');
const Sermon = require('../../models/Sermon');

// Mock do modelo Sermon
jest.mock('../../models/Sermon');

describe('SermonRepository', () => {
  let sermonRepository;
  let mockSermon;

  beforeEach(() => {
    // Limpa todos os mocks
    jest.clearAllMocks();
    
    // Cria instância do repository
    sermonRepository = require('../../repositories/SermonRepository');
    
    // Mock de um sermão
    mockSermon = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Sermão de Teste',
      content: 'Conteúdo do sermão de teste',
      book: 'João',
      series: 'Série de Teste',
      speaker: 'Pastor Teste',
      duration: 45,
      views: 100,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock dos métodos do modelo
    Sermon.findById = jest.fn();
    Sermon.findOne = jest.fn();
    Sermon.find = jest.fn();
    Sermon.create = jest.fn();
    Sermon.findByIdAndUpdate = jest.fn();
    Sermon.findByIdAndDelete = jest.fn();
    Sermon.countDocuments = jest.fn();
    Sermon.aggregate = jest.fn();
    Sermon.distinct = jest.fn();
  });

  describe('findById', () => {
    it('deve buscar um sermão por ID com sucesso', async () => {
      // Arrange
      const sermonId = '507f1f77bcf86cd799439011';
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSermon)
      };
      Sermon.findById.mockReturnValue(mockQuery);

      // Act
      const result = await sermonRepository.findById(sermonId);

      // Assert
      expect(Sermon.findById).toHaveBeenCalledWith(sermonId);
      expect(result).toEqual(mockSermon);
    });

    it('deve retornar null quando sermão não encontrado', async () => {
      // Arrange
      const sermonId = '507f1f77bcf86cd799439011';
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null)
      };
      Sermon.findById.mockReturnValue(mockQuery);

      // Act
      const result = await sermonRepository.findById(sermonId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve buscar todos os sermões com paginação', async () => {
      // Arrange
      const mockSermons = [mockSermon];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSermons)
      };
      
      Sermon.find.mockReturnValue(mockQuery);
      Sermon.countDocuments.mockResolvedValue(1);

      // Act
      const result = await sermonRepository.findAll();

      // Assert
      expect(Sermon.find).toHaveBeenCalledWith({});
      expect(Sermon.countDocuments).toHaveBeenCalledWith({});
      expect(result).toEqual({
        data: mockSermons,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null
        }
      });
    });

    it('deve aplicar filtros corretamente', async () => {
      // Arrange
      const filters = { book: 'João' };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      };
      
      Sermon.find.mockReturnValue(mockQuery);
      Sermon.countDocuments.mockResolvedValue(0);

      // Act
      await sermonRepository.findAll(filters);

      // Assert
      expect(Sermon.find).toHaveBeenCalledWith(filters);
      expect(Sermon.countDocuments).toHaveBeenCalledWith(filters);
    });
  });

  describe('create', () => {
    it('deve criar um novo sermão com sucesso', async () => {
      // Arrange
      const sermonData = {
        title: 'Novo Sermão',
        content: 'Conteúdo do novo sermão',
        book: 'João'
      };
      
      Sermon.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSermon)
      }));

      // Act
      const result = await sermonRepository.create(sermonData);

      // Assert
      expect(Sermon).toHaveBeenCalledWith(sermonData);
      expect(result).toEqual(mockSermon);
    });

    it('deve tratar erro de validação', async () => {
      // Arrange
      const sermonData = { title: 'Sermão sem conteúdo' };
      const validationError = new Error('ValidationError');
      validationError.name = 'ValidationError';
      validationError.errors = {
        content: { message: 'Conteúdo é obrigatório' }
      };
      
      Sermon.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(validationError)
      }));

      // Act & Assert
      await expect(sermonRepository.create(sermonData))
        .rejects
        .toThrow('Erro de validação: Conteúdo é obrigatório');
    });
  });

  describe('updateById', () => {
    it('deve atualizar um sermão com sucesso', async () => {
      // Arrange
      const sermonId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Título Atualizado' };
      const updatedSermon = { ...mockSermon, ...updateData };
      
      Sermon.findByIdAndUpdate.mockResolvedValue(updatedSermon);

      // Act
      const result = await sermonRepository.updateById(sermonId, updateData);

      // Assert
      expect(Sermon.findByIdAndUpdate).toHaveBeenCalledWith(
        sermonId,
        updateData,
        {
          new: true,
          runValidators: true
        }
      );
      expect(result).toEqual(updatedSermon);
    });

    it('deve lançar erro quando sermão não encontrado', async () => {
      // Arrange
      const sermonId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Título Atualizado' };
      
      Sermon.findByIdAndUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(sermonRepository.updateById(sermonId, updateData))
        .rejects
        .toThrow('Documento não encontrado');
    });
  });

  describe('deleteById', () => {
    it('deve deletar um sermão com sucesso', async () => {
      // Arrange
      const sermonId = '507f1f77bcf86cd799439011';
      
      Sermon.findByIdAndDelete.mockResolvedValue(mockSermon);

      // Act
      const result = await sermonRepository.deleteById(sermonId);

      // Assert
      expect(Sermon.findByIdAndDelete).toHaveBeenCalledWith(sermonId);
      expect(result).toBe(true);
    });

    it('deve lançar erro quando sermão não encontrado', async () => {
      // Arrange
      const sermonId = '507f1f77bcf86cd799439011';
      
      Sermon.findByIdAndDelete.mockResolvedValue(null);

      // Act & Assert
      await expect(sermonRepository.deleteById(sermonId))
        .rejects
        .toThrow('Documento não encontrado');
    });
  });

  describe('findSuggestions', () => {
    it('deve retornar sugestões de busca', async () => {
      // Arrange
      const term = 'joão';
      const suggestions = [
        { title: 'Sermão sobre João', book: 'João', score: 3 },
        { title: 'Outro sermão', book: 'João', score: 2 }
      ];
      
      Sermon.aggregate.mockResolvedValue(suggestions);

      // Act
      const result = await sermonRepository.findSuggestions(term);

      // Assert
      expect(Sermon.aggregate).toHaveBeenCalled();
      expect(result).toEqual(suggestions);
    });

    it('deve retornar array vazio para termo muito curto', async () => {
      // Act
      const result = await sermonRepository.findSuggestions('a');

      // Assert
      expect(result).toEqual([]);
      expect(Sermon.aggregate).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas dos sermões', async () => {
      // Arrange
      const stats = {
        totalSermons: 10,
        totalBooks: 5,
        totalSeries: 3,
        totalSpeakers: 2,
        averageDuration: 45.5,
        totalViews: 1000
      };
      
      Sermon.aggregate.mockResolvedValue([stats]);

      // Act
      const result = await sermonRepository.getStats();

      // Assert
      expect(Sermon.aggregate).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });

    it('deve retornar estatísticas vazias quando não há dados', async () => {
      // Arrange
      Sermon.aggregate.mockResolvedValue([]);

      // Act
      const result = await sermonRepository.getStats();

      // Assert
      expect(result).toEqual({
        totalSermons: 0,
        totalBooks: 0,
        totalSeries: 0,
        totalSpeakers: 0,
        averageDuration: 0,
        totalViews: 0
      });
    });
  });

  describe('getAllSeries', () => {
    it('deve retornar todas as séries únicas', async () => {
      // Arrange
      const series = ['Série 1', 'Série 2', 'Série 3'];
      
      Sermon.distinct.mockResolvedValue(series);

      // Act
      const result = await sermonRepository.getAllSeries();

      // Assert
      expect(Sermon.distinct).toHaveBeenCalledWith('series');
      expect(result).toEqual(series);
    });
  });

  describe('getAllSpeakers', () => {
    it('deve retornar todos os pregadores únicos', async () => {
      // Arrange
      const speakers = ['Pastor 1', 'Pastor 2'];
      
      Sermon.distinct.mockResolvedValue(speakers);

      // Act
      const result = await sermonRepository.getAllSpeakers();

      // Assert
      expect(Sermon.distinct).toHaveBeenCalledWith('speaker');
      expect(result).toEqual(speakers);
    });
  });

  describe('getAllBooks', () => {
    it('deve retornar todos os livros únicos', async () => {
      // Arrange
      const books = ['João', 'Lucas', 'Mateus'];
      
      Sermon.distinct.mockResolvedValue(books);

      // Act
      const result = await sermonRepository.getAllBooks();

      // Assert
      expect(Sermon.distinct).toHaveBeenCalledWith('book');
      expect(result).toEqual(books);
    });
  });

  describe('incrementViews', () => {
    it('deve incrementar visualizações com sucesso', async () => {
      // Arrange
      const sermonId = '507f1f77bcf86cd799439011';
      const updatedSermon = { ...mockSermon, views: 101 };
      
      Sermon.findByIdAndUpdate.mockResolvedValue(updatedSermon);

      // Act
      const result = await sermonRepository.incrementViews(sermonId);

      // Assert
      expect(Sermon.findByIdAndUpdate).toHaveBeenCalledWith(
        sermonId,
        { $inc: { views: 1 } },
        { new: true }
      );
      expect(result).toEqual(updatedSermon);
    });
  });

  describe('findPopular', () => {
    it('deve retornar sermões populares', async () => {
      // Arrange
      const popularSermons = [mockSermon];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(popularSermons)
      };
      
      Sermon.find.mockReturnValue(mockQuery);

      // Act
      const result = await sermonRepository.findPopular(5);

      // Assert
      expect(Sermon.find).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ views: -1, createdAt: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(popularSermons);
    });
  });

  describe('findRecent', () => {
    it('deve retornar sermões recentes', async () => {
      // Arrange
      const recentSermons = [mockSermon];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(recentSermons)
      };
      
      Sermon.find.mockReturnValue(mockQuery);

      // Act
      const result = await sermonRepository.findRecent(5);

      // Assert
      expect(Sermon.find).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual(recentSermons);
    });
  });

  describe('handleError', () => {
    it('deve tratar erro de validação', () => {
      // Arrange
      const error = new Error('ValidationError');
      error.name = 'ValidationError';
      error.errors = {
        title: { message: 'Título é obrigatório' },
        content: { message: 'Conteúdo é obrigatório' }
      };

      // Act
      const result = sermonRepository.handleError(error, 'Erro de teste');

      // Assert
      expect(result.message).toBe('Erro de validação: Título é obrigatório, Conteúdo é obrigatório');
    });

    it('deve tratar erro de ID inválido', () => {
      // Arrange
      const error = new Error('CastError');
      error.name = 'CastError';

      // Act
      const result = sermonRepository.handleError(error, 'Erro de teste');

      // Assert
      expect(result.message).toBe('ID inválido');
    });

    it('deve tratar erro de documento duplicado', () => {
      // Arrange
      const error = new Error('DuplicateError');
      error.code = 11000;

      // Act
      const result = sermonRepository.handleError(error, 'Erro de teste');

      // Assert
      expect(result.message).toBe('Documento duplicado');
    });

    it('deve tratar erro genérico', () => {
      // Arrange
      const error = new Error('Erro desconhecido');

      // Act
      const result = sermonRepository.handleError(error, 'Erro de teste');

      // Assert
      expect(result.message).toBe('Erro de teste');
    });
  });
}); 