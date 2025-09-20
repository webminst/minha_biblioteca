import sermonRepository from '../repositories/SermonRepository';
import { AppError } from '../middleware/errorHandler';

/**
 * SermonService - Serviço refatorado usando Repository Pattern
 * Foca na lógica de negócio e delega operações de dados para o repository
 */
class SermonService {
  private repository = sermonRepository;

  /**
   * Busca todos os sermões com filtros e paginação
   */
  async findAll(options: Record<string, any> = {}): Promise<any> {
    try {
      return await this.repository.findSermons({}, options);
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca sermão por ID */
  async findById(id: string): Promise<any> {
    try {
      const sermon = await this.repository.findById(id);
      if (!sermon) throw new AppError('Sermão não encontrado', 404);
      await this.repository.incrementViews(id);
      return sermon;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  }

  /** Cria um novo sermão */
  async create(sermonData: Record<string, any>, userId: string): Promise<any> {
    try {
      if (!sermonData.title || !sermonData.content) {
        throw new AppError('Título e conteúdo são obrigatórios', 400);
      }
      const sermonToCreate = {
        ...sermonData,
        createdBy: userId,
        updatedBy: userId,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return await this.repository.create(sermonToCreate);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  }

  /** Atualiza um sermão */
  async update(id: string, updateData: Record<string, any>, userId: string): Promise<any> {
    try {
      const existingSermon = await this.repository.findById(id);
      if (!existingSermon) throw new AppError('Sermão não encontrado', 404);
      const sermonToUpdate = {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
      };
      return await this.repository.updateById(id, sermonToUpdate);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  }

  /** Remove um sermão */
  async delete(id: string): Promise<any> {
    try {
      const existingSermon = await this.repository.findById(id);
      if (!existingSermon) throw new AppError('Sermão não encontrado', 404);
      return await this.repository.deleteById(id);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  }

  /** Busca o sermão mais recente */
  async findLatest(): Promise<any> {
    try {
      return await this.repository.findLatest();
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca sermões por série */
  async findBySeries(series: string, options: Record<string, any> = {}): Promise<any> {
    try {
      if (!series) throw new AppError('Nome da série é obrigatório', 400);
      return await this.repository.findBySeries(series, options);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  }

  /** Busca sermões por pregador */
  async findBySpeaker(speaker: string, options: Record<string, any> = {}): Promise<any> {
    try {
      if (!speaker) throw new AppError('Nome do pregador é obrigatório', 400);
      return await this.repository.findBySpeaker(speaker, options);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  }

  /** Busca sermões por livro bíblico */
  async findByBook(book: string, options: Record<string, any> = {}): Promise<any> {
    try {
      if (!book) throw new AppError('Nome do livro é obrigatório', 400);
      return await this.repository.findByBook(book, options);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message, 500);
    }
  }

  /** Busca sugestões de busca */
  async findSuggestions(term: string, limit = 5): Promise<any[]> {
    try {
      if (!term || term.length < 2) return [];
      return await this.repository.findSuggestions(term, limit);
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca estatísticas dos sermões */
  async getStats(): Promise<any> {
    try {
      return await this.repository.getStats();
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca todas as séries únicas */
  async getAllSeries(): Promise<any[]> {
    try {
      return await this.repository.getAllSeries();
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca todos os pregadores únicos */
  async getAllSpeakers(): Promise<any[]> {
    try {
      return await this.repository.getAllSpeakers();
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca todos os livros únicos */
  async getAllBooks(): Promise<any[]> {
    try {
      return await this.repository.getAllBooks();
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca livros bíblicos únicos */
  async findUniqueBooks(): Promise<any[]> {
    try {
      return await this.repository.findUniqueBooks();
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca sermões populares */
  async findPopular(limit = 10): Promise<any[]> {
    try {
      return await this.repository.findPopular(limit);
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca sermões recentes */
  async findRecent(limit = 10): Promise<any[]> {
    try {
      return await this.repository.findRecent(limit);
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Busca sermões com filtros avançados */
  async search(filters: Record<string, any> = {}, options: Record<string, any> = {}): Promise<any> {
    try {
      return await this.repository.findSermons(filters, options);
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  /** Inicializa índices do banco de dados */
  async initializeIndexes(): Promise<void> {
    try {
      await this.repository.createSermonIndexes();
      console.log('✅ Índices dos sermões criados com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao criar índices dos sermões:', error.message);
    }
  }
}

export default new SermonService();
