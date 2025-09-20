import { Model, Document, PipelineStage } from 'mongoose';

/**
 * BaseRepository - Classe base para implementar o Repository Pattern
 * Fornece operações CRUD básicas e métodos comuns para todos os repositories
 */
export default class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao criar documento');
    }
  }

  async findById(id: string, options: any = {}): Promise<T | null> {
    try {
      let query = this.model.findById(id);
      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      return await query.exec();
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao buscar documento por ID');
    }
  }

  async findAll(filters: any = {}, options: any = {}): Promise<any> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        select,
        populate
      } = options;
      let query = this.model.find(filters);
      if (select) query = query.select(select);
      if (populate) query = query.populate(populate);
      query = query.sort(sort);
      const total = await this.model.countDocuments(filters);
      const skip = (page - 1) * limit;
      const documents = await query.skip(skip).limit(limit).exec();
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      return {
        data: documents,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        }
      };
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao buscar documentos');
    }
  }

  async updateById(id: string, updateData: Partial<T>, options: any = {}): Promise<T | null> {
    try {
      const { new: returnNew = true, runValidators = true } = options;
      const updatedDocument = await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: returnNew, runValidators, ...options }
      );
      if (!updatedDocument) {
        const notFoundError = new Error('Documento não encontrado');
        (notFoundError as any).isOperational = true;
        throw notFoundError;
      }
      return updatedDocument;
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao atualizar documento');
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      if (!result) {
        const notFoundError = new Error('Documento não encontrado');
        (notFoundError as any).isOperational = true;
        throw notFoundError;
      }
      return true;
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao remover documento');
    }
  }

  async findOne(criteria: any, options: any = {}): Promise<T | null> {
    try {
      let query = this.model.findOne(criteria);
      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      return await query.exec();
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao buscar documento');
    }
  }

  async count(filters: any = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filters);
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao contar documentos');
    }
  }

  async aggregate(pipeline: PipelineStage[]): Promise<any[]> {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao executar agregação');
    }
  }

  async exists(criteria: any): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(criteria);
      return count > 0;
    } catch (error: any) {
      throw this.handleError(error, 'Erro ao verificar existência');
    }
  }

  async search(searchTerm: string, options: any = {}): Promise<T[]> {
    try {
      const {
        fields = [],
        limit = 10,
        sort = { score: { $meta: 'textScore' } }
      } = options;
      if (fields.length === 0) {
        throw new Error('Campos de busca devem ser especificados');
      }
      const searchQuery = { $text: { $search: searchTerm } };
      let query = this.model.find(searchQuery);
      if (sort) query = query.sort(sort);
      if (limit) query = query.limit(limit);
      return await query.exec();
    } catch (error: any) {
      throw this.handleError(error, 'Erro na busca de texto');
    }
  }

  handleError(error: any, message: string): Error {
    console.error(`[${this.constructor.name}] ${message}:`, error);
    if (error.isOperational) return error;
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return new Error(`Erro de validação: ${validationErrors.join(', ')}`);
    }
    if (error.name === 'CastError') return new Error('ID inválido');
    if (error.code === 11000) return new Error('Documento duplicado');
    return new Error(message || 'Erro interno do servidor');
  }

  async createIndexes(indexes: Array<{ fields: any; options?: any }> = []): Promise<void> {
    try {
      for (const index of indexes) {
        await this.model.createIndex(index.fields, index.options);
      }
    } catch (error: any) {
      console.error(`[${this.constructor.name}] Erro ao criar índices:`, error);
    }
  }
}
